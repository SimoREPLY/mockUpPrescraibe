import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, Clock, AlertCircle, CheckSquare, MessageSquare } from 'lucide-react';
import './index.css';

// --- Types ---
interface ClinicalOption {
  id: string;
  label: string;
  priority: 'B' | 'D' | 'P';
  days: number;
}

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
  data: ClinicalOption[];
  finalPriority: 'B' | 'D' | 'P';
  finalDays: number;
}

type Message = TextMessage | FormMessage | ResultMessage;

// --- Dati finti per la cronologia Sidebar ---
const fakeHistory = [
  { id: 'curr', label: 'Nuova EGDS - Paziente...', active: true },
  { id: 'h1', label: 'Ecografia addome - Urgente', active: false },
  { id: 'h2', label: 'Visita cardiologica - Classe D', active: false },
  { id: 'h3', label: 'Risonanza magnetica ginoc...', active: false },
  { id: 'h4', label: 'Visita dermatologica', active: false },
  { id: 'h5', label: 'Esami ematochimici - Controllo', active: false },
];

// --- Dati raggruppati in 3 Categorie (EGDS) ---
const clinicalGroups = [
  {
    title: "1. Segni di Allarme",
    options: [
      { id: 'b2', label: 'Calo ponderale significativo con sintomi digestivi', priority: 'B', days: 10 },
      { id: 'b3', label: 'Disfagia o Vomito ricorrente (da almeno 5-7 gg)', priority: 'B', days: 10 },
      { id: 'b4', label: 'Sospetta neoplasia (clinica o imaging)', priority: 'B', days: 10 }
    ] as ClinicalOption[]
  },
  {
    title: "2. Anemia ed Esami Laboratoristici",
    options: [
      { id: 'b1', label: 'Anemia normo-microcitica (Hb < 10) nuova diagnosi', priority: 'B', days: 10 },
      { id: 'd1', label: 'Anemia sideropenica o macrocitica', priority: 'D', days: 30 },
      { id: 'd3', label: 'Conferma di celiachia (sierologia positiva)', priority: 'D', days: 30 }
    ] as ClinicalOption[]
  },
  {
    title: "3. Sindrome Dispeptica / Reflusso",
    options: [
      { id: 'd2', label: 'Paziente > 50 anni con sintomi recenti (< 6 mesi)', priority: 'D', days: 30 },
      { id: 'p1', label: 'Paziente < 50 anni persistente dopo test HP', priority: 'P', days: 90 }
    ] as ClinicalOption[]
  }
];

const allOptions = clinicalGroups.flatMap(g => g.options);

