require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123';

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Requiere rol de administrador' });
  }
  next();
}

// Routes
app.get('/api/empresas', (req, res) => {
  const empresas = db.prepare('SELECT id, nombre, industria, dominio, logo_url, color_primario FROM empresas').all();
  res.json(empresas);
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ?').get(user.empresa_id);

  const token = jwt.sign({ id: user.id, empresa_id: user.empresa_id, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });

  res.json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      cargo: user.cargo,
      area: user.area,
      apto: user.apto_para_trabajar,
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        industria: empresa.industria,
        color_primario: empresa.color_primario,
        logo_url: empresa.logo_url
      }
    }
  });
});

app.get('/api/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const empresaId = req.user.empresa_id;

  const user = db.prepare('SELECT nombre, email, cargo, area, apto_para_trabajar FROM usuarios WHERE id = ?').get(userId);
  let cursos;
  if (req.user.rol === 'admin') {
    cursos = db.prepare('SELECT id, titulo, descripcion, imagen_url FROM cursos WHERE empresa_id = ?').all(empresaId);
  } else {
    cursos = db.prepare(`
      SELECT DISTINCT c.id, c.titulo, c.descripcion, c.imagen_url 
      FROM cursos c
      LEFT JOIN inscripciones_voluntarias iv ON c.id = iv.curso_id AND iv.usuario_id = ?
      WHERE c.empresa_id = ? AND (c.rol_requerido = ? OR iv.id IS NOT NULL)
    `).all(userId, empresaId, user.cargo);
  }
  const certificaciones = db.prepare('SELECT c.id, c.curso_id, c.fecha_emision, c.estado, cu.titulo FROM certificaciones c JOIN cursos cu ON c.curso_id = cu.id WHERE c.usuario_id = ?').all(userId);

  const cursosPendientes = cursos.filter(c => !certificaciones.find(cert => cert.titulo === c.titulo));

  const ranking = db.prepare(`
    SELECT u.nombre, COUNT(c.id) as puntaje 
    FROM usuarios u 
    LEFT JOIN certificaciones c ON u.id = c.usuario_id 
    WHERE u.empresa_id = ? AND u.rol = 'trabajador' 
    GROUP BY u.id 
    ORDER BY puntaje DESC 
    LIMIT 3
  `).all(empresaId);

  res.json({
    user,
    stats: {
      total_asignados: cursos.length,
      completados: certificaciones.length,
      pendientes: cursosPendientes.length
    },
    cursosPendientes,
    certificaciones,
    ranking
  });
});

app.put('/api/perfil', authenticateToken, (req, res) => {
  const { nombre, area } = req.body;
  // Solo se permite actualizar el área y el nombre, no el cargo
  db.prepare('UPDATE usuarios SET nombre = ?, area = ? WHERE id = ?').run(nombre, area, req.user.id);
  res.json({ success: true });
});

app.get('/api/notificaciones', authenticateToken, (req, res) => {
  const notifs = db.prepare('SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY fecha DESC').all(req.user.id);
  res.json(notifs);
});

app.post('/api/notificaciones/read', authenticateToken, (req, res) => {
  db.prepare('UPDATE notificaciones SET leida = 1 WHERE usuario_id = ?').run(req.user.id);
  res.json({ success: true });
});

app.get('/api/cursos', authenticateToken, (req, res) => {
  if (req.user.rol === 'admin') {
    const cursos = db.prepare('SELECT id, titulo, descripcion, imagen_url FROM cursos WHERE empresa_id = ?').all(req.user.empresa_id);
    return res.json(cursos);
  } else {
    // Filtrar por rol para trabajadores
    const user = db.prepare('SELECT cargo FROM usuarios WHERE id = ?').get(req.user.id);
    const cursos = db.prepare('SELECT id, titulo, descripcion, imagen_url FROM cursos WHERE empresa_id = ? AND rol_requerido = ?').all(req.user.empresa_id, user.cargo);
    return res.json(cursos);
  }
});

// ================== RUTAS DE CATÁLOGO LIBRE ==================
app.get('/api/catalogo', authenticateToken, (req, res) => {
  // Cursos que no tienen un rol requerido específico o son "Todos"
  const cursos = db.prepare(`
    SELECT id, titulo, descripcion, imagen_url 
    FROM cursos 
    WHERE empresa_id = ? AND (rol_requerido IS NULL OR rol_requerido = '' OR rol_requerido = 'Todos')
  `).all(req.user.empresa_id);
  res.json(cursos);
});

