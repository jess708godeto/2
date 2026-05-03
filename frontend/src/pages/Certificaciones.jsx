import { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Award, Download } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const Certificaciones = () => {
  const [certificaciones, setCertificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => {
        setCertificaciones(res.data.certificaciones);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleDownloadPDF = async (cursoId, titulo) => {
    try {
      const response = await fetch(`https://neoua2.onrender.com/api/cursos/${cursoId}/certificado-pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al generar PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificado_${titulo.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al descargar el certificado');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mis Certificaciones</h1>
        <p className="text-gray-400">Historial completo de tus certificaciones y acreditaciones corporativas.</p>
      </div>

      <div className="space-y-4">
        {certificaciones.length === 0 ? (
          <p className="text-gray-400 py-12 text-center bg-surface border border-white/5 rounded-2xl">Aún no tienes certificaciones registradas.</p>
        ) : (
          certificaciones.map(cert => (
            <div key={cert.id} className="bg-surface border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors shadow-lg">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-lg">
                  <Award size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{cert.titulo}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={14} /> Emitido: {new Date(cert.fecha_emision).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold border border-emerald-500/20">
                  <ShieldCheck size={18} /> {cert.estado}
                </span>
                <button onClick={() => handleDownloadPDF(cert.curso_id, cert.titulo)} className="flex items-center gap-2 mt-2 px-4 py-2 bg-primary hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors text-white">
                  <Download size={16} /> Descargar PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Certificaciones;
