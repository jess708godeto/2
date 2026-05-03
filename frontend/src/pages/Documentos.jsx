import { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const Documentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = () => {
    api.get('/documentos')
      .then(res => setDocumentos(res.data))
      .catch(console.error);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // Simulación de subida
      await api.post('/documentos', { nombre_archivo: file.name });
      setFile(null);
      fetchDocs();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Requisitos y Documentos Médicos</h1>
        <p className="text-gray-400">Sube tus certificados de salud y vacunas obligatorias para validación automática del sistema.</p>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-bold mb-6">Subir Nuevo Documento</h2>
        
        <div className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-black/10 hover:bg-black/20 transition-colors">
          <UploadCloud size={48} className="text-primary mb-4" />
          <p className="mb-2">Arrastra tu archivo aquí o haz clic para buscar</p>
          <p className="text-sm text-gray-500 mb-6">PDF, JPG o PNG (Max. 5MB)</p>
          
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,image/*"
          />
          <label htmlFor="file-upload" className="cursor-pointer bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Seleccionar Archivo
          </label>

          {file && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-4 text-left w-full max-w-md">
              <FileText className="text-primary shrink-0" />
              <div className="flex-1 truncate">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={handleUpload}
                disabled={loading}
                className="bg-primary px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Subiendo...' : 'Confirmar'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-bold mb-6">Historial de Documentos</h2>
        
        <div className="space-y-4">
          {documentos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aún no has subido ningún documento.</p>
          ) : (
            documentos.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-lg text-gray-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">{doc.nombre_archivo}</h4>
                    <p className="text-xs text-gray-400">Subido el: {new Date(doc.fecha_subida).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  {doc.validado ? (
                    <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle size={16} /> Validado por Sistema
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-orange-400 text-sm font-medium bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                      <Clock size={16} /> Pendiente
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Documentos;
