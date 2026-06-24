import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './VendorCard.css';

const CATEGORY_META = {
  food:    { icon: '🍛', label: 'Food',    color: '#E8A020' },
  laundry: { icon: '🧺', label: 'Laundry', color: '#60A5FA' },
  errands: { icon: '🛍️', label: 'Errands', color: '#A78BFA' },
  items:   { icon: '🛒', label: 'Items',   color: '#34D399' },
};

function Stars({ rating }) {
  return (
    <span className="vc-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }}>★</span>
      ))}
      <span className="vc-stars__num">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
    </span>
  );
}

export default function VendorCard({ vendor }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const meta = CATEGORY_META[vendor.category] || CATEGORY_META.items;
  const initials = (vendor.businessName || vendor.name || '?').substring(0, 2).toUpperCase();

  return (
    <div className="vc card" onClick={() => navigate(`/vendors/${vendor.uid}`)}>
      <div className="vc__top">
        <div className="vc__avatar" style={{ borderColor: meta.color }}>
          {initials}
        </div>
        <div className="vc__info">
          <div className="vc__name">{vendor.businessName || vendor.name}</div>
          <div className="vc__loc">📍 {vendor.location}</div>
          <Stars rating={vendor.rating || 0} />
        </div>
        <div className="vc__cat" style={{ color: meta.color }}>
          <span className="vc__cat-icon">{meta.icon}</span>
          <span className="vc__cat-label">{meta.label}</span>
        </div>
      </div>
      <p className="vc__desc">{vendor.description}</p>
      <div className="vc__footer">
        <span className={`badge ${vendor.isAvailable ? 'badge--green' : 'badge--red'}`}>
          {vendor.isAvailable ? '● Open' : '● Closed'}
        </span>
        <button className="btn btn--primary btn--sm" onClick={(e) => { e.stopPropagation(); currentUser ? navigate(`/order/new/${vendor.uid}`) : navigate(`/login?redirect=/order/new/${vendor.uid}`); }}>
          Place Order →
        </button>
      </div>
    </div>
  );
}
