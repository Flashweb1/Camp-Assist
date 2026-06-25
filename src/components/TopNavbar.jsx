import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import nyscLogo from '/nysc-logo.png';
import './TopNavbar.css';

const CORPS_LINKS = [
  { to: '/community', label: 'Feed' },
  { to: '/vendors', label: 'Discover' },
  { to: '/orders', label: 'Orders' },
  { to: '/profile', label: 'Profile' },
];

const VENDOR_LINKS = [
  { to: '/vendor/dashboard', label: 'Dashboard' },
  { to: '/vendor/orders', label: 'Orders' },
  { to: '/vendor/profile/edit', label: 'Profile' },
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Admin' },
  { to: '/orders', label: 'Orders' },
  { to: '/profile', label: 'Profile' },
];

export default function TopNavbar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = role === 'admin' ? ADMIN_LINKS : role === 'vendor' ? VENDOR_LINKS : CORPS_LINKS;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="top-nav">
      <div className="container top-nav__inner">
        <NavLink to="/" className="top-nav__logo" onClick={() => setOpen(false)}>
          <img src={nyscLogo} alt="NYSC" className="top-nav__logo-img" />
          <span className="top-nav__logo-text">CampAssist</span>
        </NavLink>

        <button
          className={`top-nav__toggle ${open ? 'top-nav__toggle--open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>

        <div className={`top-nav__menu ${open ? 'top-nav__menu--open' : ''}`}>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `top-nav__link ${isActive ? 'top-nav__link--active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <button className="top-nav__link top-nav__link--logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
