import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, AlertTriangle, ChevronRight, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.rol === 'admin') {
          const res = await api.get('/admin/metricas');
          setData(res.data);
        } else {
          const res = await api.get('/dashboard');
          setData(res.data);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading || !data) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  const handleDescargarReporte = async () => {
    try {
      const response = await api.get('/admin/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_mensual.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Error al descargar reporte');
    }
  };

  if (user?.rol === 'admin') {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Resumen General</h1>
            <p className="text-gray-400">Panel Analítico de {user?.empresa?.nombre}</p>
          </div>
          <button onClick={handleDescargarReporte} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors shadow-lg">
            <Download size={18} /> Descargar Reporte (CSV)
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-lg">
            <p className="text-gray-400 font-medium mb-1">Total Colaboradores</p>
            <p className="text-4xl font-extrabold">{data.totalUsuarios}</p>
          </div>
          <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-lg">
            <p className="text-gray-400 font-medium mb-1">Cursos Realizados</p>
            <p className="text-4xl font-extrabold text-blue-400">{data.totalCertificaciones}</p>
          </div>
          <div className="bg-surface border border-white/5 p-6 rounded-2xl border-l-4 border-l-orange-500 shadow-lg">
            <p className="text-gray-400 font-medium mb-1">Certificaciones por Vencer</p>
            <p className="text-4xl font-extrabold text-orange-400">0</p>
            <p className="text-xs text-gray-500 mt-2">Próximos 30 días</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Gráfico de Barras */}
          <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-lg">
            <h3 className="font-bold mb-6 text-gray-300">Colaboradores por Cargo</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.cursosDept || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="cargo" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#ffffff20' }} />
                  <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Líneas */}
          <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-lg">
            <h3 className="font-bold mb-6 text-gray-300">Evolución de Certificaciones</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.certTimeline?.length ? data.certTimeline : [{ mes: 'Mes 1', cantidad: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="mes" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#ffffff20' }} />
                  <Line type="monotone" dataKey="cantidad" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSalud = user?.empresa?.industria === 'Salud';
  const progresoPorcentaje = data.stats.total_asignados === 0 ? 0 : Math.round((data.stats.completados / data.stats.total_asignados) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Panel de Control</h1>
          <p className="text-gray-400">Resumen de tus capacitaciones y certificaciones.</p>
        </div>
        {isSalud && data.stats.pendientes > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg">
            <AlertTriangle size={18} /> Acción Requerida: Certificaciones Pendientes
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Progress Circular */}
        <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-gray-400 font-medium text-sm mb-4">Ruta de Aprendizaje</h3>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ffffff10" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progresoPorcentaje) / 100} className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute text-2xl font-bold">{progresoPorcentaje}%</div>
          </div>
        </div>

        <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><BookOpen size={20} /></div>
            <p className="text-gray-400 font-medium text-sm">Cursos Asignados</p>
          </div>
          <span className="text-3xl font-bold ml-11">{data.stats.total_asignados}</span>
        </div>
        
        <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><ShieldCheck size={20} /></div>
            <p className="text-gray-400 font-medium text-sm">Certificados Obtenidos</p>
          </div>
          <span className="text-3xl font-bold ml-11">{data.stats.completados}</span>
        </div>
        
        {/* Medallas */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
          <h3 className="text-indigo-200 font-medium text-sm mb-2">Tu Nivel</h3>
          <div className="text-4xl mb-1">
            {data.stats.completados >= 5 ? '🏆' : data.stats.completados >= 3 ? '🥇' : data.stats.completados >= 1 ? '🥈' : '🥉'}
          </div>
          <p className="font-bold text-indigo-300 text-sm">
            {data.stats.completados >= 5 ? 'Maestro' : data.stats.completados >= 3 ? 'Experto' : data.stats.completados >= 1 ? 'Avanzado' : 'Novato'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Leaderboard */}
        <div className="bg-surface border border-white/5 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5 bg-black/20">
            <h2 className="text-lg font-bold flex items-center gap-2 text-yellow-400">🏆 Top Compañeros</h2>
          </div>
          <div className="p-5 space-y-4">
            {data.ranking?.length === 0 ? (
              <p className="text-gray-500 text-sm">Aún no hay puntuaciones.</p>
            ) : (
              data.ranking?.map((r, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${i === 0 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-black ${i===0 ? 'text-yellow-400' : i===1 ? 'text-gray-300' : 'text-orange-300'}`}>#{i+1}</span>
                    <span className="font-medium text-sm">{r.nombre}</span>
                  </div>
                  <span className="text-xs font-bold bg-black/40 px-2 py-1 rounded text-primary">{r.puntaje} pts</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cursos Pendientes */}
        <div className="bg-surface border border-white/5 rounded-2xl shadow-lg overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-white/5 bg-black/20">
            <h2 className="text-lg font-bold">Cursos Pendientes</h2>
          </div>
          <div className="divide-y divide-white/5">
            {data.cursosPendientes.length === 0 ? (
              <p className="p-6 text-emerald-400 font-medium text-center bg-emerald-500/5">¡Increíble! No tienes cursos pendientes. 🎉</p>
            ) : (
              data.cursosPendientes.map(curso => (
                <div key={curso.id} className="p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => navigate(`/curso/${curso.id}`)}>
                  <img src={curso.imagen_url} alt={curso.titulo} className="w-16 h-16 rounded-xl object-cover bg-gray-800" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{curso.titulo}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1">{curso.descripcion}</p>
                  </div>
                  <ChevronRight className="text-gray-500 group-hover:text-primary transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
