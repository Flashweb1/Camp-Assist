import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import VendorCard from '../components/VendorCard';
import './Home.css';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: '🏪' },
  { value: 'food', label: 'Food', icon: '🍛' },
  { value: 'laundry', label: 'Laundry', icon: '🧺' },
  { value: 'errands', label: 'Errands', icon: '🛍️' },
  { value: 'items', label: 'Items', icon: '🛒' },
];

export default function Home() {
  const { userProfile } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let q = query(collection(db, 'vendors'));
        if (category !== 'all') {
          q = query(collection(db, 'vendors'), where('category', '==', category));
        }
        const snap = await getDocs(q);
        setVendors(snap.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() })));
      } catch {
        setVendors([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  const filtered = vendors.filter(v => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (v.businessName || v.name || '').toLowerCase().includes(s) ||
      (v.description || '').toLowerCase().includes(s) ||
      (v.location || '').toLowerCase().includes(s);
  });

  const available = filtered.filter(v => v.isAvailable);
  const unavailable = filtered.filter(v => !v.isAvailable);

  return (
    <div className="page home-page">
      {/* Header */}
      <div className="home__header">
        <div className="container">
          <div className="home__greeting">
            <div>
              <div className="home__hello">Hey, {userProfile?.name?.split(' ')[0] || 'Corper'} 👋</div>
              <div className="home__tagline">What do you need today?</div>
            </div>
            <div className="home__code badge badge--green">{userProfile?.stateCode || 'NYSC'}</div>
          </div>
          {/* Search */}
          <div className="home__search-wrap">
            <span className="home__search-icon">🔍</span>
            <input
              className="home__search"
              placeholder="Search vendors, food, services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="home__search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          {/* Categories */}
          <div className="home__cats">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                className={`chip ${category === c.value ? 'active' : ''}`}
                onClick={() => setCategory(c.value)}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor list */}
      <div className="container home__body">
        {loading ? (
          <div className="home__grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div className="skeleton sk-avatar"></div>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton sk-text"></div>
                    <div className="skeleton sk-text sk-text-short"></div>
                  </div>
                </div>
                <div className="skeleton sk-text" style={{ width: '100%', height: 40, borderRadius: 8 }}></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🏜️</div>
            <div className="empty-state__title">Nothing found</div>
            <div className="empty-state__desc">
              {search ? "We couldn't find any vendors matching your search. Try another keyword." : "There are currently no vendors listed in this category. Check back later!"}
            </div>
          </div>
        ) : (
          <>
            {available.length > 0 && (
              <section>
                <div className="home__section-head">
                  <span>Open Now</span>
                  <span className="badge badge--green">{available.length}</span>
                </div>
                <div className="home__grid">
                  {available.map(v => <VendorCard key={v.id} vendor={v} />)}
                </div>
              </section>
            )}
            {unavailable.length > 0 && (
              <section style={{ marginTop: '28px' }}>
                <div className="home__section-head" style={{ opacity: 0.6 }}>
                  <span>Closed / Unavailable</span>
                  <span className="badge badge--gray">{unavailable.length}</span>
                </div>
                <div className="home__grid" style={{ opacity: 0.6 }}>
                  {unavailable.map(v => <VendorCard key={v.id} vendor={v} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