const PrescrAIbeFlow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'user',
      type: 'text',
      content: 'Buongiorno, devo prescrivere una Esofagogastroduodenoscopia (EGDS) per un mio paziente.'
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const formMsg: FormMessage = {
        id: Date.now(),
        role: 'agent',
        type: 'form',
        content: 'Buongiorno Dr. Rossi. Per assegnare la corretta classe di priorità all\'EGDS, la prego di selezionare uno o più sintomi rilevati nel paziente:'
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

  const handleFormSubmit = (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;

    const selectedSymptoms = selectedIds.map(id => allOptions.find(opt => opt.id === id)!).filter(Boolean);

    const confirmMsg: TextMessage = {
      id: Date.now(),
      role: 'user',
      type: 'text',
      content: `Quadri clinici confermati:\n${selectedSymptoms.map(s => `- ${s.label}`).join('\n')}`
    };
    setMessages(prev => [...prev, confirmMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let finalPriority: 'B' | 'D' | 'P' = 'P';
      let finalDays = 90;

      const hasB = selectedSymptoms.some(s => s.priority === 'B');
      const hasD = selectedSymptoms.some(s => s.priority === 'D');

      if (hasB) {
        finalPriority = 'B';
        finalDays = 10;
      } else if (hasD) {
        finalPriority = 'D';
        finalDays = 30;
      }

      const resultMsg: ResultMessage = {
        id: Date.now() + 1,
        role: 'agent',
        type: 'result',
        data: selectedSymptoms,
        finalPriority,
        finalDays
      };
      setMessages(prev => [...prev, resultMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="app-container">
      {/* SIDEBAR AGGIORNATA CON CRONOLOGIA */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity color="#3b82f6" size={24} />
          <span>PrescrAIbe</span>
        </div>

        <div className="history-section custom-scrollbar">
          <div className="history-title">
            <Clock size={12} /> Ultime Conversazioni
          </div>
          {fakeHistory.map(chat => (
            <div key={chat.id} className={`history-item ${chat.active ? 'active' : ''}`}>
              <MessageSquare size={14} color={chat.active ? "#60a5fa" : "#64748b"} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {chat.label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: '1.5rem', fontSize: '12px', color: '#64748b', borderTop: '1px solid #1e293b', background: '#0d131f' }}>
          <p style={{ fontWeight: 'bold', color: '#cbd5e1', margin: '0 0 4px 0' }}>Dr. Rossi</p>
          <p style={{ margin: 0 }}>Azienda Zero - Veneto</p>
        </div>
      </aside>

      <main className="main-chat">
        <div className="messages-list custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.role}`}>

              {msg.role === 'user' ? (
                <div className="bubble-user" style={{ whiteSpace: 'pre-line' }}>
                  {msg.type === 'text' && msg.content}
                </div>
              ) : (
                <div className="agent-container">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                    <div style={{ width: '28px', height: '28px', background: 'rgba(59,130,246,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 'bold' }}>AI</div>
                    Agente AI
                  </div>

                  {msg.type === 'text' && (
                    <div className="bubble-agent-text">
                      {msg.content}
                    </div>
                  )}

                  {msg.type === 'form' && (
                    <InteractiveForm
                      content={msg.content}
                      onSubmit={handleFormSubmit}
                    />
                  )}

                  {msg.type === 'result' && (
                    <div className="result-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 'bold', marginBottom: '16px' }}>
                        <AlertCircle size={18} />
                        Raccomandazione Finale Elaborata
                      </div>

                      <div className="priority-box">
                        <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Classe di Priorità Suggerita</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 12px 0' }}>Classe {msg.finalPriority}</h2>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1e293b', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid #334155' }}>
                          <Clock size={14} color="#60a5fa" />
                          Tempo massimo di attesa: {msg.finalDays} giorni
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                        <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>Sintomi considerati per l'analisi:</span>
                        <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: '1.6' }}>
                          {msg.data.map(s => <li key={s.id}>{s.label}</li>)}
                        </ul>
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
              L'agente sta valutando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <form className="input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Scrivi una risposta o nuova richiesta..."
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
        </div>
      </main>
    </div>
  );
};

// --- Form Interattivo con Checkbox Multipli ---
interface InteractiveFormProps {
  content: string;
  onSubmit: (ids: string[]) => void;
}

const InteractiveForm: React.FC<InteractiveFormProps> = ({ content, onSubmit }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length > 0) {
      setSubmitted(true);
      onSubmit(selectedIds);
    }
  };

  return (
    <div className="form-card" style={{ width: '100%', minWidth: '350px' }}>
      <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: '#e2e8f0', lineHeight: 1.5 }}>{content}</p>

      <div style={{ opacity: submitted ? 0.6 : 1, pointerEvents: submitted ? 'none' : 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {clinicalGroups.map((group, idx) => (
          <div key={idx}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>{group.title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {group.options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleSelection(opt.id)}
                    className={`option-btn ${isSelected ? 'selected' : ''}`}
                    style={{ borderRadius: '6px', padding: '10px' }}
                  >
                    <div style={{
                      width: '16px', height: '16px', flexShrink: 0,
                      border: `1px solid ${isSelected ? '#3b82f6' : '#64748b'}`,
                      borderRadius: '4px',
                      background: isSelected ? '#3b82f6' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSelected && <CheckSquare size={14} color="#fff" />}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedIds.length === 0 || submitted}
        className="submit-btn"
        style={{
          background: selectedIds.length > 0 && !submitted ? '#2563eb' : '#334155',
          color: selectedIds.length > 0 && !submitted ? '#fff' : '#94a3b8',
          cursor: selectedIds.length > 0 && !submitted ? 'pointer' : 'not-allowed',
          marginTop: '24px'
        }}
      >
        {submitted ? 'Dati Inviati ✓' : `Conferma ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''} e Invia`}
      </button>
    </div>
  );
};

export default PrescrAIbeFlow;