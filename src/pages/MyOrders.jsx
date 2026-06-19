import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';

const TABS = ['All', 'Pending', 'Active', 'Delivered'];

const TAB_FILTERS = {
  All: null,
  Pending: ['pending'],
  Active: ['accepted', 'in_progress'],
  Delivered: ['delivered', 'cancelled'],
};

export default function MyOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('corpsId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [currentUser.uid]);

  const filtered = TAB_FILTERS[tab]
    ? orders.filter(o => TAB_FILTERS[tab].includes(o.status))
    : orders;

  return (
    <div className="page">
      <div className="container">
        <div className="page-hd">
          <div className="page-hd__title">My Orders</div>
          <div className="page-hd__sub">Track all your requests</div>
        </div>

        <div className="tabs" style={{ marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="skeleton sk-text sk-text-short"></div>
                  <div className="skeleton sk-text" style={{ width: 60, borderRadius: 12 }}></div>
                </div>
                <div className="skeleton sk-text" style={{ width: '100%', height: 32 }}></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <div className="empty-state__title">
              {tab === 'All' ? 'No orders yet' : `No ${tab.toLowerCase()} orders`}
            </div>
            <div className="empty-state__desc">
              {tab === 'All' ? 'Browse vendors and place your first order!' : 'Check another tab.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(o => <OrderCard key={o.id} order={o} showVendorName />)}
          </div>
        )}
      </div>
    </div>
  );
}