app.post('/api/catalogo/inscribir', authenticateToken, (req, res) => {
  const { cursoId } = req.body;

  // Verificamos que no esté inscrito ya y que no tenga certificación
  const tieneCert = db.prepare('SELECT id FROM certificaciones WHERE usuario_id = ? AND curso_id = ?').get(req.user.id, cursoId);
  if (tieneCert) {
    return res.status(400).json({ error: 'Ya estás certificado en este curso' });
  }

  // Registramos la inscripción
  const yaInscrito = db.prepare('SELECT id FROM inscripciones_voluntarias WHERE usuario_id = ? AND curso_id = ?').get(req.user.id, cursoId);
  if (!yaInscrito) {
    db.prepare('INSERT INTO inscripciones_voluntarias (usuario_id, curso_id) VALUES (?, ?)').run(req.user.id, cursoId);
  }

  res.json({ success: true, message: 'Inscrito correctamente' });
});

app.get('/api/cursos/:id', authenticateToken, (req, res) => {
  const curso = db.prepare('SELECT * FROM cursos WHERE id = ?').get(req.params.id);
  if (!curso) return res.status(404).json({ error: 'Curso no encontrado' });

  const modulos = db.prepare('SELECT * FROM modulos WHERE curso_id = ? ORDER BY orden ASC').all(curso.id);
  res.json({ curso, modulos });
});

app.get('/api/cursos/:id/evaluacion', authenticateToken, (req, res) => {
  const evaluacion = db.prepare('SELECT * FROM evaluaciones WHERE curso_id = ?').get(req.params.id);
  if (!evaluacion) return res.json({ preguntas: [] });
  res.json({ preguntas: JSON.parse(evaluacion.preguntas_json) });
});

app.post('/api/cursos/:id/certificar', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { aprobado } = req.body;

  if (aprobado) {
    const existing = db.prepare('SELECT id FROM certificaciones WHERE usuario_id = ? AND curso_id = ?').get(userId, id);
    if (!existing) {
      db.prepare('INSERT INTO certificaciones (usuario_id, curso_id, estado) VALUES (?, ?, ?)').run(userId, id, 'Completado');
      db.prepare('DELETE FROM intentos_evaluacion WHERE usuario_id = ? AND curso_id = ?').run(userId, id);
    }
    res.json({ success: true, message: 'Certificación obtenida' });
  } else {
    // Manejar intentos
    let intentoObj = db.prepare('SELECT intentos FROM intentos_evaluacion WHERE usuario_id = ? AND curso_id = ?').get(userId, id);
    if (!intentoObj) {
      db.prepare('INSERT INTO intentos_evaluacion (usuario_id, curso_id, intentos) VALUES (?, ?, ?)').run(userId, id, 1);
      intentoObj = { intentos: 1 };
    } else {
      intentoObj.intentos += 1;
      db.prepare('UPDATE intentos_evaluacion SET intentos = ? WHERE usuario_id = ? AND curso_id = ?').run(intentoObj.intentos, userId, id);
    }

    if (intentoObj.intentos >= 3) {
      // Reset progreso
      db.prepare('DELETE FROM progreso_usuario WHERE usuario_id = ? AND modulo_id IN (SELECT id FROM modulos WHERE curso_id = ?)').run(userId, id);
      db.prepare('DELETE FROM intentos_evaluacion WHERE usuario_id = ? AND curso_id = ?').run(userId, id);

      // Notificar al admin
      const admin = db.prepare('SELECT id FROM usuarios WHERE empresa_id = ? AND rol = ? LIMIT 1').get(req.user.empresa_id, 'admin');
      if (admin) {
        const userFail = db.prepare('SELECT nombre FROM usuarios WHERE id = ?').get(userId);
        const cursoFail = db.prepare('SELECT titulo FROM cursos WHERE id = ?').get(id);
        db.prepare('INSERT INTO notificaciones (usuario_id, mensaje) VALUES (?, ?)').run(admin.id, `El usuario ${userFail.nombre} ha reprobado 3 veces el curso: ${cursoFail.titulo}.`);
      }
      return res.json({ success: false, message: 'Has reprobado 3 veces. Tu progreso ha sido reiniciado y se ha notificado al administrador.', reset: true });
    }

    res.json({ success: false, message: `Evaluación reprobada. Llevas ${intentoObj.intentos} de 3 intentos permitidos.`, intentos: intentoObj.intentos });
  }
});

