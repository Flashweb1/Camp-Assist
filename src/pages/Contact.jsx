import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './Contact.css';

export default function Contact() {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const name = userProfile?.name || userProfile?.businessName || '';
      const email = currentUser.email || '';
      setForm(p => ({ ...p, name, email }));
    }
  }, [currentUser, userProfile]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.message.trim() || !form.subject.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: currentUser?.uid || null,
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        status: 'open',
        adminReply: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      addToast('Message sent! We\'ll get back to you soon.', 'success');
      setForm(p => ({ ...p, subject: '', message: '' }));
    } catch {
      addToast('Failed to send. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page page">
      <div className="container">
        <div className="page-hd" style={{ textAlign: 'center' }}>
          <div className="page-hd__sub" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>Support</div>
          <div className="page-hd__title">Contact Us</div>
          <p className="page-hd__sub">Have an issue or question? Send us a message and we'll respond promptly.</p>
        </div>

        <form className="contact-form card" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input className="form-input" value={form.subject}
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              placeholder="Brief title" required />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-input" rows={6} value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Describe your issue or question in detail..." required />
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
