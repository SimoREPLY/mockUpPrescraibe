import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, Clock, CheckCircle2 } from 'lucide-react';
import './index.css';

// --- Types ---
type Role = 'user' | 'agent';

interface BaseMessage {
  id: number;
  role: Role;
}

interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
}

interface FormMessage extends BaseMessage {
  type: 'form';
  content: string;
}

interface SummaryMessage extends BaseMessage {
  type: 'summary';
  data: {
    age: string;
    duration: string;
  };
}

interface ResultMessage extends BaseMessage {
  type: 'result';
}

type Message = TextMessage | FormMessage | SummaryMessage | ResultMessage;

// --- Dati finti per la cronologia Sidebar ---
const fakeHistory = [
  { id: 'curr', label: 'EGDS - Classe B', active: true },
  { id: 'h1', label: 'Risonanza magnetica - Urgente', active: false },
  { id: 'h2', label: 'Visita dermatologica - Program...', active: false },
  { id: 'h3', label: 'Ecografia addome - Differibile', active: false },
  { id: 'h4', label: 'Visita cardiologica - Urgente', active: false }
];

const PrescrAIbeFlow: React.FC = () => {
  // 1. Messaggio iniziale ESATTO dello screenshot
  const initialText = "Buongiorno. Ho un paziente con bruciore epigastrico persistente, nausea post-prandiale ricorrente e un calo di peso di circa 4 kg. Non ha mai eseguito una EGDS. Vorrei prescrivere una esofagogastroduodenoscopia.";

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'user', type: 'text', content: initialText }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 2. Trigger automatico del form dell'Agente
  useEffect(() => {
    const timer = setTimeout(() => {
      const formMsg: FormMessage = {
        id: Date.now(),
        role: 'agent',
        type: 'form',
        content: 'Buongiorno. Ho analizzato le linee guida per la prescrizione di EGDS (Codici NTR 45.13 / 45.16).\nPer determinare la classe di priorità, compili il seguente modulo clinico:'
      };
      setMessages(prev => [...prev, formMsg]);
      setIsTyping(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const userMsg: TextMessage = { id: Date.now(), role: 'user', type: 'text', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
  };

  // 3. Gestione invio Form e output del risultato ESATTO
  const handleFormSubmit = (age: string, duration: string) => {
    // Messaggio riassuntivo dell'utente (come nello screenshot 2)
    const summaryMsg: SummaryMessage = {
      id: Date.now(),
      role: 'user',
      type: 'summary',
      data: { age, duration }
    };
    setMessages(prev => [...prev, summaryMsg]);
    setIsTyping(true);

    // Risultato finale dell'agente (come nello screenshot 2)
    setTimeout(() => {
      const resultMsg: ResultMessage = {
        id: Date.now() + 1,
        role: 'agent',
        type: 'result'
      };
      setMessages(prev => [...prev, resultMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity color="#3b82f6" size={24} />
          <span>PrescrAIbe</span>
        </div>

        <div className="history-section custom-scrollbar">
          <div className="history-title">
            <Clock size={12} /> Ultime 5 Conversazioni
          </div>
          {fakeHistory.map(chat => (
            <div key={chat.id} className={`history-item ${chat.active ? 'active' : ''}`}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {chat.label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: '1.5rem', fontSize: '12px', color: '#64748b', borderTop: '1px solid #1e293b', background: '#0d131f' }}>
          Utente: Dr. Rossi<br />
          Azienda Zero - Veneto
        </div>
      </aside>

      <main className="main-chat">
        <div className="messages-list custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.role}`}>

              {/* MESSAGGI UTENTE */}
              {msg.role === 'user' ? (
                <>
                  {msg.type === 'text' && (
                    <div className="bubble-user" style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {msg.content}
                    </div>
                  )}
                  {msg.type === 'summary' && (
                    <div style={{ background: '#fff', color: '#000', padding: '12px 16px', borderRadius: '12px 12px 0 12px', fontSize: '0.85rem', minWidth: '250px' }}>
                      <strong>Compilazione Modulo Clinico:</strong>
                      <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                        <li><strong>Età:</strong> {msg.data.age}</li>
                        <li><strong>Durata sintomi:</strong> {msg.data.duration}</li>
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                /* MESSAGGI AGENTE AI */
                <div className="agent-container" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: 'bold' }}>
                    <div style={{ width: '28px', height: '28px', background: 'rgba(59,130,246,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>AI</div>
                    {msg.type === 'result' ? 'Agente AI • Analisi Completata' : 'Agente AI'}
                  </div>

                  {msg.type === 'form' && (
                    <InteractiveForm content={msg.content} onSubmit={handleFormSubmit} />
                  )}

                  {msg.type === 'result' && (
                    <div className="form-card" style={{ padding: '20px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '20px' }}>
                        Sulla base delle informazioni fornite, ho determinato la classe di priorità prescrittiva per EGDS (Codici NTR 45.13 / 45.16):
                      </p>

                      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          <CheckCircle2 size={16} /> Raccomandazione finale
                        </div>

                        <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #1e293b' }}>
                          <h2 style={{ fontSize: '1.25rem', color: '#34d399', margin: '0 0 8px 0' }}>Classe di Priorità: B</h2>
                          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Breve — tempo massimo di attesa: 10 giorni</p>
                        </div>

                        <div style={{ padding: '16px' }}>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold' }}>Motivazioni Cliniche:</p>
                          <ul style={{ paddingLeft: '20px', margin: 0, color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.6' }}>
                            <li>Calo ponderale significativo (~6% in 3 mesi) con sintomi digestivi</li>
                            <li>Anemia sideropenica di nuova diagnosi</li>
                            <li>Sindrome dispeptica in paziente {'>'} 50 anni, mai indagata</li>
                          </ul>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <div style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                          <p style={{ fontSize: '0.75rem', color: '#f87171', margin: '0 0 4px 0' }}><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Tempo massimo</p>
                          <p style={{ fontSize: '1rem', color: '#f87171', fontWeight: 'bold', margin: 0 }}>10 giorni</p>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0 0 4px 0' }}>📄 Codici NTR</p>
                          <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold', margin: 0 }}>45.13 / 45.16</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
              <div style={{ width: '28px', height: '28px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div>
              L'agente sta elaborando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 12px', background: '#1e293b', borderRadius: '20px', fontSize: '0.75rem', color: '#cbd5e1' }}>Visita Cardiologica</span>
            <span style={{ padding: '6px 12px', background: '#1e293b', borderRadius: '20px', fontSize: '0.75rem', color: '#cbd5e1' }}>Ecografia Addome Completo</span>
            <span style={{ padding: '6px 12px', background: '#1e293b', borderRadius: '20px', fontSize: '0.75rem', color: '#cbd5e1' }}>Visita Dermatologica</span>
          </div>
          <form className="input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Descrivi la prestazione e il quadro clinico del paziente..."
              className="chat-input"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              className="send-btn"
              style={{ opacity: isTyping || !inputValue.trim() ? 0.5 : 1 }}
            >
              <Send size={18} />
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#64748b', marginTop: '12px' }}>
            PrescrAIbe supporta il medico ma non sostituisce il giudizio clinico. I dati personali dei pazienti vengono anonimizzati.
          </p>
        </div>
      </main>
    </div>
  );
};

// --- Form ESATTO come da Screenshot ---
interface InteractiveFormProps {
  content: string;
  onSubmit: (age: string, duration: string) => void;
}

const InteractiveForm: React.FC<InteractiveFormProps> = ({ content, onSubmit }) => {
  const [age, setAge] = useState<string | null>('> 50 anni'); // Pre-selezionato come da screen
  const [duration, setDuration] = useState<string | null>('< 6 mesi'); // Pre-selezionato come da screen
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = () => {
    if (age && duration) {
      setSubmitted(true);
      onSubmit(age, duration);
    }
  };

  // Funzione helper per renderizzare i radio button
  const renderRadio = (label: string, currentValue: string | null, setter: (val: string) => void) => {
    const isSelected = currentValue === label;
    return (
      <button
        onClick={() => setter(label)}
        className={`option-btn ${isSelected ? 'selected' : ''}`}
        style={{
          borderRadius: '6px',
          padding: '12px',
          background: isSelected ? 'rgba(59, 130, 246, 0.1)' : '#0f172a',
          border: `1px solid ${isSelected ? '#3b82f6' : '#334155'}`,
          display: 'flex', alignItems: 'center', gap: '12px'
        }}
      >
        <div style={{
          width: '18px', height: '18px', flexShrink: 0, borderRadius: '50%',
          border: `2px solid ${isSelected ? '#3b82f6' : '#64748b'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isSelected && <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%' }} />}
        </div>
        <span style={{ color: isSelected ? '#3b82f6' : '#cbd5e1', fontWeight: isSelected ? 'bold' : 'normal' }}>{label}</span>
      </button>
    );
  };

  return (
    <div className="form-card" style={{ width: '100%', padding: '20px' }}>
      <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: '#cbd5e1', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
        {content}
      </p>

      <div style={{ opacity: submitted ? 0.6 : 1, pointerEvents: submitted ? 'none' : 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* DOMANDA 1 */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>1. ETÀ DEL PAZIENTE</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderRadio('< 50 anni', age, setAge)}
            {renderRadio('> 50 anni', age, setAge)}
          </div>
        </div>

        {/* DOMANDA 2 */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>2. DURATA DEI SINTOMI DISPEPTICI</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderRadio('< 6 mesi', duration, setDuration)}
            {renderRadio('> 6 mesi', duration, setDuration)}
          </div>
        </div>

      </div>

      <button
        onClick={handleSubmit}
        disabled={!age || !duration || submitted}
        className="submit-btn"
        style={{
          background: submitted ? '#f1f5f9' : '#fff',
          color: submitted ? '#475569' : '#000',
          cursor: submitted ? 'default' : 'pointer',
          marginTop: '24px',
          padding: '12px'
        }}
      >
        {submitted ? 'Dati Inviati ✓' : 'Invia Dati'}
      </button>
    </div>
  );
};

export default PrescrAIbeFlow;