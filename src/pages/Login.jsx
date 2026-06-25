import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import nyscLogo from '/nysc-logo.png';
import './Auth.css';

export default function Login() {
  const { login, resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirect');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      if (redirectTo) navigate(redirectTo);
    } catch (err) {
      setError(err?.code === 'auth/invalid-credential' ? 'Invalid email or password.' : err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!form.email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setResetting(true);
    try {
      await resetPassword(form.email);
      addToast('Password reset email sent. Check your inbox.', 'success');
    } catch (err) {
      setError(err?.message || 'Failed to send reset email.');
    } finally {
      setResetting(false);
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Log in to your account</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-input" placeholder="you@email.com"
                value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" placeholder="••••••••"
                value={form.password} onChange={handle} required />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn--ghost btn--sm"
                  onClick={handleReset} disabled={resetting}
                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                  {resetting ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </form>
          <div className="auth-divider"><span>New to CampAssist?</span></div>
          <div className="auth-alts">
            <Link to="/signup/corps" className="btn btn--outline btn--full">Join as Corps Member</Link>
            <Link to="/signup/vendor" className="btn btn--outline btn--full">Join as Vendor</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
