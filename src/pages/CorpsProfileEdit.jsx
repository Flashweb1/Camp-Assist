import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PLATOONS = Array.from({ length: 10 }, (_, i) => `Platoon ${i + 1}`);

export default function CorpsProfileEdit() {
  const { currentUser, userProfile, loadProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: userProfile?.phone || '',
    hostelBlock: userProfile?.hostelBlock || '',
    platoon: userProfile?.platoon || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'corps_members', currentUser.uid), form);
      await loadProfile(currentUser.uid);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-hd">
          <div className="page-hd__title">Edit Profile</div>
          <div className="page-hd__sub">Update your camp details</div>
        </div>

        {saved && (
          <div className="success-banner">
            ✅ Profile updated successfully!
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input name="phone" className="form-input" value={form.phone} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Platoon</label>
            <select name="platoon" className="form-input" value={form.platoon} onChange={handle} required>
              {PLATOONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Hostel / Block</label>
            <input name="hostelBlock" className="form-input" value={form.hostelBlock} onChange={handle} required />
          </div>

          <button type="submit" className="btn btn--gold btn--full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <button className="btn btn--ghost btn--full" style={{ marginTop: 12 }} onClick={() => navigate('/profile')}>
          ← Back to Profile
        </button>
      </div>
    </div>
  );
}
