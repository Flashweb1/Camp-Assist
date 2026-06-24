import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ vendors: 0, corps: 0, totalOrders: 0, activeOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === 'admin';

  useEffect(() => {
    async function loadStats() {
      try {
        const vendorSnap = await getDocs(collection(db, 'vendors'));
        const corpsSnap = await getDocs(collection(db, 'corps_members'));
        
        const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
        const orderSnap = await getDocs(qOrders);
        
        const orders = orderSnap.docs.map(d => d.data());
        const activeOrders = orders.filter(o => ['pending', 'accepted', 'in_progress'].includes(o.status)).length;

        setStats({
          vendors: vendorSnap.size,
          corps: corpsSnap.size,
          totalOrders: orderSnap.size,
          activeOrders
        });
        setRecentOrders(orders.slice(0, 10));
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    }

    if (!isAdmin) {
      navigate('/home');
      return;
    }

    loadStats();
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page ad-page">
      <div className="container">
        <div className="page-hd">
          <div className="page-hd__title ad-title">👑 Admin Portal</div>
          <div className="page-hd__sub">Camp Activity Overview</div>
        </div>

        <div className="ad-stats">
          <div className="card ad-stat">
            <div className="ad-stat__value">{stats.totalOrders}</div>
            <div className="ad-stat__label">Total Orders</div>
          </div>
          <div className="card ad-stat">
            <div className="ad-stat__value ad-stat__value--green">{stats.activeOrders}</div>
            <div className="ad-stat__label">Active Now</div>
          </div>
          <div className="card ad-stat">
            <div className="ad-stat__value">{stats.vendors}</div>
            <div className="ad-stat__label">Vendors</div>
          </div>
          <div className="card ad-stat">
            <div className="ad-stat__value">{stats.corps}</div>
            <div className="ad-stat__label">Corps Members</div>
          </div>
        </div>

        <h3 className="ad-feed-heading">Live Feed (Last 10)</h3>
        <div className="ad-feed">
          {recentOrders.map((o, i) => (
            <div key={i} className="card ad-feed__row">
              <div>
                <div className="ad-feed__corps">{o.corpsName} <span className="ad-feed__arrow">→</span> {o.vendorName}</div>
                <div className="ad-feed__desc">{o.description}</div>
              </div>
              <div className={`badge badge--${o.status === 'delivered' ? 'green' : o.status === 'pending' ? 'gold' : 'blue'}`}>
                {o.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
