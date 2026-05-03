import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { User, Briefcase, MapPin, Save, ShieldCheck, XCircle } from 'lucide-react';

const Perfil = () => {
  const { user, login } = useAuthStore();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [cargo, setCargo] = useState(user?.cargo || '');
  const [area, setArea] = useState(user?.area || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/perfil', { nombre, cargo, area });
      setSuccess(true);
      // Actualizamos estado global recargando la página o mutando, aquí simulamos que guardó bien
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mi Perfil Profesional</h1>
        <p className="text-gray-400">Gestiona tu información dentro de la empresa.</p>
      </div>

      <div className="bg-surface border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
        
        <div className="flex flex-col md:flex-row gap-10 relative z-10">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-white/10 flex items-center justify-center mb-4">
              <User size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold">{user?.nombre}</h2>
            <p className="text-gray-400 mb-2">{user?.email}</p>
            <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/5">
              Rol: {user?.rol.toUpperCase()}
            </div>
            
            <div className="mt-6 flex flex-col items-center w-full">
              {user?.apto ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl w-full justify-center border border-emerald-500/20">
                  <ShieldCheck size={20} /> Apto para trabajar
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-xl w-full justify-center border border-red-500/20">
                  <XCircle size={20} /> No Apto (Faltan Docs/Cursos)
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h3 className="text-xl font-bold border-b border-white/10 pb-2">Información Laboral</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <User size={16} /> Nombre Completo
                </label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <Briefcase size={16} /> Cargo Actual (No editable)
                </label>
                <input 
                  type="text" 
                  value={cargo}
                  readOnly
                  className="w-full bg-black/40 text-gray-500 border border-white/5 p-3 rounded-xl cursor-not-allowed outline-none"
                  title="Contacta a RRHH para modificar tu cargo"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <MapPin size={16} /> Área / Departamento
                </label>
                <input 
                  type="text" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {success ? (
                <span className="text-emerald-400 text-sm font-medium">¡Perfil actualizado con éxito!</span>
              ) : (
                <span></span>
              )}
              <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-primary hover:bg-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save size={20} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
