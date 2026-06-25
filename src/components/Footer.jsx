import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import nyscLogo from '/nysc-logo.png';
import './Footer.css';

export default function Footer() {
  const { currentUser } = useAuth();

  return (
    <footer className="ft">
      <div className="container ft__inner">
        <div className="ft__brand">
          <div className="ft__logo">
            <img src={nyscLogo} alt="NYSC" className="ft__logo-img" />
            <span className="ft__logo-text">CampAssist</span>
          </div>
          <p className="ft__tagline">Making camp life easier, one order at a time.</p>
        </div>

        <div className="ft__links">
          <div className="ft__col">
            <h4 className="ft__col-title">Explore</h4>
            <Link to="/vendors" className="ft__link">Vendors</Link>
            <Link to="/blog" className="ft__link">Blog</Link>
            <Link to="/community" className="ft__link">Community</Link>
            <Link to="/faq" className="ft__link">FAQ</Link>
          </div>

          <div className="ft__col">
            <h4 className="ft__col-title">Support</h4>
            <Link to="/faq" className="ft__link">Help & FAQ</Link>
            {currentUser ? (
              <>
                <Link to="/orders" className="ft__link">My Orders</Link>
                <Link to="/profile" className="ft__link">My Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="ft__link">Log In</Link>
                <Link to="/signup/corps" className="ft__link">Sign Up</Link>
              </>
            )}
          </div>

          <div className="ft__col">
            <h4 className="ft__col-title">CampAssist</h4>
            <span className="ft__link-text">Built for NYSC camp</span>
            <span className="ft__link-text">Pay on delivery</span>
            <span className="ft__link-text">Cash or transfer</span>
          </div>
        </div>
      </div>

      <div className="ft__bottom">
        <div className="container ft__bottom-inner">
          <span>&copy; {new Date().getFullYear()} CampAssist</span>
          <span>Built with ❤️ for NYSC</span>
        </div>
      </div>
    </footer>
  );
}
