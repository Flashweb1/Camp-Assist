import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import nyscLogo from '/nysc-logo.png';
import './PublicNavbar.css';

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const close = () => { setOpen(false); setDropOpen(false); };

  return (
    <nav className="pub-nav">
      <div className="container pub-nav__inner">
        <NavLink to="/" className="pub-nav__logo" onClick={close}>
          <img src={nyscLogo} alt="NYSC" className="pub-nav__logo-img" />
          <span className="pub-nav__logo-text">CampAssist</span>
        </NavLink>

        <button className={`pub-nav__toggle ${open ? 'pub-nav__toggle--open' : ''}`}
          onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <div className={`pub-nav__menu ${open ? 'pub-nav__menu--open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `pub-nav__link ${isActive ? 'pub-nav__link--active' : ''}`} onClick={close}>Home</NavLink>
          <NavLink to="/vendors" className={({ isActive }) => `pub-nav__link ${isActive ? 'pub-nav__link--active' : ''}`} onClick={close}>Discover Vendors</NavLink>
          <NavLink to="/blog" className={({ isActive }) => `pub-nav__link ${isActive ? 'pub-nav__link--active' : ''}`} onClick={close}>Blog</NavLink>
          <NavLink to="/community" className={({ isActive }) => `pub-nav__link ${isActive ? 'pub-nav__link--active' : ''}`} onClick={close}>Community</NavLink>
          <NavLink to="/faq" className={({ isActive }) => `pub-nav__link ${isActive ? 'pub-nav__link--active' : ''}`} onClick={close}>FAQ</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `pub-nav__link ${isActive ? 'pub-nav__link--active' : ''}`} onClick={close}>Contact</NavLink>

          <div className="pub-nav__signup-wrap"
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}>
            <button className="pub-nav__link pub-nav__link--signup"
              onClick={() => setDropOpen(d => !d)}>
              Sign Up <span className="pub-nav__arrow">▾</span>
            </button>
            {dropOpen && (
              <div className="pub-nav__drop">
                <Link to="/signup/corps" className="pub-nav__drop-item" onClick={close}>As Corps Member</Link>
                <Link to="/signup/vendor" className="pub-nav__drop-item" onClick={close}>As Vendor</Link>
              </div>
            )}
          </div>

          <Link to="/login" className="btn btn--gold btn--sm pub-nav__login" onClick={close}>Log In</Link>
        </div>
      </div>
    </nav>
  );
}
