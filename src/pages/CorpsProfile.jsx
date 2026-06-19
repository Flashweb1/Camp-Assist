
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CorpsProfile.css';

export default function CorpsProfile() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initials = (userProfile?.name || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="page">
      <div className="container">
        <div className="page-hd">
          <div className="page-hd__title">My Profile</div>
        </div>

        {/* Avatar & name */}
        <div className="cp-hero card">
          <div className="cp-avatar">{initials}</div>
          <div className="cp-hero__info">
            <div className="cp-name">{userProfile?.name}</div>
            <div className="cp-code badge badge--green">{userProfile?.stateCode}</div>
          </div>
        </div>

        {/* Details */}
        <div className="cp-section card">
          <div className="cp-section__title">Camp Details</div>
          {[
            { icon: '📱', label: 'Phone', value: userProfile?.phone },
            { icon: '🏕️', label: 'Platoon', value: userProfile?.platoon },
            { icon: '🏠', label: 'Hostel / Block', value: userProfile?.hostelBlock },
            { icon: '📧', label: 'Email', value: userProfile?.email },
          ].map(({ icon, label, value }) => (
            <div key={label} className="cp-field">
              <span className="cp-field__icon">{icon}</span>
              <div>
                <div className="cp-field__label">{label}</div>
                <div className="cp-field__value">{value || '—'}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit */}
        <button className="btn btn--outline btn--full" style={{ marginBottom: 12 }} onClick={() => navigate('/profile/edit')}>
          ✏️ Edit Profile
        </button>

        <button className="btn btn--danger btn--full" onClick={handleLogout}>
          🚪 Log Out
        </button>
      </div>
    </div>
  );
}
