import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Star } from 'lucide-react';
import api from '../services/api';

const Evaluation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState(null); // null | { aprobado, score, intentos, reset }
  
  // Encuesta state
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [encuestaEnviada, setEncuestaEnviada] = useState(false);

  useEffect(() => {
    api.get(`/cursos/${id}/evaluacion`)
      .then(res => {
        setPreguntas(res.data.preguntas || []);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleSubmit = async () => {
    let correctas = 0;
    preguntas.forEach((p, i) => {
      if (respuestas[i] === p.correct) correctas++;
    });

    const score = (correctas / preguntas.length) * 100;
    const aprobado = score >= 60; // 60% passing threshold

    try {
      const res = await api.post(`/cursos/${id}/certificar`, { aprobado });
      setResultado({ 
        aprobado: res.data.success, 
        score,
        intentos: res.data.intentos || 0,
        reset: res.data.reset || false,
        message: res.data.message
      });
    } catch (error) {
      console.error(error);
      alert('Error al registrar certificación');
    }
  };

  const handleEncuestaSubmit = async () => {
    if (rating === 0) return alert('Por favor, selecciona una calificación.');
    try {
      await api.post(`/cursos/${id}/encuesta`, { calificacion: rating, comentario });
      setEncuestaEnviada(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  if (preguntas.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center bg-surface border border-white/10 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">No hay evaluación disponible para este curso</h2>
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">Volver al Dashboard</button>
      </div>
    );
  }

  if (resultado) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-surface border border-white/10 rounded-3xl text-center shadow-2xl relative overflow-hidden">
        {resultado.aprobado ? (
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-green-500"></div>
        ) : (
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-orange-500"></div>
        )}
        
        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl ${resultado.aprobado ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {resultado.aprobado ? <Award size={48} /> : <XCircle size={48} />}
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          {resultado.aprobado ? '¡Felicidades, Aprobaste!' : 'Evaluación Reprobada'}
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Tu puntaje fue de <span className="font-bold text-white">{resultado.score.toFixed(0)}%</span> (Mínimo: 60%)
        </p>

        {resultado.aprobado ? (
          <>
            <p className="text-emerald-400 font-medium mb-8 bg-emerald-500/10 p-4 rounded-xl inline-block border border-emerald-500/20">
              Se ha emitido tu certificación. Ayúdanos a mejorar calificando este curso:
            </p>
            
            {!encuestaEnviada ? (
              <div className="bg-black/20 p-6 rounded-2xl text-left border border-white/5 mb-8">
                <h3 className="font-bold mb-4">Encuesta de Satisfacción</h3>
                <div className="flex gap-2 justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        className={`${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                      />
                    </button>
                  ))}
                </div>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none mb-4"
                  placeholder="Déjanos tus comentarios sobre el curso (opcional)"
                  rows={3}
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                />
                <button 
                  onClick={handleEncuestaSubmit}
                  className="w-full bg-primary hover:bg-blue-600 font-bold py-3 rounded-xl transition-colors"
                >
                  Enviar Encuesta y Volver
                </button>
              </div>
            ) : (
              <div className="text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 mb-8 font-medium">
                ¡Gracias por tus comentarios! Redirigiendo...
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-red-400 font-medium mb-8 bg-red-500/10 p-4 rounded-xl inline-block border border-red-500/20">
              {resultado.message}
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-surface border border-white/10 hover:bg-white/5 rounded-xl font-medium transition-colors">
                Ir al Dashboard
              </button>
              {!resultado.reset && (
                <button onClick={() => { setResultado(null); setRespuestas({}); }} className="px-8 py-3 bg-primary hover:bg-blue-600 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20">
                  Reintentar
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Evaluación Final</h1>
        <p className="text-gray-400">Responde las siguientes preguntas. Necesitas al menos 60% para aprobar y obtener tu certificación.</p>
      </div>

      <div className="space-y-6">
        {preguntas.map((p, i) => (
          <div key={i} className="bg-surface border border-white/10 p-8 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold mb-6 flex gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">{i + 1}</span>
              {p.q}
            </h3>
            <div className="space-y-3 pl-11">
              {p.options.map((opt, optIdx) => (
                <label key={optIdx} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${respuestas[i] === optIdx ? 'border-primary bg-primary/10' : 'border-white/5 bg-black/20 hover:border-white/20 hover:bg-black/40'}`}>
                  <input 
                    type="radio" 
                    name={`pregunta_${i}`} 
                    value={optIdx}
                    checked={respuestas[i] === optIdx}
                    onChange={() => setRespuestas(prev => ({ ...prev, [i]: optIdx }))}
                    className="w-5 h-5 text-primary bg-gray-800 border-gray-600 focus:ring-primary focus:ring-offset-gray-900"
                  />
                  <span className="text-gray-300 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 pb-20">
        <button 
          onClick={handleSubmit}
          disabled={Object.keys(respuestas).length < preguntas.length}
          className="w-full py-4 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 text-lg"
        >
          {Object.keys(respuestas).length < preguntas.length ? 'Responde todas las preguntas para enviar' : 'Enviar Evaluación y Generar Certificado'}
        </button>
      </div>
    </div>
  );
};

export default Evaluation;
