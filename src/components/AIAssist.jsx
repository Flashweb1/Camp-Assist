import { useState, useRef, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { askAI } from '../utils/ai';
import './AIAssist.css';

export default function AIAssist() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [context, setContext] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    async function loadContext() {
      try {
        const snap = await getDocs(collection(db, 'vendors'));
        const vendors = snap.docs.map(d => d.data());
        const summary = vendors.map(v => `${v.businessName || v.name} (${v.category}, ${v.isAvailable ? 'open' : 'closed'})`).join('; ');
        setContext(`Available vendors: ${summary || 'None yet.'}`);
      } catch { setContext(''); }
    }
    if (open) loadContext();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setBusy(true);
    try {
      const reply = await askAI(text, context);
      setMessages(m => [...m, { role: 'bot', text: reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'bot', text: '⚠️ ' + err.message }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className={`ai-fab ${open ? 'ai-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)} aria-label="AI Assistant">
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div className="ai-overlay">
          <div className="ai-header">
            <span>🤖 CampBot</span>
            <button className="ai-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="ai-body">
            {messages.length === 0 && (
              <div className="ai-welcome">
                <div className="ai-welcome__icon">👋</div>
                <div>Hi! Ask me anything about camp or vendors.</div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-msg--${m.role}`}>
                {m.text}
              </div>
            ))}
            {busy && <div className="ai-msg ai-msg--bot ai-thinking">Thinking<span className="dots"><span>.</span><span>.</span><span>.</span></span></div>}
            <div ref={bottomRef} />
          </div>
          <div className="ai-footer">
            <input className="ai-input" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask CampBot..."
              disabled={busy} />
            <button className="ai-send" onClick={send} disabled={busy || !input.trim()}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
