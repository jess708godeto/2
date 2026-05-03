import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Quote, BrainCircuit, Trophy, LineChart, FileBadge } from 'lucide-react';
import Navbar from '../components/Navbar';

const Landing = () => {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    axios.get(`${apiUrl}/api/empresas`)
      .then(res => setEmpresas(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12 mb-20">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 max-w-4xl">
          Capacitación corporativa de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">próxima generación</span>
        </h1>
        
        {/* Quiénes somos */}
        <div className="max-w-3xl mx-auto glass-panel p-8 rounded-3xl border border-white/10 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
          <h2 className="text-2xl font-bold mb-4">Quiénes somos</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Somos un equipo de estudiantes que desarrolla la plataforma NeoUA enfocada en mejorar el aprendizaje digital. Buscamos ofrecer una experiencia educativa más accesible, personalizada y[...]
          </p>
        </div>
      </div>

      {/* Características / Features */}
      <div className="py-20 px-8 bg-black/20 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Súper Poderes de NeoUA</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Todo lo que necesitas para llevar la capacitación de tu equipo al siguiente nivel, en una sola plataforma intuitiva y segura.</p[...]
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Tutor IA Integrado</h3>
              <p className="text-gray-400 leading-relaxed text-sm">Asistencia 24/7 con Inteligencia Artificial que responde dudas basándose estrictamente en el contenido de tus módulos.</p>
            </div>

            <div className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-colors group">
              <div className="w-14 h-14 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Gamificación</h3>
              <p className="text-gray-400 leading-relaxed text-sm">Aumenta la retención con medallas, rankings corporativos y barras de progreso visuales.</p>
            </div>

            <div className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LineChart size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Métricas en Vivo</h3>
              <p className="text-gray-400 leading-relaxed text-sm">Dashboards avanzados para RRHH. Monitorea el cumplimiento de tus colaboradores al instante.</p>
            </div>

            <div className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-colors group">
              <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileBadge size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Certificados PDF</h3>
              <p className="text-gray-400 leading-relaxed text-sm">Generación de diplomas con validez automática para cumplimiento normativo.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonios */}
      <div className="py-20 px-8 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Lo que dicen los líderes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface/50 p-8 rounded-2xl border border-white/5 relative">
              <Quote size={40} className="text-white/10 absolute top-4 right-4" />
              <p className="text-gray-300 mb-6 italic">"La forma en que esta plataforma integra la inteligencia artificial para personalizar el aprendizaje corporativo es el verdadero futuro de la[...]
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">MZ</div>
                <div>
                  <h4 className="font-bold">Mark Zuckerberg</h4>
                  <p className="text-xs text-gray-400">CEO, Meta</p>
                </div>
              </div>
            </div>

            <div className="bg-surface/50 p-8 rounded-2xl border border-white/5 relative">
              <Quote size={40} className="text-white/10 absolute top-4 right-4" />
              <p className="text-gray-300 mb-6 italic">"Innovación pura. Lograr simplificar los procesos de compliance y capacitación en una sola herramienta es exactamente lo que las empresas n[...]
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">BG</div>
                <div>
                  <h4 className="font-bold">Bill Gates</h4>
                  <p className="text-xs text-gray-400">Co-founder, Microsoft</p>
                </div>
              </div>
            </div>

            <div className="bg-surface/50 p-8 rounded-2xl border border-white/5 relative">
              <Quote size={40} className="text-white/10 absolute top-4 right-4" />
              <p className="text-gray-300 mb-6 italic">"Si vas a construir el futuro, necesitas capacitar a tu equipo a la velocidad de la luz. NeoUA es la nave espacial que te lleva allí."</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">EM</div>
                <div>
                  <h4 className="font-bold">Elon Musk</h4>
                  <p className="text-xs text-gray-400">CEO, Tesla & SpaceX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="py-16 bg-black/40 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-8">Orgullosos Partners de</p>
          <div className="flex justify-center items-center gap-16 flex-wrap opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" alt="Google Cloud" className="h-10" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" alt="Microsoft" className="h-10" />
          </div>
        </div>
      </div>

      {/* Empresas Grid (Simplificado) */}
      <div className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center text-gray-400">Empresas que confían en nosotros</h2>
          <div className="flex flex-wrap justify-center gap-12 items-center">
            {empresas.map(empresa => (
              <div key={empresa.id} className="flex flex-col items-center gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                {empresa.logo_url ? (
                  <div className="w-32 h-16 flex items-center justify-center p-2 bg-white rounded-2xl">
                    <img src={empresa.logo_url} alt={empresa.nombre} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: empresa.color_primario }}>
                    <Building2 size={32} />
                  </div>
                )}
                <span className="font-bold text-lg">{empresa.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
