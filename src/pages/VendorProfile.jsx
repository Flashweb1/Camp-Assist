import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './VendorProfile.css';

const CAT_ICONS = { food: '🍛', laundry: '🧺', errands: '🛍️', items: '🛒' };

function Stars({ rating, totalRatings }) {
  return (
    <div className="vp-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'vp-star--on' : 'vp-star--off'}>★</span>
      ))}
      <span className="vp-stars__info">
        {rating > 0 ? `${rating.toFixed(1)} · ${totalRatings} review${totalRatings !== 1 ? 's' : ''}` : 'No reviews yet'}
      </span>
    </div>
  );
}

export default function VendorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'vendors', id));
      if (snap.exists()) setVendor({ uid: snap.id, ...snap.data() });
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!vendor) return (
    <div className="page container">
      <div className="empty-state">
        <div className="empty-state__icon">❌</div>
        <div className="empty-state__title">Vendor not found</div>
        <button className="btn btn--outline" style={{marginTop:16}} onClick={() => navigate('/home')}>← Back</button>
      </div>
    </div>
  );

  return (
    <div className="page vp-page">
      {/* Back */}
      <div className="container vp-nav">
        <button className="btn btn--ghost" onClick={() => navigate('/home')}>← Back</button>
      </div>

      <div className="container">
        {/* Hero card */}
        <div className="vp-hero card">
          <div className="vp-hero__avatar">
            {(vendor.businessName || vendor.name || '?').substring(0, 2).toUpperCase()}
          </div>
          <div className="vp-hero__info">
            <div className="vp-hero__cat">{CAT_ICONS[vendor.category]} {vendor.category}</div>
            <h1 className="vp-hero__name">{vendor.businessName || vendor.name}</h1>
            <div className="vp-hero__loc">📍 {vendor.location}</div>
            <Stars rating={vendor.rating || 0} totalRatings={vendor.totalRatings || 0} />
          </div>
          <span className={`badge ${vendor.isAvailable ? 'badge--green' : 'badge--red'}`}>
            {vendor.isAvailable ? '● Open' : '● Closed'}
          </span>
        </div>

        {/* About */}
        <div className="vp-section">
          <div className="vp-label">About this service</div>
          <div className="vp-text">{vendor.description}</div>
        </div>

        {/* Contact */}
        <div className="vp-section">
          <div className="vp-label">Contact</div>
          <div className="vp-contact card">
            <div className="vp-contact__item">
              <span>📞</span>
              <span>{vendor.phone}</span>
            </div>
            <div className="vp-contact__item">
              <span>📍</span>
              <span>{vendor.location}</span>
            </div>
          </div>
        </div>

        {/* Order CTA */}
        <div className="vp-cta">
          {vendor.isAvailable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                className="btn btn--gold btn--full btn--lg"
                onClick={() => navigate(`/order/new/${vendor.uid}`)}
              >
                Place an Order →
              </button>
              <a
                href={`https://wa.me/${vendor.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(vendor.businessName || vendor.name)},%20I%20found%20you%20on%20CampAssist.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline btn--full btn--lg"
                style={{ borderColor: '#25D366', color: '#25D366' }}
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          ) : (
            <div className="vp-closed-msg">
              This vendor is currently closed. Check back later!
            </div>
          )}
          <div className="vp-poa">💵 Payment on delivery · No upfront cost</div>
        </div>
      </div>
    </div>
  );
}
