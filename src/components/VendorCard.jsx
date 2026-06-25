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
  const displayRating = rating > 0 ? rating.toFixed(1) : 'New';
  const starCount = rating > 0 ? Math.round(rating) : 0;
  
  return (
    <span className="vc-stars" aria-label={`Rating: ${displayRating} out of 5`}>
      {[1,2,3,4,5].map(i => (
        <span 
          key={i} 
          style={{ 
            opacity: i <= starCount ? 1 : 0.25,
            color: i <= starCount ? '#fbbf24' : '#d1d5db'
          }}
          aria-hidden="true"
        >★</span>
      ))}
      <span className="vc-stars__num" aria-label={`Rating ${displayRating}`}>{displayRating}</span>
    </span>
  );
}

export default function VendorCard({ vendor }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const meta = CATEGORY_META[vendor.category] || CATEGORY_META.items;
  const initials = (vendor.businessName || vendor.name || '?').substring(0, 2).toUpperCase();
  
  const handleCardClick = () => navigate(`/vendors/${vendor.uid}`);
  const handleOrderClick = (e) => {
    e.stopPropagation();
    currentUser 
      ? navigate(`/order/new/${vendor.uid}`) 
      : navigate(`/login?redirect=/order/new/${vendor.uid}`);
  };

  return (
    <div 
      className="vc card" 
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      tabIndex={0}
      role="button"
      aria-label={`${vendor.businessName || vendor.name}, ${vendor.category} vendor at ${vendor.location}, rating ${vendor.rating || 0} stars, ${vendor.isAvailable ? 'open' : 'closed'} ${vendor.description}`}
    >
      <div className="vc__top">
        <div 
          className="vc__avatar" 
          style={{ borderColor: meta.color }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="vc__info">
          <div className="vc__name">{vendor.businessName || vendor.name}</div>
          <div className="vc__loc" aria-label={`Location: ${vendor.location}`}>
            📍 {vendor.location}
          </div>
          <Stars rating={vendor.rating || 0} totalRatings={vendor.totalRatings || 0} />
        </div>
        <div 
          className="vc__cat" 
          style={{ color: meta.color }}
          aria-label={`${meta.label} category`}
        >
          <span className="vc__cat-icon" aria-hidden="true">{meta.icon}</span>
          <span className="vc__cat-label">{meta.label}</span>
        </div>
      </div>
      <p className="vc__desc" aria-label={`Description: ${vendor.description}`}>{vendor.description}</p>
      <div className="vc__footer">
        <span 
          className={`badge ${vendor.isAvailable ? 'badge--green' : 'badge--red'}`}
          aria-label={vendor.isAvailable ? 'Vendor is currently open' : 'Vendor is currently closed'}
        >
          {vendor.isAvailable ? '● Open' : '● Closed'}
        </span>
        <button 
          className="btn btn--primary btn--sm" 
          onClick={handleOrderClick}
          aria-label={`${currentUser ? 'Place order with' : 'Sign in to place order with'} ${vendor.businessName || vendor.name}`}
        >
          Place Order →
        </button>
      </div>
    </div>
  );
}
