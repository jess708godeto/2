import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import api from '../services/api';

const MisCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cursos')
      .then(res => {
        setCursos(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Cursos</h1>
        <p className="text-gray-400">Explora y continúa con las capacitaciones asignadas a tu perfil.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.length === 0 ? (
          <p className="text-gray-400 col-span-3 text-center py-12 bg-surface rounded-2xl border border-white/5">No tienes cursos asignados.</p>
        ) : (
          cursos.map(curso => (
            <div key={curso.id} className="bg-surface border border-white/5 rounded-2xl shadow-xl overflow-hidden hover:-translate-y-1 transition-transform group cursor-pointer" onClick={() => navigate(`/curso/${curso.id}`)}>
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10"></div>
                <img src={curso.imagen_url} alt={curso.titulo} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{curso.titulo}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">{curso.descripcion}</p>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="flex items-center gap-2 text-sm font-medium text-primary">
                    <BookOpen size={16} /> Ver Contenido
                  </span>
                  <ChevronRight size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MisCursos;
