import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, FileText, Award } from 'lucide-react';
import api from '../services/api';
import AITutor from '../components/AITutor';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeModulo, setActiveModulo] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cursos/${id}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  const { curso, modulos } = data;
  const currentModulo = modulos[activeModulo];
  const isLastModulo = activeModulo === modulos.length - 1;

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 relative pb-24">
      {/* Sidebar Modulos */}
      <div className="w-full md:w-80 space-y-4 shrink-0">
        <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-lg">
          <img src={curso.imagen_url} alt={curso.titulo} className="w-full h-32 object-cover rounded-xl mb-4" />
          <h2 className="text-xl font-bold mb-2 leading-tight">{curso.titulo}</h2>
          <p className="text-sm text-gray-400 mb-6">{curso.descripcion}</p>
          
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Contenido del Curso</h3>
            {modulos.map((mod, idx) => (
              <button 
                key={mod.id}
                onClick={() => setActiveModulo(idx)}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors text-sm font-medium
                  ${activeModulo === idx ? 'bg-primary text-white' : 'hover:bg-white/5 text-gray-300'}
                `}
              >
                {activeModulo > idx ? <CheckCircle size={18} className="text-emerald-400 shrink-0" /> : <PlayCircle size={18} className="shrink-0" />}
                <span className="line-clamp-2">{mod.orden}. {mod.titulo}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => navigate(`/curso/${id}/evaluacion`)}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2 group"
        >
          <Award size={20} className="group-hover:scale-110 transition-transform" />
          Ir a la Evaluación Final
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-surface border border-white/5 rounded-2xl shadow-lg flex flex-col min-h-[600px]">
        {currentModulo ? (
          <>
            <div className="p-8 border-b border-white/5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full mb-4">
                <FileText size={14} /> Módulo {currentModulo.orden}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{currentModulo.titulo}</h1>
            </div>
            <div className="p-8 flex-1 text-gray-300 leading-relaxed text-lg prose prose-invert max-w-none">
              {currentModulo.contenido}
            </div>
            <div className="p-6 border-t border-white/5 flex justify-between bg-black/20 rounded-b-2xl mt-auto">
              <button 
                onClick={() => setActiveModulo(Math.max(0, activeModulo - 1))}
                disabled={activeModulo === 0}
                className="px-6 py-2 rounded-lg font-medium bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                Anterior
              </button>
              <button 
                onClick={() => setActiveModulo(Math.min(modulos.length - 1, activeModulo + 1))}
                disabled={isLastModulo}
                className="px-6 py-2 rounded-lg font-medium bg-primary hover:bg-blue-600 disabled:opacity-30 transition-colors text-white"
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 flex items-center justify-center h-full text-gray-500">
            No hay módulos disponibles.
          </div>
        )}
      </div>

      {/* AI Tutor */}
      {currentModulo && (
        <AITutor courseContext={`Curso: ${curso.titulo}. Módulo actual: ${currentModulo.titulo}. Contenido: ${currentModulo.contenido}`} />
      )}
    </div>
  );
};

export default CourseDetail;
