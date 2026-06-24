import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit as qLimit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import './Community.css';

const TABS = ['Latest', 'Announcements', 'Social', 'Lost & Found'];

export default function Community() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Latest');

  useEffect(() => {
    async function load() {
      try {
        let q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'), qLimit(30));
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPosts(tab === 'Latest' ? all : all.filter(p => (p.tags || []).some(t => t.toLowerCase() === tab.toLowerCase())));
      } catch { setPosts([]); } finally { setLoading(false); }
    }
    load();
  }, [tab]);

  return (
    <div className="page cm-page">
      <div className="container">
        <div className="cm-head">
          <div>
            <div className="page-hd__sub" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>Community</div>
            <div className="page-hd__title">Camp Feed</div>
          </div>
          {currentUser && (
            <button className="btn btn--primary" onClick={() => navigate('/community/new')}>+ New Post</button>
          )}
        </div>

        <div className="tabs" style={{ marginTop: 24, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div className="empty-state__icon">📭</div>
            <div className="empty-state__title">No posts yet</div>
            <div className="empty-state__desc">Be the first to post something!</div>
          </div>
        ) : (
          <div className="cm-feed">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
