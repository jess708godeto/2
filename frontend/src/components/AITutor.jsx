import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import api from '../services/api';

const AITutor = ({ courseContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola! Soy tu tutor IA corporativo. ¿Tienes alguna duda sobre este curso?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        question: userMsg,
        context: courseContext
      });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Lo siento, tuve un problema procesando tu solicitud.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-2xl hover:bg-blue-600 transition-transform hover:scale-105 z-50 flex items-center justify-center"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="text-primary" size={20} />
              <h3 className="font-semibold text-sm">Tutor IA - {courseContext.substring(0, 20)}...</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-gray-400 p-3 rounded-2xl rounded-tl-none text-xs flex gap-1">
                  <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-white/5">
            <div className="flex items-center bg-black/20 rounded-full border border-white/10 px-4 py-2">
              <input 
                type="text" 
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
                placeholder="Pregunta algo..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} disabled={loading || !input.trim()} className="text-primary hover:text-blue-400 disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AITutor;