// Endpoint para encuestas
app.post('/api/cursos/:id/encuesta', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { calificacion, comentario } = req.body;

  db.prepare('INSERT INTO encuestas_satisfaccion (usuario_id, curso_id, calificacion, comentario) VALUES (?, ?, ?, ?)').run(userId, id, calificacion, comentario);
  res.json({ success: true });
});

// Endpoint para Certificado PDF
app.get('/api/cursos/:id/certificado-pdf', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cursoId = req.params.id;

    // Verificar certificación
    const cert = db.prepare('SELECT c.fecha_emision, cu.titulo FROM certificaciones c JOIN cursos cu ON c.curso_id = cu.id WHERE c.usuario_id = ? AND c.curso_id = ?').get(userId, cursoId);
    if (!cert) return res.status(403).json({ error: 'No tienes certificación para este curso' });

    const user = db.prepare('SELECT nombre, cargo FROM usuarios WHERE id = ?').get(userId);
    const empresa = db.prepare('SELECT nombre FROM empresas WHERE id = ?').get(req.user.empresa_id);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Decoración simple
    page.drawRectangle({
      x: 20, y: 20, width: width - 40, height: height - 40,
      borderColor: rgb(0, 0.4, 0.8), borderWidth: 5
    });

    page.drawText('Certificado de Aprobación', { x: width / 2 - 180, y: height - 100, size: 30, font: fontBold, color: rgb(0, 0.3, 0.6) });

    page.drawText('Se otorga el presente certificado a:', { x: width / 2 - 130, y: height - 160, size: 16, font });
    page.drawText(user.nombre.toUpperCase(), { x: width / 2 - 100, y: height - 210, size: 24, font: fontBold });
    page.drawText(`Cargo: ${user.cargo} - Empresa: ${empresa.nombre}`, { x: width / 2 - 140, y: height - 250, size: 14, font });

    page.drawText('Por haber completado y aprobado satisfactoriamente el curso:', { x: width / 2 - 200, y: height - 300, size: 14, font });
    page.drawText(cert.titulo.toUpperCase(), { x: width / 2 - 150, y: height - 340, size: 20, font: fontBold, color: rgb(0, 0, 0) });

    page.drawText(`Fecha de Emisión: ${new Date(cert.fecha_emision).toLocaleDateString()}`, { x: width / 2 - 80, y: height - 380, size: 12, font });

    // Firma
    page.drawText('Jesus Poturo', { x: width - 250, y: 150, size: 20, font: fontBold, color: rgb(0, 0.2, 0.5) });
    page.drawText('CEO / Scrum Master - NeoUA', { x: width - 260, y: 130, size: 12, font });
    page.drawLine({ start: { x: width - 280, y: 145 }, end: { x: width - 100, y: 145 }, thickness: 1 });

    // Validaciones
    page.drawText('Validado según normativas SENCE y Dirección del Trabajo. Código del curso sujeto a revisión de la autoridad.', { x: 50, y: 60, size: 10, font, color: rgb(0.3, 0.3, 0.3) });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificado_${cert.titulo.replace(/\s+/g, '_')}.pdf`);
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generando PDF' });
  }
});

// Admin Endpoints
app.get('/api/admin/colaboradores', authenticateToken, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, nombre, email, rol, cargo, area, apto_para_trabajar FROM usuarios WHERE empresa_id = ?').all(req.user.empresa_id);
  // Attach cert count
  const result = users.map(u => {
    const count = db.prepare('SELECT COUNT(*) as c FROM certificaciones WHERE usuario_id = ?').get(u.id).c;
    return { ...u, certificaciones: count };
  });
  res.json(result);
});

app.put('/api/admin/colaboradores/:id', authenticateToken, requireAdmin, (req, res) => {
  const { apto_para_trabajar, rol } = req.body;
  if (apto_para_trabajar !== undefined) {
    db.prepare('UPDATE usuarios SET apto_para_trabajar = ? WHERE id = ?').run(apto_para_trabajar ? 1 : 0, req.params.id);
  }
  if (rol) {
    db.prepare('UPDATE usuarios SET rol = ? WHERE id = ?').run(rol, req.params.id);
  }
  res.json({ success: true });
});

app.get('/api/admin/metricas', authenticateToken, requireAdmin, (req, res) => {
  const totalUsuarios = db.prepare('SELECT COUNT(*) as c FROM usuarios WHERE empresa_id = ?').get(req.user.empresa_id).c;
  const totalCertificaciones = db.prepare('SELECT COUNT(*) as c FROM certificaciones c JOIN cursos cu ON c.curso_id = cu.id WHERE cu.empresa_id = ?').get(req.user.empresa_id).c;

  // Datos para gráficos
  const cursosDept = db.prepare('SELECT cargo, COUNT(*) as cantidad FROM usuarios WHERE empresa_id = ? GROUP BY cargo').all(req.user.empresa_id);

  // Certificaciones recientes para grafico de lineas
  const certTimeline = db.prepare('SELECT strftime(\'%Y-%m\', fecha_emision) as mes, COUNT(*) as cantidad FROM certificaciones c JOIN usuarios u ON c.usuario_id = u.id WHERE u.empresa_id = ? GROUP BY mes ORDER BY mes ASC LIMIT 6').all(req.user.empresa_id);

  res.json({ totalUsuarios, totalCertificaciones, cursosDept, certTimeline });
});

app.post('/api/admin/colaboradores', authenticateToken, requireAdmin, (req, res) => {
  const { nombre, email, password, cargo, area } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  try {
    db.prepare('INSERT INTO usuarios (empresa_id, nombre, email, password, rol, cargo, area, apto_para_trabajar) VALUES (?, ?, ?, ?, ?, ?, ?, 1)')
      .run(req.user.empresa_id, nombre, email, hash, 'trabajador', cargo, area);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Error al registrar colaborador' });
  }
});

app.post('/api/admin/cursos', authenticateToken, requireAdmin, (req, res) => {
  const { titulo, descripcion, imagen_url, rol_requerido, modulos, evaluacion } = req.body;

  const insertCurso = db.prepare('INSERT INTO cursos (empresa_id, titulo, descripcion, imagen_url, rol_requerido) VALUES (?, ?, ?, ?, ?)');
  const result = insertCurso.run(req.user.empresa_id, titulo, descripcion, imagen_url, rol_requerido);
  const cursoId = result.lastInsertRowid;

  const insertModulo = db.prepare('INSERT INTO modulos (curso_id, titulo, contenido, orden) VALUES (?, ?, ?, ?)');
  modulos.forEach((m, i) => {
    insertModulo.run(cursoId, m.titulo, m.contenido, i + 1);
  });

  const insertEval = db.prepare('INSERT INTO evaluaciones (curso_id, preguntas_json) VALUES (?, ?)');
  insertEval.run(cursoId, JSON.stringify(evaluacion));

  res.json({ success: true });
});

app.get('/api/admin/reporte', authenticateToken, requireAdmin, (req, res) => {
  const usuarios = db.prepare('SELECT id, nombre, email, cargo, area, apto_para_trabajar FROM usuarios WHERE empresa_id = ? AND rol = "trabajador"').all(req.user.empresa_id);

  let csv = 'Nombre,Email,Cargo,Area,Apto,Certificaciones\n';

  usuarios.forEach(u => {
    const certs = db.prepare('SELECT COUNT(*) as c FROM certificaciones WHERE usuario_id = ?').get(u.id).c;
    csv += `${u.nombre},${u.email},${u.cargo},${u.area},${u.apto_para_trabajar ? 'Si' : 'No'},${certs}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte_mensual.csv');
  res.send(csv);
});

