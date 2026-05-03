import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { LogOut, BookOpen, ShieldCheck, Home, User, Bell, Settings, Activity, FilePlus, Sparkles } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = () => {
    api.get('/notificaciones').then(res => setNotifs(res.data)).catch(console.error);
  };

  const handleReadNotifs = async () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs && unreadCount > 0) {
      await api.post('/notificaciones/read');
      setTimeout(fetchNotifs, 1000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifs.filter(n => !n.leida).length;
  const isSalud = user?.empresa?.industria === 'Salud';
  const isAdmin = user?.rol === 'admin';

  const NavButton = ({ to, icon: Icon, text }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <button 
        onClick={() => navigate(to)} 
        className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors font-medium ${isActive ? 'bg-primary text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={20} /> {text}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 flex flex-col justify-between bg-surface z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/dashboard')}>
            {user?.empresa?.logo_url ? (
              <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg">
                <img src={user?.empresa?.logo_url} alt={user?.empresa?.nombre} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg" 
                   style={{ backgroundColor: user?.empresa?.color_primario || '#3b82f6' }}>
                {user?.empresa?.nombre.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">{user?.empresa?.nombre}</h1>
              <p className="text-xs text-gray-400 mt-1">{user?.empresa?.industria}</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <NavButton to="/dashboard" icon={Home} text="Panel Principal" />
            <NavButton to="/perfil" icon={User} text="Mi Perfil" />
            {!isAdmin && (
              <>
                <NavButton to="/mis-cursos" icon={BookOpen} text="Cursos" />
                <NavButton to="/catalogo" icon={Sparkles} text="Catálogo Libre" />
                <NavButton to="/certificaciones" icon={ShieldCheck} text="Certificaciones" />
                <NavButton to="/documentos" icon={FilePlus} text="Documentos Médicos" />
              </>
            )}

            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-white/5">
                <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gestión</p>
                <NavButton to="/admin" icon={Settings} text="Panel de Administrador" />
              </div>
            )}
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/10 bg-black/10">
          <div className="mb-4">
            <p className="text-sm font-bold text-white">{user?.nombre}</p>
            <p className="text-xs text-gray-400">{user?.cargo}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-sm text-red-400 font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors w-full p-3 rounded-xl">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 bg-surface/50 backdrop-blur-md flex items-center justify-end px-8 z-10 shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative">
              <button onClick={handleReadNotifs} className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300">
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-surface animate-pulse"></span>
                )}
              </button>

              {/* Notif Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-4 w-80 bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h3 className="font-bold">Notificaciones</h3>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{unreadCount} nuevas</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <p className="p-6 text-center text-sm text-gray-400">No tienes notificaciones.</p>
                    ) : (
                      notifs.map(n => (
                        <div key={n.id} className={`p-4 border-b border-white/5 text-sm ${n.leida ? 'text-gray-400 bg-transparent' : 'text-white bg-blue-500/5'}`}>
                          <div className="flex gap-3">
                            <Activity className={`shrink-0 mt-0.5 ${n.leida ? 'text-gray-500' : 'text-primary'}`} size={16} />
                            <div>
                              <p className="mb-1">{n.mensaje}</p>
                              <p className="text-xs opacity-50">{new Date(n.fecha).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border-2 border-white/10 flex items-center justify-center font-bold">
              {user?.nombre.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
