import { useNavigate } from 'react-router-dom';
import nyscLogo from '/nysc-logo.png';
import './Landing.css';

const FEATURES = [
  { icon: '🍛', title: 'Food Delivery', desc: 'Order from Mame Market vendors delivered to your hostel' },
  { icon: '🧺', title: 'Laundry', desc: 'Pickup & drop-off — clean clothes while you focus on drills' },
  { icon: '🛍️', title: 'Errands', desc: 'Need something done? Get a runner on it fast' },
  { icon: '🛒', title: 'Items & Supplies', desc: 'Toiletries, stationery, and more within camp' },
  { icon: '💬', title: 'Community Feed', desc: 'Connect with fellow corps members, share tips, and stay in the loop' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Get instant answers about vendors, orders, and camp life — 24/7' },
  { icon: '📍', title: 'Live Location', desc: 'Track your vendor in real-time as they head to your delivery spot' },
];

const HOW = [
  { step: '1', title: 'Create your account', desc: 'Sign up as a corps member with your NYSC state code & block number' },
  { step: '2', title: 'Browse vendors', desc: 'Discover food sellers, laundry ops, and errand runners inside camp' },
  { step: '3', title: 'Place your order', desc: 'Tell the vendor what you need — they come to you' },
  { step: '4', title: 'Pay on delivery', desc: 'No upfront payment. Cash when your order arrives 💵' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="land-page">
      {/* Hero */}
      <section className="land__hero">
        <div className="land__bg">
          <div className="land__orb land__orb--1" />
          <div className="land__orb land__orb--2" />
        </div>
        <div className="container land__hero-inner">
          <div className="land__badge fade-in">
            <img src={nyscLogo} alt="NYSC" className="land__badge-logo" />
            Built for NYSC Camp
          </div>
          <h1 className="land__title slide-up">
            Your Camp,<br />
            <span className="land__title--gold">Now Connected.</span>
          </h1>
          <p className="land__subtitle slide-up" style={{ animationDelay: '0.1s' }}>
            CampAssist links NYSC corps members with vendors inside camp —
            food, laundry, errands, community, and AI-powered help. No stress. Pay on delivery.
          </p>
          <div className="land__actions slide-up" style={{ animationDelay: '0.2s' }}>
            <button className="btn btn--gold btn--lg" onClick={() => navigate('/signup/corps')}>
              I'm a Corps Member →
            </button>
            <button className="btn btn--outline btn--lg" onClick={() => navigate('/vendors')}>
              Browse Vendors →
            </button>
            <button className="btn btn--outline btn--lg" onClick={() => navigate('/signup/vendor')}>
              I'm a Vendor / Seller
            </button>
          </div>
          <div className="slide-up" style={{ animationDelay: '0.3s', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text2)' }}>
            Already have an account?{' '}
            <span style={{ color: 'var(--green-200)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/login')}>Log in</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="land__features">
        <div className="container">
          <div className="page-hd" style={{ textAlign: 'center', paddingTop: 0 }}>
            <div className="page-hd__sub" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>Services</div>
            <div className="page-hd__title">Everything you need, inside camp</div>
          </div>
          <div className="land__grid">
            {FEATURES.map(f => (
              <div key={f.title} className="land__feature-card card">
                <div className="land__feature-icon">{f.icon}</div>
                <div className="land__feature-title">{f.title}</div>
                <div className="land__feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="land__steps">
        <div className="container">
          <div className="page-hd" style={{ textAlign: 'center', paddingTop: 0 }}>
            <div className="page-hd__sub" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>How it works</div>
            <div className="page-hd__title">Simple. Fast. Reliable.</div>
          </div>
          <div className="land__grid">
            {HOW.map(h => (
              <div key={h.step} className="land__step-card card">
                <div className="land__step-num">{h.step}</div>
                <div className="land__feature-title" style={{ marginTop: 24, fontSize: '1.2rem', color: '#fff' }}>{h.title}</div>
                <div className="land__feature-desc">{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="land__cta">
        <div className="container">
          <div className="land__cta-card">
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏪</div>
            <h2 className="land__cta-title">Are you a vendor in camp?</h2>
            <p className="land__cta-desc">
              Get your services in front of hundreds of corps members. Sign up, list your services, and start receiving orders directly on your phone.
            </p>
            <button className="btn btn--primary btn--lg" onClick={() => navigate('/signup/vendor')}>
              Join as a Vendor →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="land__footer">
        <div className="land__footer-logo">
          <img src={nyscLogo} alt="NYSC" className="land__footer-logo-img" />
          CampAssist
        </div>
        <p className="land__footer-text">Making camp life easier, one order at a time.</p>
      </footer>
    </div>
  );
}
