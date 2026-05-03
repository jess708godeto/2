const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDb() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS empresas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      industria TEXT NOT NULL,
      dominio TEXT NOT NULL UNIQUE,
      logo_url TEXT,
      color_primario TEXT
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'trabajador',
      cargo TEXT DEFAULT 'Por definir',
      area TEXT DEFAULT 'General',
      apto_para_trabajar BOOLEAN DEFAULT 1,
      FOREIGN KEY (empresa_id) REFERENCES empresas (id)
    );

    CREATE TABLE IF NOT EXISTS cursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      imagen_url TEXT,
      rol_requerido TEXT,
      FOREIGN KEY (empresa_id) REFERENCES empresas (id)
    );

    CREATE TABLE IF NOT EXISTS modulos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      curso_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      contenido TEXT NOT NULL,
      orden INTEGER NOT NULL,
      FOREIGN KEY (curso_id) REFERENCES cursos (id)
    );

    CREATE TABLE IF NOT EXISTS evaluaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      curso_id INTEGER NOT NULL,
      preguntas_json TEXT NOT NULL,
      FOREIGN KEY (curso_id) REFERENCES cursos (id)
    );

    CREATE TABLE IF NOT EXISTS certificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      curso_id INTEGER NOT NULL,
      fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_vencimiento DATETIME,
      estado TEXT DEFAULT 'Completado',
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
      FOREIGN KEY (curso_id) REFERENCES cursos (id)
    );

    CREATE TABLE IF NOT EXISTS progreso_usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      modulo_id INTEGER NOT NULL,
      completado BOOLEAN DEFAULT 0,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
      FOREIGN KEY (modulo_id) REFERENCES modulos (id)
    );

    CREATE TABLE IF NOT EXISTS intentos_evaluacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      curso_id INTEGER NOT NULL,
      intentos INTEGER DEFAULT 0,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
      FOREIGN KEY (curso_id) REFERENCES cursos (id)
    );

    CREATE TABLE IF NOT EXISTS encuestas_satisfaccion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      curso_id INTEGER NOT NULL,
      calificacion INTEGER NOT NULL,
      comentario TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
      FOREIGN KEY (curso_id) REFERENCES cursos (id)
    );

    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      mensaje TEXT NOT NULL,
      leida BOOLEAN DEFAULT 0,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    );

    CREATE TABLE IF NOT EXISTS inscripciones_voluntarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      curso_id INTEGER NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
      FOREIGN KEY (curso_id) REFERENCES cursos (id)
    );

    CREATE TABLE IF NOT EXISTS documentos_medicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      nombre_archivo TEXT NOT NULL,
      url TEXT,
      validado BOOLEAN DEFAULT 0,
      fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    );
  `);

  const empresasCount = db.prepare("SELECT COUNT(*) as count FROM empresas").get();
  
  if (empresasCount.count === 0) {
    console.log("Seeding database...");
    
    // Seed Empresas
    const insertEmpresa = db.prepare(`INSERT INTO empresas (nombre, industria, dominio, color_primario, logo_url) VALUES (?, ?, ?, ?, ?)`);
    insertEmpresa.run('Chilexpress', 'Logística', '@chilexpress.cl', '#f59e0b', '/logos/chilexpress.png');
    insertEmpresa.run('Clinica Indisa', 'Salud', '@clinicaindisa.cl', '#10b981', '/logos/indisa.png');
    insertEmpresa.run('Ripley', 'Retail', '@ripley.cl', '#3b82f6', '/logos/ripley.png');

    // Seed Usuarios
    const hash = bcrypt.hashSync('password123', 10);
    const insertUsuario = db.prepare(`INSERT INTO usuarios (empresa_id, nombre, email, password, rol, cargo, area) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    
    // Admins
    insertUsuario.run(1, 'Admin Logística', 'admin@chilexpress.cl', hash, 'admin', 'Gerente RRHH', 'Recursos Humanos');
    insertUsuario.run(2, 'Admin Salud', 'admin@clinicaindisa.cl', hash, 'admin', 'Director Médico', 'Administración');
    insertUsuario.run(3, 'Admin Retail', 'admin@ripley.cl', hash, 'admin', 'Jefe de Capacitación', 'Capacitación');

    // Workers
    insertUsuario.run(1, 'Juan Pérez', 'juan.perez@chilexpress.cl', hash, 'trabajador', 'Operador de Montacargas', 'Bodega Central');
    insertUsuario.run(1, 'Carlos Silva', 'carlos.silva@chilexpress.cl', hash, 'trabajador', 'Supervisor de Logística', 'Despachos');
    insertUsuario.run(1, 'Pedro Lagos', 'pedro.lagos@chilexpress.cl', hash, 'trabajador', 'Conductor de Reparto', 'Distribución');

    insertUsuario.run(2, 'Ana Gómez', 'ana.gomez@clinicaindisa.cl', hash, 'trabajador', 'Enfermera Clínica', 'Urgencias');
    insertUsuario.run(2, 'Dra. María Paz', 'maria.paz@clinicaindisa.cl', hash, 'trabajador', 'Médico General', 'Medicina Interna');
    insertUsuario.run(2, 'Camila Soto', 'camila.soto@clinicaindisa.cl', hash, 'trabajador', 'TENS', 'Pabellón');

    insertUsuario.run(3, 'Luis Rojas', 'luis.rojas@ripley.cl', hash, 'trabajador', 'Cajero', 'Ventas');
    insertUsuario.run(3, 'Sofía Castro', 'sofia.castro@ripley.cl', hash, 'trabajador', 'Asesor de Ventas', 'Electrónica');
    insertUsuario.run(3, 'Javier Díaz', 'javier.diaz@ripley.cl', hash, 'trabajador', 'Jefe de Tienda', 'Administración');

    // Cursos Data
    const cursosData = [
      // Chilexpress
      { emp: 1, rol: 'Operador de Montacargas', tit: 'Manejo de Montacargas', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=500&q=60' },
      { emp: 1, rol: 'Operador de Montacargas', tit: 'Seguridad en Carga', img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=500&q=60' },
      { emp: 1, rol: 'Operador de Montacargas', tit: 'Mantenimiento Preventivo', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=60' },
      
      { emp: 1, rol: 'Supervisor de Logística', tit: 'Gestión de Inventarios', img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=500&q=60' },
      { emp: 1, rol: 'Supervisor de Logística', tit: 'Liderazgo de Equipos', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=60' },
      { emp: 1, rol: 'Supervisor de Logística', tit: 'Normativas de Seguridad', img: 'https://images.unsplash.com/photo-1580828369019-2238b9175399?auto=format&fit=crop&w=500&q=60' },

      { emp: 1, rol: 'Conductor de Reparto', tit: 'Conducción Segura', img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=500&q=60' },
      { emp: 1, rol: 'Conductor de Reparto', tit: 'Rutas Eficientes', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=500&q=60' },
      { emp: 1, rol: 'Conductor de Reparto', tit: 'Atención en Entregas', img: 'https://images.unsplash.com/photo-1574607407408-1e681c46041d?auto=format&fit=crop&w=500&q=60' },

      // Clinica Indisa
      { emp: 2, rol: 'Enfermera Clínica', tit: 'Higiene de Manos', img: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=500&q=60' },
      { emp: 2, rol: 'Enfermera Clínica', tit: 'Manejo de Pacientes', img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=60' },
      { emp: 2, rol: 'Enfermera Clínica', tit: 'Protocolos Covid', img: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=500&q=60' },

      { emp: 2, rol: 'Médico General', tit: 'Procedimientos Clínicos Básicos', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=60' },
      { emp: 2, rol: 'Médico General', tit: 'Uso de Ficha Electrónica', img: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=500&q=60' },
      { emp: 2, rol: 'Médico General', tit: 'Ética Médica', img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=500&q=60' },

      { emp: 2, rol: 'TENS', tit: 'Primeros Auxilios', img: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=500&q=60' },
      { emp: 2, rol: 'TENS', tit: 'Administración de Medicamentos', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=500&q=60' },
      { emp: 2, rol: 'TENS', tit: 'Cuidados Básicos', img: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=500&q=60' },

      // Ripley
      { emp: 3, rol: 'Cajero', tit: 'Atención al Cliente', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=500&q=60' },
      { emp: 3, rol: 'Cajero', tit: 'Manejo de Caja', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=500&q=60' },
      { emp: 3, rol: 'Cajero', tit: 'Prevención de Fraudes', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=500&q=60' },

      { emp: 3, rol: 'Asesor de Ventas', tit: 'Técnicas de Venta', img: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=500&q=60' },
      { emp: 3, rol: 'Asesor de Ventas', tit: 'Conocimiento de Productos', img: 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?auto=format&fit=crop&w=500&q=60' },
      { emp: 3, rol: 'Asesor de Ventas', tit: 'Fidelización', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=500&q=60' },

      { emp: 3, rol: 'Jefe de Tienda', tit: 'Gestión de Tienda', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=60' },
      { emp: 3, rol: 'Jefe de Tienda', tit: 'Resolución de Conflictos', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=60' },
      { emp: 3, rol: 'Jefe de Tienda', tit: 'Merchandising', img: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=500&q=60' },
      
      // Catálogo Libre (Rol Requerido = 'Todos')
      { emp: 1, rol: 'Todos', tit: 'Excel Básico para Operaciones', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=500&q=60' },
      { emp: 1, rol: 'Todos', tit: 'Manejo del Estrés Laboral', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=60' },
      { emp: 1, rol: 'Todos', tit: 'Inglés Logístico', img: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=500&q=60' },
      
      { emp: 2, rol: 'Todos', tit: 'Inteligencia Emocional', img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=500&q=60' },
      { emp: 2, rol: 'Todos', tit: 'Lenguaje de Señas Básico', img: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=500&q=60' },
      { emp: 2, rol: 'Todos', tit: 'Nutrición Preventiva', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=60' },

      { emp: 3, rol: 'Todos', tit: 'Liderazgo Positivo', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=60' },
      { emp: 3, rol: 'Todos', tit: 'Finanzas Personales', img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=60' },
      { emp: 3, rol: 'Todos', tit: 'Innovación en Retail', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=500&q=60' }
    ];

    const insertCurso = db.prepare(`INSERT INTO cursos (empresa_id, titulo, descripcion, imagen_url, rol_requerido) VALUES (?, ?, ?, ?, ?)`);
    const insertModulo = db.prepare(`INSERT INTO modulos (curso_id, titulo, contenido, orden) VALUES (?, ?, ?, ?)`);
    const insertEvaluacion = db.prepare(`INSERT INTO evaluaciones (curso_id, preguntas_json) VALUES (?, ?)`);

    let cursoIdCount = 1;
    for (const c of cursosData) {
      insertCurso.run(c.emp, c.tit, `Curso obligatorio para ${c.rol}.`, c.img, c.rol);
      
      // Módulos genéricos
      insertModulo.run(cursoIdCount, `Introducción a ${c.tit}`, `Contenido introductorio para el curso de ${c.tit}...`, 1);
      insertModulo.run(cursoIdCount, `Conceptos Clave de ${c.tit}`, `Aquí profundizamos en ${c.tit}...`, 2);

      // Evaluación genérica
      const preguntas = [
        { q: `¿Cuál es el objetivo principal de ${c.tit}?`, options: ['Aprender los conceptos', 'Nada', 'No sé'], correct: 0 },
        { q: `¿Es importante este conocimiento para ${c.rol}?`, options: ['No', 'Sí, fundamental', 'A veces'], correct: 1 }
      ];
      insertEvaluacion.run(cursoIdCount, JSON.stringify(preguntas));
      
      cursoIdCount++;
    }

    // Seed Notificaciones para probar
    const insertNotif = db.prepare(`INSERT INTO notificaciones (usuario_id, mensaje) VALUES (?, ?)`);
    insertNotif.run(4, 'Bienvenido a NeoUA. Revisa tus cursos de Operador de Montacargas.');
    insertNotif.run(5, 'Bienvenido a NeoUA. Revisa tus cursos de Enfermera Clínica.');
    insertNotif.run(6, 'Bienvenido a NeoUA. Revisa tus cursos de Cajero.');
  }
}

initDb();

module.exports = db;
