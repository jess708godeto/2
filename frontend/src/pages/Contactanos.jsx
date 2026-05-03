import { Mail, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';

const Contactanos = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="glass-panel max-w-lg w-full p-10 rounded-3xl border border-white/10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 relative z-10">Contáctanos</h1>
          <p className="text-gray-400 mb-10 relative z-10">
            ¿Tienes alguna duda o quieres implementar nuestra plataforma en tu empresa? ¡Hablemos!
          </p>

          <div className="space-y-6 relative z-10">
            <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                <Mail size={24} />
              </div>
              <p className="text-sm text-gray-400">Correo Electrónico</p>
              <a href="mailto:edtech0809@gmail.com" className="text-xl font-bold hover:text-primary transition-colors">edtech0809@gmail.com</a>
            </div>

            <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                <Phone size={24} />
              </div>
              <p className="text-sm text-gray-400">Teléfono / WhatsApp</p>
              <a href="tel:99294317" className="text-xl font-bold hover:text-emerald-400 transition-colors">99294317</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contactanos;
