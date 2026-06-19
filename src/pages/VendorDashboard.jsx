import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './VendorDashboard.css';

function StatCard({ icon, value, label, color }) {
  return (
    <div className="vd-stat card">
      <div className="vd-stat__icon" style={{ color }}>{icon}</div>
      <div className="vd-stat__value">{value}</div>
      <div className="vd-stat__label">{label}</div>
    </div>
  );
}

export default function VendorDashboard() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('vendorId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [currentUser.uid]);

  const pending = orders.filter(o => o.status === 'pending');
  const active = orders.filter(o => ['accepted', 'in_progress'].includes(o.status));
  const delivered = orders.filter(o => o.status === 'delivered');
  const recentOrders = orders.slice(0, 5);

  const initials = (userProfile?.businessName || userProfile?.name || '?').substring(0, 2).toUpperCase();

  return (
    <div className="page vd-page">
      <div className="container">
        {/* Header */}
        <div className="vd-header">
          <div className="vd-header__left">
            <div className="vd-avatar">{initials}</div>
            <div>
              <div className="vd-name">{userProfile?.businessName || userProfile?.name}</div>
              <div className="vd-tag">{userProfile?.category} · {userProfile?.location}</div>
            </div>
          </div>
          <div
            className={`badge ${userProfile?.isAvailable ? 'badge--green' : 'badge--red'}`}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/vendor/profile/edit')}
          >
            {userProfile?.isAvailable ? '● Open' : '● Closed'}
          </div>
        </div>

        {/* Stats */}
        <div className="vd-stats">
          <StatCard icon="⏳" value={pending.length} label="Pending" color="#F5B845" />
          <StatCard icon="🚶" value={active.length} label="Active" color="#93C5FD" />
          <StatCard icon="✔️" value={delivered.length} label="Delivered" color="#6BC98A" />
          <StatCard icon="⭐" value={userProfile?.rating ? userProfile.rating.toFixed(1) : '—'} label="Rating" color="#E8A020" />
        </div>

        {/* New order alert */}
        {pending.length > 0 && (
          <div className="vd-alert" onClick={() => navigate('/vendor/orders')}>
            <span className="vd-alert__icon">🔔</span>
            <span>You have <strong>{pending.length}</strong> pending order{pending.length > 1 ? 's' : ''}!</span>
            <span className="vd-alert__arrow">→</span>
          </div>
        )}

        {/* Recent orders */}
        <div className="vd-section-head">Recent Orders</div>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div className="dots" style={{ justifyContent: 'center' }}><span /><span /><span /></div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <div className="empty-state__title">No orders yet</div>
            <div className="empty-state__text">Corps members will find you when they browse vendors.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentOrders.map(o => (
              <div key={o.id} className="vd-order-row card" onClick={() => navigate(`/order/${o.id}`)}>
                <div className="vd-order-row__info">
                  <div className="vd-order-row__name">{o.corpsName}</div>
                  <div className="vd-order-row__desc">{o.description}</div>
                </div>
                <span className={`badge badge--${o.status === 'pending' ? 'gold' : o.status === 'delivered' ? 'green' : 'blue'}`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn--outline btn--full" style={{ marginTop: 16 }} onClick={() => navigate('/vendor/orders')}>
          View All Orders →
        </button>
      </div>
    </div>
  );
}
