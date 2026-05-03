import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="p-6 flex justify-between items-center border-b border-white/10 glass-panel sticky top-0 z-50">
      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight cursor-pointer" onClick={() => navigate('/')}>
        NeoUA
      </div>
      
      <div className="hidden md:flex items-center gap-8 font-medium text-gray-300">
        <Link to="/conocenos" className="hover:text-white transition-colors">Conócenos</Link>
        <Link to="/contactanos" className="hover:text-white transition-colors">Contáctanos</Link>
      </div>

      <button onClick={() => navigate('/login')} className="px-5 py-2 bg-primary hover:bg-blue-600 transition-colors rounded-lg font-medium shadow-lg shadow-blue-500/20 text-white">
        Iniciar Sesión
      </button>
    </nav>
  );
};

export default Navbar;
