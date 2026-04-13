import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, Clock, AlertCircle, User } from 'lucide-react';
import './index.css';

// --- Types ---
interface ClinicalOption {
  id: string;
  label: string;
  priority: 'B' | 'D' | 'P';
  days: number;
}

type Message =
  | { id: number; role: 'user'; type: 'text'; content: string }
  | { id: number; role: 'agent'; type: 'text'; content: string }
  | { id: number; role: 'agent'; type: 'form'; content: string }
  | { id: number; role: 'agent'; type: 'result'; data: ClinicalOption };

// --- Data from JSON Guidelines ---
const clinicalOptions: ClinicalOption[] = [
  // Classe B
  { id: 'b1', label: 'Anemia normo-microcitica (Hb< 10 g/dl) di nuova diagnosi', priority: 'B', days: 10 },
  { id: 'b2', label: 'Calo ponderale significativo con sintomi digestivi', priority: 'B', days: 10 },
  { id: 'b3', label: 'Disfagia (presente da almeno 5-7 giorni)', priority: 'B', days: 10 },
  { id: 'b4', label: 'Sospette neoplasie rilevate obiettivamente e/o con imaging', priority: 'B', days: 10 },
  // Classe D
  { id: 'd1', label: 'Anemia sideropenica o macrocitica', priority: 'D', days: 30 },
  { id: 'd2', label: 'Pazienti > 50 anni con reflusso o dispepsia recente (< 6 mesi)', priority: 'D', days: 30 },
  { id: 'd3', label: 'Conferma di celiachia (sierologia positiva)', priority: 'D', days: 30 },
  // Classe P
  { id: 'p1', label: 'Pazienti < 50 anni con sintomi persistenti dopo test HP', priority: 'P', days: 90 },
  { id: 'p2', label: 'Valutazione ipertensione portale', priority: 'P', days: 90 }
];

const PrescrAIbeFlow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Step 1: Medico invia la richiesta iniziale
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now(), role: 'user', type: 'text', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Step 2: Agente propone il Form
    setTimeout(() => {
      const agentMsg: Message = {
        id: Date.now() + 1,
        role: 'agent',
        type: 'form',
        content: 'Certamente. Per la prestazione EGDS (45.13/45.16), selezioni l\'indicazione clinica per determinare la priorità:'
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1000);
  };

  // Step 3 & 4: Invio dati form -> Risposta finale Agente
  const onFormSubmit = (option: ClinicalOption) => {
    const userConfirm: Message = {
      id: Date.now(),
      role: 'user',
      type: 'text',
      content: `Indicazione selezionata: ${option.label}`
    };
    setMessages(prev => [...prev, userConfirm]);
    setIsTyping(true);

    setTimeout(() => {
      const finalResult: Message = {
        id: Date.now() + 1,
        role: 'agent',
        type: 'result',
        data: option
      };
      setMessages(prev => [...prev, finalResult]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity color="#3b82f6" size={24} /> PrescrAIbe
        </div>
        <div style={{ padding: '20px', fontSize: '12px', color: '#64748b', marginTop: 'auto' }}>
          Dr. Rossi<br />Azienda Zero - Veneto
        </div>
      </aside>

      <main className="main-chat">
        <div className="messages-list">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '20%', color: '#475569' }}>
              <p>Inizia scrivendo la prestazione che vuoi prescrivere.</p>
              <p style={{ fontSize: '12px' }}>(Es: "Devo prescrivere una EGDS")</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.role}`}>
              <div className={msg.role === 'agent' ? 'agent-container' : ''}>

                {msg.role === 'agent' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>AI</div>
                    Agente AI
                  </div>
                )}

                {msg.type === 'text' && (
                  <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-agent-text'}>
                    {msg.content}
                  </div>
                )}

                {msg.type === 'form' && (
                  <div className="form-card">
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{msg.content}</p>
                    <SymptomForm options={clinicalOptions} onSelect={onFormSubmit} />
                  </div>
                )}

                {msg.type === 'result' && (
                  <div className="result-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      <AlertCircle size={18} /> Analisi Completata
                    </div>
                    <div className="priority-box">
                      <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Classe Consigliata</p>
                      <h2 style={{ fontSize: '2rem', margin: '5px 0', color: '#fff' }}>Priorità {msg.data.priority}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <Clock size={14} /> Attesa max: {msg.data.days} giorni
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      <b>Motivazione:</b> {msg.data.label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && <div style={{ fontSize: '12px', color: '#475569' }}>L'agente sta scrivendo...</div>}
          <div ref={scrollRef} />
        </div>

        <div className="input-area">
          <form className="input-container" onSubmit={handleSend}>
            <input
              className="chat-input"
              placeholder="Scrivi qui la tua richiesta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="send-btn" type="submit"><Send size={18} /></button>
          </form>
        </div>
      </main>
    </div>
  );
};

// --- Child Component: The Form ---
const SymptomForm: React.FC<{ options: ClinicalOption[], onSelect: (o: ClinicalOption) => void }> = ({ options, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <div>
      <div className="form-group-label">Indicazioni Cliniche (45.13/45.16)</div>
      {options.map(o => (
        <button
          key={o.id}
          className={`option-btn ${selectedId === o.id ? 'selected' : ''}`}
          onClick={() => setSelectedId(o.id)}
          disabled={done}
        >
          <div className="radio-circle" /> {o.label}
        </button>
      ))}
      <button
        className="submit-btn"
        disabled={!selectedId || done}
        onClick={() => {
          setDone(true);
          const opt = options.find(x => x.id === selectedId);
          if (opt) onSelect(opt);
        }}
      >
        Invia Dati al Sistema
      </button>
    </div>
  );
};

export default PrescrAIbeFlow;