import { Users, Code, PenTool, LayoutDashboard, Bug } from 'lucide-react';
import Navbar from '../components/Navbar'; // we will create this

const Conocenos = () => {
  const team = [
    { name: 'Jesus Poturo', role: 'Scrum Master', icon: <LayoutDashboard className="text-blue-400" /> },
    { name: 'Benjamin Chamorro', role: 'Product Owner', icon: <Users className="text-emerald-400" /> },
    { name: 'Jazmin Ruz', role: 'Developer', icon: <Code className="text-purple-400" /> },
    { name: 'Damon Murray', role: 'Developer', icon: <Code className="text-purple-400" /> },
    { name: 'Cornejo Tomas', role: 'Developer', icon: <Code className="text-purple-400" /> },
    { name: 'Andres Chavez', role: 'Tester', icon: <Bug className="text-red-400" /> },
    { name: 'Carlos Lopez', role: 'Developer', icon: <Code className="text-purple-400" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Nuestro Equipo</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Somos un equipo de estudiantes que desarrolla la plataforma NeoUA enfocada en mejorar el aprendizaje digital. Buscamos ofrecer una experiencia educativa más accesible, personalizada y apoyada por tecnología, integrando herramientas inteligentes que se adaptan a cada usuario.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div key={index} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center border border-white/10 hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center mb-4 border border-white/5">
                {member.icon}
              </div>
              <h3 className="text-lg font-bold">{member.name}</h3>
              <p className="text-sm text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Conocenos;
