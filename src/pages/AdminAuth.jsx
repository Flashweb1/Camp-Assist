import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useToast } from '../context/ToastContext';
import nyscLogo from '/nysc-logo.png';
import './Auth.css';

const ADMIN_CODE = 'CAMP2024';

export default function AdminAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const isSignup = location.pathname.includes('/signup');
  const [mode, setMode] = useState(isSignup ? 'signup' : 'login'); // 'signup' | 'login'
  const [form, setForm] = useState({ email: '', password: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && form.code !== ADMIN_CODE) {
      setError('Invalid admin setup code.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          role: 'admin',
          email: form.email,
          createdAt: serverTimestamp(),
        });
        addToast('Admin account created! You are now logged in.', 'success');
        navigate('/admin');
      } else {
        const { user } = await signInWithEmailAndPassword(auth, form.email, form.password);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          setError('This account does not have admin access.');
          return;
        }
        navigate('/admin');
      }
    } catch (err) {
      const msg = err?.code === 'auth/invalid-credential' ? 'Invalid email or password.'
        : err?.code === 'auth/email-already-in-use' ? 'An account with this email already exists.'
        : err?.message || 'Something went wrong.';
      setError(msg);
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
          <div className="auth-role-badge">Admin Portal</div>
          <h1 className="auth-title">{mode === 'signup' ? 'Create Admin' : 'Admin Login'}</h1>
          <p className="auth-sub">{mode === 'signup' ? 'Set up your admin account to manage CampAssist.' : 'Log in to manage CampAssist.'}</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-input" placeholder="admin@camp.com"
                value={form.email} onChange={set} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" placeholder="••••••••"
                value={form.password} onChange={set} required minLength={6} />
            </div>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Admin Setup Code</label>
                <input name="code" type="password" className="form-input" placeholder="Enter setup code"
                  value={form.code} onChange={set} required />
              </div>
            )}
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Admin Account →' : 'Log In →'}
            </button>
          </form>
          <div className="auth-switch">
            {mode === 'signup' ? (
              <>Already have admin access? <Link to="/admin/login">Log in →</Link></>
            ) : (
              <>No admin account yet? <Link to="/admin/signup">Create one →</Link></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
