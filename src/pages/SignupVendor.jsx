import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import nyscLogo from '/nysc-logo.png';
import './Auth.css';

const CATEGORIES = [
  { value: 'food', label: '🍛 Food Seller' },
  { value: 'laundry', label: '🧺 Laundry Service' },
  { value: 'errands', label: '🛍️ Errand Runner' },
  { value: 'items', label: '🛒 Items / Supplies' },
];

export default function SignupVendor() {
  const { registerVendor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', name: '', businessName: '',
    phone: '', category: '', location: '', description: ''
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
      await registerVendor(email, password, profile);
      navigate('/vendor/dashboard');
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
          <div className="auth-role-badge auth-role-badge--vendor">🏪 Vendor / Seller</div>
          <h1 className="auth-title">List your service</h1>
          <p className="auth-sub">Get discovered by corps members in your camp</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="auth-row">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input name="name" className="form-input" placeholder="Full name"
                  value={form.name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Business / Service Name</label>
                <input name="businessName" className="form-input" placeholder="e.g. Mama Bisi Foods"
                  value={form.businessName} onChange={handle} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input name="phone" className="form-input" placeholder="08012345678"
                value={form.phone} onChange={handle} required />
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
            <div className="form-group">
              <label className="form-label">Service Category</label>
              <select name="category" className="form-input" value={form.category} onChange={handle} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location in Camp</label>
              <input name="location" className="form-input" placeholder="e.g. Mame Market, Stall 4"
                value={form.location} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Describe Your Service</label>
              <textarea name="description" className="form-input" rows={3}
                placeholder="What do you offer? Prices? Timings?"
                value={form.description} onChange={handle} required />
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Registering...' : 'Start Receiving Orders →'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
          <p className="auth-switch">Corps member? <Link to="/signup/corps">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
}
