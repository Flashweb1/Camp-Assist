import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const CORPS_LINKS = [
  { to: '/community', icon: '💬', label: 'Feed' },
  { to: '/vendors', icon: '🏪', label: 'Discover' },
  { to: '/orders', icon: '📦', label: 'Orders' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

const VENDOR_LINKS = [
  { to: '/vendor/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/vendor/orders', icon: '📋', label: 'Orders' },
  { to: '/vendor/profile/edit', icon: '⚙️', label: 'Profile' },
];

const ADMIN_LINKS = [
  { to: '/admin', icon: '👑', label: 'Admin' },
  { to: '/orders', icon: '📦', label: 'Orders' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function Navbar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? ADMIN_LINKS : role === 'vendor' ? VENDOR_LINKS : CORPS_LINKS;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `navbar__item ${isActive ? 'navbar__item--active' : ''}`}
          >
            <span className="navbar__icon">{icon}</span>
            <span className="navbar__label">{label}</span>
          </NavLink>
        ))}
        <button className="navbar__item navbar__item--logout" onClick={handleLogout}>
          <span className="navbar__icon">🚪</span>
          <span className="navbar__label">Logout</span>
        </button>
      </div>
    </nav>
  );
}
