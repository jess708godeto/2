import { useState, useEffect } from 'react';
import { Users, BarChart3, BookOpen, ShieldCheck, XCircle, Search, UserPlus, PlusCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const AdminPanel = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('colaboradores'); // colaboradores, cursos
  
  const [colaboradores, setColaboradores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para creación de colaborador
  const [showColabModal, setShowColabModal] = useState(false);
  const [newColab, setNewColab] = useState({ nombre: '', email: '', password: '', cargo: '', area: '' });

  // Estados para creación de curso
  const [showCursoWizard, setShowCursoWizard] = useState(false);
  const [cursoStep, setCursoStep] = useState(1);
  const [newCurso, setNewCurso] = useState({
    titulo: '', descripcion: '', imagen_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3', rol_requerido: '',
    modulos: [{ titulo: '', contenido: '' }],
    evaluacion: [{ q: '', options: ['', '', '', ''], correct: 0 }]
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'colaboradores') {
        const res = await api.get('/admin/colaboradores');
        setColaboradores(res.data);
      } else if (activeTab === 'cursos') {
        const resColab = await api.get('/admin/colaboradores');
        setColaboradores(resColab.data);
        const resCursos = await api.get('/cursos');
        setCursos(resCursos.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApto = async (id, currentApto) => {
    try {
      await api.put(`/admin/colaboradores/${id}`, { apto_para_trabajar: !currentApto });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const assignCourse = async (userId, cursoId) => {
    try {
      await api.post('/admin/cursos/asignar', { userId, cursoId });
      alert('Curso asignado (Notificación enviada)');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCrearColaborador = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/colaboradores', newColab);
      setShowColabModal(false);
      setNewColab({ nombre: '', email: '', password: '', cargo: '', area: '' });
      fetchData();
      alert('Colaborador creado exitosamente');
    } catch (err) {
      alert('Error al crear colaborador');
    }
  };

  const handleCrearCurso = async () => {
    try {
      await api.post('/admin/cursos', newCurso);
      setShowCursoWizard(false);
      setCursoStep(1);
      setNewCurso({
        titulo: '', descripcion: '', imagen_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3', rol_requerido: '',
        modulos: [{ titulo: '', contenido: '' }],
        evaluacion: [{ q: '', options: ['', '', '', ''], correct: 0 }]
      });
      fetchData();
      alert('Curso creado exitosamente');
    } catch (err) {
      alert('Error al crear curso');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Herramientas de Gestión</h1>
        <p className="text-gray-400">Gestiona los colaboradores y capacitaciones de {user?.empresa?.nombre}.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('colaboradores')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'colaboradores' ? 'bg-primary text-white' : 'bg-surface text-gray-400 hover:bg-white/5'}`}
        >
          <Users size={18} /> Colaboradores
        </button>
        <button 
          onClick={() => setActiveTab('cursos')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'cursos' ? 'bg-primary text-white' : 'bg-surface text-gray-400 hover:bg-white/5'}`}
        >
          <BookOpen size={18} /> Capacitaciones
        </button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="bg-surface border border-white/5 rounded-2xl shadow-xl overflow-hidden min-h-[500px] relative">

          {/* TAB: COLABORADORES */}
          {activeTab === 'colaboradores' && (
            <div>
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold">Gestión de Colaboradores</h2>
                <button 
                  onClick={() => setShowColabModal(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  <UserPlus size={18} /> Registrar Colaborador
                </button>
              </div>

              {/* Lista */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/20 text-gray-400 text-sm">
                      <th className="p-4 font-medium border-b border-white/5">Nombre / Email</th>
                      <th className="p-4 font-medium border-b border-white/5">Cargo / Área</th>
                      <th className="p-4 font-medium border-b border-white/5 text-center">Certificaciones</th>
                      <th className="p-4 font-medium border-b border-white/5 text-center">Estado (Apto)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colaboradores.map(colab => (
                      <tr key={colab.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-4">
                          <p className="font-bold">{colab.nombre}</p>
                          <p className="text-xs text-gray-400">{colab.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{colab.cargo}</p>
                          <p className="text-xs text-gray-400">{colab.area}</p>
                        </td>
                        <td className="p-4 text-center font-bold text-blue-400">
                          {colab.certificaciones}
                        </td>
                        <td className="p-4 text-center">
                          {colab.apto_para_trabajar ? (
                            <div className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs border border-emerald-500/20 cursor-pointer" onClick={() => toggleApto(colab.id, true)}>
                              <ShieldCheck size={14} /> Sí
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs border border-red-500/20 cursor-pointer" onClick={() => toggleApto(colab.id, false)}>
                              <XCircle size={14} /> No
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CURSOS */}
          {activeTab === 'cursos' && !showCursoWizard && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Gestión de Cursos</h2>
                <button 
                  onClick={() => setShowCursoWizard(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  <PlusCircle size={18} /> Crear Nuevo Curso
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-400">Cursos Actuales</h3>
                  <div className="bg-black/20 rounded-xl border border-white/5 p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {cursos.map(c => (
                      <div key={c.id} className="flex justify-between items-center bg-surface p-3 rounded-lg border border-white/5">
                        <div>
                          <p className="font-bold">{c.titulo}</p>
                          <p className="text-xs text-gray-400">Rol: {c.rol_requerido || 'Todos'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WIZARD CREAR CURSO */}
          {activeTab === 'cursos' && showCursoWizard && (
            <div className="p-8">
              <div className="mb-8 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Crear Nuevo Curso - Paso {cursoStep} de 3</h2>
                <button onClick={() => setShowCursoWizard(false)} className="text-gray-400 hover:text-white">Cancelar</button>
              </div>

              {cursoStep === 1 && (
                <div className="space-y-4 max-w-2xl">
                  <div><label className="block text-sm mb-1 text-gray-400">Título del Curso</label><input type="text" className="w-full bg-black/20 p-3 rounded-lg border border-white/10" value={newCurso.titulo} onChange={e=>setNewCurso({...newCurso, titulo: e.target.value})} /></div>
                  <div><label className="block text-sm mb-1 text-gray-400">Descripción</label><textarea className="w-full bg-black/20 p-3 rounded-lg border border-white/10" value={newCurso.descripcion} onChange={e=>setNewCurso({...newCurso, descripcion: e.target.value})} /></div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Rol Requerido</label>
                    <input type="text" placeholder="Ej: Cajero, Ejecutivo, o escribe 'Todos'" className="w-full bg-black/20 p-3 rounded-lg border border-white/10" value={newCurso.rol_requerido} onChange={e=>setNewCurso({...newCurso, rol_requerido: e.target.value})} />
                    <p className="text-xs text-blue-400 mt-2 font-medium">✨ Escribe "Todos" (o déjalo en blanco) para que el curso sea Opcional y aparezca en el Catálogo Libre de los trabajadores.</p>
                  </div>
                  <button onClick={() => setCursoStep(2)} disabled={!newCurso.titulo} className="w-full bg-primary py-3 rounded-lg font-bold mt-4 disabled:opacity-50">Siguiente: Módulos</button>
                </div>
              )}

              {cursoStep === 2 && (
                <div className="space-y-6 max-w-2xl">
                  {newCurso.modulos.map((m, i) => (
                    <div key={i} className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-3">
                      <p className="font-bold text-sm text-primary">Módulo {i+1}</p>
                      <input type="text" placeholder="Título del Módulo" className="w-full bg-surface p-2 rounded border border-white/10" value={m.titulo} onChange={e => {
                        const mods = [...newCurso.modulos]; mods[i].titulo = e.target.value; setNewCurso({...newCurso, modulos: mods});
                      }} />
                      <textarea placeholder="Contenido o texto del módulo..." className="w-full bg-surface p-2 rounded border border-white/10 h-24" value={m.contenido} onChange={e => {
                        const mods = [...newCurso.modulos]; mods[i].contenido = e.target.value; setNewCurso({...newCurso, modulos: mods});
                      }} />
                    </div>
                  ))}
                  <button onClick={() => setNewCurso({...newCurso, modulos: [...newCurso.modulos, {titulo:'', contenido:''}]})} className="text-primary text-sm font-bold">+ Añadir otro módulo</button>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setCursoStep(1)} className="px-6 py-3 bg-surface rounded-lg font-bold w-1/3">Atrás</button>
                    <button onClick={() => setCursoStep(3)} className="px-6 py-3 bg-primary rounded-lg font-bold w-2/3">Siguiente: Evaluación</button>
                  </div>
                </div>
              )}

              {cursoStep === 3 && (
                <div className="space-y-6 max-w-2xl">
                  {newCurso.evaluacion.map((ev, i) => (
                    <div key={i} className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-3">
                      <p className="font-bold text-sm text-orange-400">Pregunta {i+1}</p>
                      <input type="text" placeholder="Pregunta" className="w-full bg-surface p-2 rounded border border-white/10" value={ev.q} onChange={e => {
                        const evs = [...newCurso.evaluacion]; evs[i].q = e.target.value; setNewCurso({...newCurso, evaluacion: evs});
                      }} />
                      {ev.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex gap-2 items-center">
                          <input type="radio" name={`correct_${i}`} checked={ev.correct === optIdx} onChange={() => {
                            const evs = [...newCurso.evaluacion]; evs[i].correct = optIdx; setNewCurso({...newCurso, evaluacion: evs});
                          }} />
                          <input type="text" placeholder={`Opción ${optIdx + 1}`} className="flex-1 bg-surface p-2 rounded border border-white/10 text-sm" value={opt} onChange={e => {
                            const evs = [...newCurso.evaluacion]; evs[i].options[optIdx] = e.target.value; setNewCurso({...newCurso, evaluacion: evs});
                          }} />
                        </div>
                      ))}
                    </div>
                  ))}
                  <button onClick={() => setNewCurso({...newCurso, evaluacion: [...newCurso.evaluacion, {q:'', options:['','','',''], correct:0}]})} className="text-orange-400 text-sm font-bold">+ Añadir otra pregunta</button>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setCursoStep(2)} className="px-6 py-3 bg-surface rounded-lg font-bold w-1/3">Atrás</button>
                    <button onClick={handleCrearCurso} className="px-6 py-3 bg-emerald-600 rounded-lg font-bold w-2/3">Crear Curso Definitivo</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODAL CREAR COLABORADOR */}
          {showColabModal && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-surface border border-white/10 p-8 rounded-2xl w-full max-w-md">
                <h3 className="text-2xl font-bold mb-6">Registrar Colaborador</h3>
                <form onSubmit={handleCrearColaborador} className="space-y-4">
                  <div><label className="text-sm text-gray-400 block mb-1">Nombre</label><input required className="w-full bg-black/40 p-3 rounded-lg border border-white/5" value={newColab.nombre} onChange={e=>setNewColab({...newColab, nombre: e.target.value})} /></div>
                  <div><label className="text-sm text-gray-400 block mb-1">Email Corporativo</label><input required type="email" className="w-full bg-black/40 p-3 rounded-lg border border-white/5" value={newColab.email} onChange={e=>setNewColab({...newColab, email: e.target.value})} /></div>
                  <div><label className="text-sm text-gray-400 block mb-1">Contraseña Temporal</label><input required type="password" placeholder="password123" className="w-full bg-black/40 p-3 rounded-lg border border-white/5" value={newColab.password} onChange={e=>setNewColab({...newColab, password: e.target.value})} /></div>
                  <div><label className="text-sm text-gray-400 block mb-1">Cargo</label><input required placeholder="Ej: Cajero" className="w-full bg-black/40 p-3 rounded-lg border border-white/5" value={newColab.cargo} onChange={e=>setNewColab({...newColab, cargo: e.target.value})} /></div>
                  <div><label className="text-sm text-gray-400 block mb-1">Área</label><input required placeholder="Ej: Ventas" className="w-full bg-black/40 p-3 rounded-lg border border-white/5" value={newColab.area} onChange={e=>setNewColab({...newColab, area: e.target.value})} /></div>
                  <div className="flex gap-4 mt-6">
                    <button type="button" onClick={() => setShowColabModal(false)} className="w-1/3 bg-gray-800 py-3 rounded-lg font-bold">Cancelar</button>
                    <button type="submit" className="w-2/3 bg-primary hover:bg-blue-600 py-3 rounded-lg font-bold transition-colors">Registrar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminPanel;
