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

interface ResultMessage extends BaseMessage {
  type: 'result';
}

type Message = TextMessage | FormMessage | ResultMessage;

// --- Dati finti per la cronologia Sidebar ---
const fakeHistory = [
  { id: 'curr', label: 'EGDS - Classe B', active: true },
  { id: 'h1', label: 'Risonanza magnetica - Urgente', active: false },
  { id: 'h2', label: 'Visita dermatologica - Program...', active: false },
  { id: 'h3', label: 'Ecografia addome - Differibile', active: false },
  { id: 'h4', label: 'Visita cardiologica - Urgente', active: false }
];

const PrescrAIbeFlow: React.FC = () => {
  // 1. Messaggio iniziale ESATTO
  const initialText = "Ho un paziente con bruciore epigastrico e nausea dopo i pasti. Stavo valutando una EGDS, che priorità suggerisci?";

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
        content: 'I sintomi sono compatibili con dispepsia, ma così descritti non sono sufficienti per assegnare una priorità.\n\nPer inquadrare meglio il caso, ti chiedo:'
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

  // 3. Gestione invio Form e output del risultato
  const handleFormSubmit = () => {
    // Messaggio testuale descrittivo dell'utente al submit del form
    const userTextMsg: TextMessage = {
      id: Date.now(),
      role: 'user',
      type: 'text',
      content: "I sintomi durano da circa 2 mesi. Ha fatto un ciclo di PPI con beneficio parziale. Ha 52 anni e riferisce un calo di peso di circa 4 kg negli ultimi mesi."
    };
    setMessages(prev => [...prev, userTextMsg]);
    setIsTyping(true);

    // Risultato finale dell'agente
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
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '12px' }}>
                        Il quadro è suggestivo per:
                      </p>

                      <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <li>Dispepsia persistente ({'>'}4 settimane)</li>
                        <li>Risposta incompleta a terapia con PPI</li>
                        <li>Età ≥ 50 anni</li>
                        <li>Calo ponderale non intenzionale</li>
                      </ul>

                      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          <CheckCircle2 size={16} /> Raccomandazione
                        </div>

                        <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #1e293b' }}>
                          <h2 style={{ fontSize: '1.25rem', color: '#34d399', margin: '0 0 8px 0' }}>EGDS con classe di priorità B</h2>
                          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>(entro 10 giorni)</p>
                        </div>

                        <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold' }}>Motivazione:</p>
                          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.6' }}>
                            Il calo ponderale associato a sintomi digestivi rappresenta un criterio diretto per classe B (red flag), che richiede un approfondimento endoscopico rapido.
                          </p>
                        </div>

                        <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)' }}>
                          <p style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold' }}>Esempio di prescrizione:</p>
                          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.6', fontWeight: 'bold' }}>
                            EGDS – Classe B (entro 10 giorni)
                          </p>
                          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' }}>
                            Indicazione: dispepsia persistente con calo ponderale non intenzionale (~4 kg), parziale risposta a PPI.
                          </p>
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

// --- Form di 4 domande ---
interface InteractiveFormProps {
  content: string;
  onSubmit: () => void;
}

const InteractiveForm: React.FC<InteractiveFormProps> = ({ content, onSubmit }) => {
  const [duration, setDuration] = useState<string | null>('< 6 mesi');
  const [weightLoss, setWeightLoss] = useState<string | null>('Sì');
  const [ppi, setPpi] = useState<string | null>('Sì');
  const [age, setAge] = useState<string | null>('≥ 50 anni');

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = () => {
    if (duration && weightLoss && ppi && age) {
      setSubmitted(true);
      onSubmit();
    }
  };

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
          display: 'flex', alignItems: 'center', gap: '12px',
          flex: 1
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
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '10px' }}>
            I sintomi perdurano da:
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {renderRadio('< 6 mesi', duration, setDuration)}
            {renderRadio('≥ 6 mesi', duration, setDuration)}
          </div>
        </div>

        {/* DOMANDA 2 */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '10px' }}>
            Il paziente ha avuto un calo ponderale non intenzionale?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {renderRadio('Sì', weightLoss, setWeightLoss)}
            {renderRadio('no', weightLoss, setWeightLoss)}
          </div>
        </div>

        {/* DOMANDA 3 */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '10px' }}>
            Ha già effettuato terapia con PPI?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {renderRadio('Sì', ppi, setPpi)}
            {renderRadio('no', ppi, setPpi)}
          </div>
        </div>

        {/* DOMANDA 4 */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '10px' }}>
            Età del paziente:
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {renderRadio('< 50 anni', age, setAge)}
            {renderRadio('≥ 50 anni', age, setAge)}
          </div>
        </div>

      </div>

      <button
        onClick={handleSubmit}
        disabled={!duration || !weightLoss || !ppi || !age || submitted}
        className="submit-btn"
        style={{
          background: submitted ? '#f1f5f9' : '#fff',
          color: submitted ? '#475569' : '#000',
          cursor: submitted ? 'default' : 'pointer',
          marginTop: '24px',
          padding: '12px',
          width: '100%',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}
      >
        {submitted ? 'Dati Inviati ✓' : 'Invia Dati'}
      </button>
    </div>
  );
};

export default PrescrAIbeFlow;