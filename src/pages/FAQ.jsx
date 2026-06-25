import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQ.css';

const FAQ_DATA = [
  {
    category: 'Getting Started',
    items: [
      { q: 'How do I create an account?', a: 'Click "Sign Up" in the top navigation, choose "Corps Member" or "Vendor", fill in your details, and submit. You\'ll be logged in automatically.' },
      { q: 'Can I sign up as both a corps member and vendor?', a: 'No, each account has one role. If you\'re a corps member who also sells, ask your friend to register the vendor account, or use a different email.' },
      { q: 'I forgot my password. What do I do?', a: 'Firebase Auth handles password resets via email. On the Login page, click the link (coming soon) or use the Firebase console to send a reset email.' },
    ],
  },
  {
    category: 'Orders & Payments',
    items: [
      { q: 'How do I place an order?', a: 'Browse vendors, tap a vendor to view their profile, then tap "Place an Order". Describe what you need, confirm the delivery location, and submit.' },
      { q: 'Can I cancel an order?', a: 'Yes, while the order is still "Pending", both the corps member and vendor can cancel. Once accepted, contact the vendor through the chat.' },
      { q: 'How does payment work?', a: 'Pay on delivery. You pay the vendor directly in cash or transfer when they deliver. No upfront payment required.' },
      { q: 'What if my order doesn\'t arrive?', a: 'Use the in-app chat to contact the vendor. If unresolved, you can cancel the order. For serious issues, contact camp admin.' },
    ],
  },
  {
    category: 'Vendors',
    items: [
      { q: 'How do I register as a vendor?', a: 'Click "Sign Up" → "As Vendor". Fill in your business name, category (food, laundry, errands, items), location, and description.' },
      { q: 'Is there a fee for vendors?', a: 'No. CampAssist is free to use for both vendors and corps members. You keep 100% of your earnings.' },
      { q: 'How do I update my menu or services?', a: 'Go to your Profile from the bottom nav, tap "Edit Profile", and update your description, availability, and contact info.' },
      { q: 'How do I receive orders?', a: 'Orders appear on your Dashboard. You\'ll see pending orders with the corps member\'s details. Accept, mark in progress, and mark delivered as you fulfill.' },
    ],
  },
  {
    category: 'Camp Life',
    items: [
      { q: 'Is this only for NYSC camp?', a: 'Yes, CampAssist is designed specifically for NYSC orientation camps to connect corps members with on-camp vendors.' },
      { q: 'Can I use CampAssist after camp?', a: 'The app is focused on camp life. Once camp ends, vendor listings may no longer be active.' },
      { q: 'Is my data safe?', a: 'Yes. Your data is stored securely in Firebase. We only collect what\'s needed: name, email, state code, and hostel block for delivery.' },
    ],
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I update my profile?', a: 'Tap "Profile" in the navigation, then tap "Edit Profile". You can update your phone number, platoon, hostel block, and other details.' },
      { q: 'How do ratings work?', a: 'After an order is delivered, you can rate the vendor with 1–5 stars and leave a comment. The average rating is shown on the vendor\'s card and profile.' },
      { q: 'Can I delete my account?', a: 'Account deletion is not available in-app yet. Contact the admin to have your data removed from the system.' },
    ],
  },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = FAQ_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  const toggle = (idx) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="faq-page page">
      <div className="container">
        <div className="faq-hero">
          <div className="page-hd" style={{ textAlign: 'center', paddingTop: 40 }}>
            <div className="page-hd__sub" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>Help Center</div>
            <div className="page-hd__title">Frequently Asked Questions</div>
          </div>
          <div className="faq-search">
            <input
              className="form-input faq-search__input"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div className="empty-state__icon">🔍</div>
            <div className="empty-state__title">No results</div>
            <div className="empty-state__desc">Try a different search term.</div>
          </div>
        ) : (
          filtered.map((cat, ci) => (
            <div key={cat.category} className="faq-category">
              <h2 className="faq-category__title">{cat.category}</h2>
              <div className="faq-items">
                {cat.items.map((item, ii) => {
                  const globalIdx = `${ci}-${ii}`;
                  const isOpen = openIndex === globalIdx;
                  return (
                    <div
                      key={ii}
                      className={`faq-item card ${isOpen ? 'faq-item--open' : ''}`}
                      onClick={() => toggle(globalIdx)}
                    >
                      <div className="faq-item__q">
                        <span>{item.q}</span>
                        <span className={`faq-item__arrow ${isOpen ? 'faq-item__arrow--open' : ''}`}>
                          ▾
                        </span>
                      </div>
                      {isOpen && (
                        <div className="faq-item__a">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        <div className="faq-cta">
          <p>Still have questions? <span className="faq-cta__link" onClick={() => navigate('/community')}>Ask the community →</span></p>
        </div>
      </div>
    </div>
  );
}
