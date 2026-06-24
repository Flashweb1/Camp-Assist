import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';

const TABS = ['Pending', 'Active', 'History'];
const TAB_FILTERS = {
  Pending: ['pending'],
  Active: ['accepted', 'in_progress'],
  History: ['delivered', 'cancelled'],
};

export default function VendorOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Pending');

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

  const filtered = orders.filter(o => TAB_FILTERS[tab].includes(o.status));

  return (
    <div className="page">
      <div className="container">
        <div className="page-hd">
          <div className="page-hd__title">Orders</div>
          <div className="page-hd__sub">Manage incoming requests</div>
        </div>

        <div className="tabs" style={{ marginBottom: 24 }}>
          {TABS.map(t => {
            const count = orders.filter(o => TAB_FILTERS[t].includes(o.status)).length;
            return (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t} {count > 0 && <span style={{ opacity: 0.7, fontSize: '0.75em' }}>({count})</span>}
              </button>
            );
          })}
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
            <div className="empty-state__icon">{tab === 'Pending' ? '⏳' : tab === 'Active' ? '🚶' : '📋'}</div>
            <div className="empty-state__title">No {tab.toLowerCase()} orders</div>
            <div className="empty-state__desc">
              {tab === 'Pending' ? 'New orders will appear here.' : 'Nothing to show here.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(o => <OrderCard key={o.id} order={o} showCorpsName />)}
          </div>
        )}
      </div>
    </div>
  );
}
