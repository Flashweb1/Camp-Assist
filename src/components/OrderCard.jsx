import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderCard.css';

const STATUS_META = {
  pending:     { label: 'Pending',     badge: 'badge--gold',  icon: '⏳' },
  accepted:    { label: 'Accepted',    badge: 'badge--green', icon: '✅' },
  in_progress: { label: 'In Progress', badge: 'badge--blue',  icon: '🚶' },
  delivered:   { label: 'Delivered',   badge: 'badge--green', icon: '✔️' },
  cancelled:   { label: 'Cancelled',   badge: 'badge--red',   icon: '❌' },
};

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function OrderCard({ order, showVendorName, showCorpsName }) {
  const navigate = useNavigate();
  const meta = STATUS_META[order.status] || STATUS_META.pending;

  return (
    <div className="oc card" onClick={() => navigate(`/order/${order.id}`)}>
      <div className="oc__head">
        <div className="oc__icon">{meta.icon}</div>
        <div className="oc__info">
          {showVendorName && <div className="oc__who">To: <strong>{order.vendorName || 'Vendor'}</strong></div>}
          {showCorpsName && <div className="oc__who">From: <strong>{order.corpsName || 'Corps Member'}</strong></div>}
          <div className="oc__desc">{order.description}</div>
          <div className="oc__time">{timeAgo(order.createdAt)}</div>
        </div>
        <span className={`badge ${meta.badge}`}>{meta.label}</span>
      </div>
      <div className="oc__footer">
        <span className="oc__loc">📍 {order.deliveryLocation}</span>
        <span className="oc__cta">View →</span>
      </div>
    </div>
  );
}
