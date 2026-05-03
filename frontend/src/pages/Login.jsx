import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { LogIn, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://neoua2.onrender.com';
    axios.get(`${apiUrl}/api/empresas`)
      .then(res => setEmpresas(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict domain validation
    if (!email.endsWith(selectedEmpresa.dominio)) {
      setError(`Acceso denegado. Debes usar tu correo corporativo terminado en ${selectedEmpresa.dominio}`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glass-panel max-w-lg w-full p-8 rounded-3xl relative z-10 border border-white/10 shadow-2xl">
        
        {!selectedEmpresa ? (
          // Paso 1: Selección de Empresa
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Selecciona tu Empresa</h2>
              <p className="text-gray-400">Para acceder al portal corporativo</p>
            </div>
            
            <div className="space-y-4">
              {empresas.map(empresa => (
                <button
                  key={empresa.id}
                  onClick={() => setSelectedEmpresa(empresa)}
                  className="w-full bg-surface border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 hover:border-white/20 transition-all text-left"
                >
                  {empresa.logo_url ? (
                    <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center">
                      <img src={empresa.logo_url} alt={empresa.nombre} className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: empresa.color_primario }}>
                      <Building2 size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{empresa.nombre}</h3>
                    <p className="text-sm text-gray-400">{empresa.industria}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/')} className="mt-8 text-sm text-gray-400 hover:text-white flex items-center gap-2 justify-center w-full">
              <ArrowLeft size={16} /> Volver al inicio
            </button>
          </div>
        ) : (
          // Paso 2: Formulario de Login
          <div>
            <button onClick={() => { setSelectedEmpresa(null); setError(''); setEmail(''); }} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-6">
              <ArrowLeft size={16} /> Volver a empresas
            </button>

            <div className="text-center mb-8">
              {selectedEmpresa.logo_url ? (
                <div className="w-20 h-20 bg-white rounded-2xl mx-auto p-2 flex items-center justify-center mb-4 shadow-lg">
                  <img src={selectedEmpresa.logo_url} alt={selectedEmpresa.nombre} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: selectedEmpresa.color_primario }}>
                  <Building2 size={28} className="text-white" />
                </div>
              )}
              <h2 className="text-3xl font-bold tracking-tight mb-2">Portal {selectedEmpresa.nombre}</h2>
              <p className="text-gray-400">Ingresa tus credenciales corporativas</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Correo Corporativo</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder={`tu.nombre${selectedEmpresa.dominio}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3 rounded-xl transition-all shadow-lg hover:bg-gray-200 mt-4 disabled:opacity-70"
              >
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
