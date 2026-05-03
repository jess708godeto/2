import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PlayCircle, PlusCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Catalogo = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCatalogo();
  }, []);

  const fetchCatalogo = async () => {
    try {
      const res = await api.get('/catalogo');
      setCursos(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleInscribir = async (cursoId) => {
    try {
      await api.post('/catalogo/inscribir', { cursoId });
      navigate(`/curso/${cursoId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al inscribirse');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 font-bold rounded-full mb-4 text-sm">
            <Sparkles size={16} /> Cursos de Autodesarrollo
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">Catálogo Libre</h1>
          <p className="text-lg text-blue-200/80 mb-6">
            Lleva tu carrera al siguiente nivel. Inscríbete voluntariamente en estos cursos transversales y expande tus habilidades más allá de tu cargo actual.
          </p>
        </div>
      </div>

      {cursos.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-white/5 rounded-2xl">
          <p className="text-gray-400 text-lg">Actualmente no hay cursos de catálogo libre disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map(curso => (
            <div key={curso.id} className="bg-surface border border-white/5 rounded-2xl shadow-lg overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20">
              <div className="relative h-48">
                <img src={curso.imagen_url} alt={curso.titulo} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-sm border border-white/10 text-white text-xs font-bold rounded-md uppercase tracking-wider mb-2 inline-block">
                    Opcional
                  </span>
                  <h3 className="font-bold text-lg leading-tight text-white">{curso.titulo}</h3>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1">{curso.descripcion}</p>
                <button 
                  onClick={() => handleInscribir(curso.id)}
                  className="w-full py-3 bg-white/5 hover:bg-primary text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-white/10 hover:border-primary"
                >
                  <PlusCircle size={20} /> Inscribirme Ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogo;
