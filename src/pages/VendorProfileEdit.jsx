import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { value: 'food', label: '🍛 Food Seller' },
  { value: 'laundry', label: '🧺 Laundry Service' },
  { value: 'errands', label: '🛍️ Errand Runner' },
  { value: 'items', label: '🛒 Items / Supplies' },
];

export default function VendorProfileEdit() {
  const { currentUser, userProfile, loadProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: userProfile?.businessName || '',
    phone: userProfile?.phone || '',
    category: userProfile?.category || '',
    location: userProfile?.location || '',
    description: userProfile?.description || '',
    isAvailable: userProfile?.isAvailable ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'vendors', currentUser.uid), form);
      await loadProfile(currentUser.uid);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-hd">
          <div className="page-hd__title">Edit Profile</div>
          <div className="page-hd__sub">Update your service details</div>
        </div>

        {saved && (
          <div style={{ background: 'rgba(42,138,80,0.12)', border: '1px solid rgba(42,138,80,0.3)', color: '#6BC98A', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: '0.88rem' }}>
            ✅ Profile updated successfully!
          </div>
        )}

        <form onSubmit={submit}>
          {/* Availability toggle */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Availability</div>
              <div style={{ fontSize: '0.82rem', color: '#618A72' }}>Toggle to accept or pause orders</div>
            </div>
            <label className="toggle-wrap">
              <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handle} style={{ display: 'none' }} />
              <div className={`toggle ${form.isAvailable ? 'toggle--on' : ''}`} onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}>
                <div className="toggle__thumb" />
              </div>
              <span style={{ fontSize: '0.85rem', color: form.isAvailable ? '#6BC98A' : '#618A72', fontWeight: 600 }}>
                {form.isAvailable ? 'Open' : 'Closed'}
              </span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Business / Service Name</label>
            <input name="businessName" className="form-input" value={form.businessName} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input name="phone" className="form-input" value={form.phone} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" className="form-input" value={form.category} onChange={handle} required>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location in Camp</label>
            <input name="location" className="form-input" value={form.location} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Service Description</label>
            <textarea name="description" className="form-input" rows={4} value={form.description} onChange={handle} required />
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <style>{`
          .toggle-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }
          .toggle { width: 48px; height: 26px; border-radius: 999px; background: rgba(255,255,255,0.1); border: 1.5px solid rgba(42,138,80,0.25); position: relative; transition: all 0.25s ease; cursor: pointer; }
          .toggle--on { background: #2A8A50; border-color: #3DAD69; }
          .toggle__thumb { width: 20px; height: 20px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px; transition: transform 0.25s ease; }
          .toggle--on .toggle__thumb { transform: translateX(22px); }
        `}</style>
      </div>
    </div>
  );
}