app.post('/api/admin/cursos/asignar', authenticateToken, requireAdmin, (req, res) => {
  // Simulate assigning a course by sending a notification
  const { userId, cursoId } = req.body;
  const curso = db.prepare('SELECT titulo FROM cursos WHERE id = ?').get(cursoId);
  db.prepare('INSERT INTO notificaciones (usuario_id, mensaje) VALUES (?, ?)').run(userId, `Nuevo curso asignado: ${curso.titulo}`);
  res.json({ success: true });
});

// Documentos Endpoints
app.get('/api/documentos', authenticateToken, (req, res) => {
  const docs = db.prepare('SELECT * FROM documentos_medicos WHERE usuario_id = ?').all(req.user.id);
  res.json(docs);
});

app.post('/api/documentos', authenticateToken, (req, res) => {
  const { nombre_archivo } = req.body;
  // Automatically validate for simulation purposes
  db.prepare('INSERT INTO documentos_medicos (usuario_id, nombre_archivo, validado) VALUES (?, ?, 1)').run(req.user.id, nombre_archivo);
  res.json({ success: true });
});

// AI Chat
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  const { question, context } = req.body;
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return res.json({
      answer: `Esta es una respuesta simulada. Pregunta: "${question}". Te sugiero repasar el módulo.`
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const prompt = `Actúa como un tutor corporativo experto. El contexto del curso es: ${context}. El usuario pregunta: ${question}. Responde de forma clara, pedagógica y breve.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude procesar la respuesta.';

    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al contactar IA' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
