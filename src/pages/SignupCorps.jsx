import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import nyscLogo from '/nysc-logo.png';
import './Auth.css';

const PLATOONS = Array.from({ length: 10 }, (_, i) => `Platoon ${i + 1}`);

export default function SignupCorps() {
  const { registerCorpsMember } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '',
    stateCode: '', platoon: '', hostelBlock: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const { email, password, ...profile } = form;
      await registerCorpsMember(email, password, profile);
      navigate('/home');
    } catch (err) {
      setError(err?.code === 'auth/email-already-in-use' ? 'Email already registered.' : err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
      </div>
      <div className="container--sm auth-wrap">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <img src={nyscLogo} alt="NYSC" className="auth-logo-img" />
          <span>CampAssist</span>
        </div>
        <div className="auth-card card">
          <div className="auth-role-badge">🎖️ Corps Member</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Start ordering from vendors in your camp</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="auth-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-input" placeholder="Your full name"
                  value={form.name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phone" className="form-input" placeholder="08012345678"
                  value={form.phone} onChange={handle} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-input" placeholder="you@email.com"
                value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" placeholder="Min 6 characters"
                value={form.password} onChange={handle} required />
            </div>
            <div className="auth-row">
              <div className="form-group">
                <label className="form-label">NYSC State Code</label>
                <input name="stateCode" className="form-input" placeholder="LA/24A/1234"
                  value={form.stateCode} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Platoon</label>
                <select name="platoon" className="form-input" value={form.platoon} onChange={handle} required>
                  <option value="">Select platoon</option>
                  {PLATOONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hostel / Block</label>
              <input name="hostelBlock" className="form-input" placeholder="e.g. Block B, Room 14"
                value={form.hostelBlock} onChange={handle} required />
            </div>
            <button type="submit" className="btn btn--gold btn--full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
          <p className="auth-switch">Are you a vendor? <Link to="/signup/vendor">Vendor sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
