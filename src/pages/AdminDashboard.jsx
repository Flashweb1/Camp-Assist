import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const TABS = [
  { key: 'stats', label: 'Stats' },
  { key: 'posts', label: 'Posts' },
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminDashboard() {
  const { role } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState({ vendors: 0, corps: 0, totalOrders: 0, activeOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', imageUrl: '', tags: '', published: false });
  const [saving, setSaving] = useState(false);

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
        setStats({ vendors: vendorSnap.size, corps: corpsSnap.size, totalOrders: orderSnap.size, activeOrders });
        setRecentOrders(orders.slice(0, 10));
      } catch { /* silently fail */ } finally { setLoading(false); }
    }
    if (!isAdmin) { navigate('/vendors'); return; }
    loadStats();
  }, [isAdmin, navigate]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setPosts([]); } finally { setPostsLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'posts') loadPosts();
  }, [tab, loadPosts]);

  const resetForm = () => {
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', imageUrl: '', tags: '', published: false });
  };

  const startEdit = (post) => {
    setEditing(post.id);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      imageUrl: post.imageUrl || '',
      tags: (post.tags || []).join(', '),
      published: post.published || false,
    });
  };

  const savePost = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const data = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim(),
        content: form.content,
        imageUrl: form.imageUrl.trim(),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        published: form.published,
        author: 'Admin',
        updatedAt: serverTimestamp(),
      };
      if (editing) {
        await updateDoc(doc(db, 'blog_posts', editing), data);
        addToast('Post updated', 'success');
      } else {
        await addDoc(collection(db, 'blog_posts'), { ...data, createdAt: serverTimestamp() });
        addToast('Post created', 'success');
      }
      resetForm();
      loadPosts();
    } catch { addToast('Failed to save post', 'error'); } finally { setSaving(false); }
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'blog_posts', id));
      addToast('Post deleted', 'success');
      loadPosts();
    } catch { addToast('Failed to delete post', 'error'); }
  };

  if (!isAdmin) return null;
  if (loading && tab === 'stats') return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page ad-page">
      <div className="container">
        <div className="page-hd">
          <div className="page-hd__title ad-title">👑 Admin Portal</div>
        </div>

        <div className="tabs" style={{ marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'stats' && (
          <>
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
          </>
        )}

        {tab === 'posts' && (
          <div className="ad-posts">
            <div className="ad-posts__toolbar">
              <h3>Blog Posts</h3>
              <button className="btn btn--primary btn--sm" onClick={resetForm} disabled={!editing && form.title}>
                {editing ? 'Cancel' : 'New Post'}
              </button>
            </div>

            {/* Editor */}
            {(editing || (!editing && form.title) || (!editing && !posts.length)) && (
              <form className="card ad-post-form" onSubmit={savePost}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug (auto-filled from title)</label>
                  <input className="form-input" value={form.slug}
                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    placeholder="my-post-title" />
                </div>
                <div className="form-group">
                  <label className="form-label">Excerpt</label>
                  <textarea className="form-input" rows={2} value={form.excerpt}
                    onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                    placeholder="Short summary..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Content (markdown)</label>
                  <textarea className="form-input ad-post-form__content" rows={12} value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Write your post in markdown..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input className="form-input" value={form.imageUrl}
                    onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={form.tags}
                    onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="announcements, tips" />
                </div>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <input type="checkbox" id="pub" checked={form.published}
                    onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
                  <label htmlFor="pub" className="form-label" style={{ margin: 0 }}>Published</label>
                </div>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
                </button>
              </form>
            )}

            {/* Post list */}
            {postsLoading ? (
              <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
            ) : posts.length === 0 ? (
              <div className="empty-state" style={{ marginTop: 32 }}>
                <div className="empty-state__icon">📝</div>
                <div className="empty-state__title">No posts yet</div>
                <div className="empty-state__desc">Create your first blog post.</div>
              </div>
            ) : (
              <div className="ad-posts__list">
                {posts.map(post => (
                  <div key={post.id} className="card ad-post-row">
                    <div className="ad-post-row__info">
                      <div className="ad-post-row__title">{post.title}</div>
                      <div className="ad-post-row__meta">
                        {post.createdAt?.toDate().toLocaleDateString()}
                        {post.published ? <span className="badge badge--green">Published</span> : <span className="badge badge--gray">Draft</span>}
                      </div>
                    </div>
                    <div className="ad-post-row__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => startEdit(post)}>Edit</button>
                      <button className="btn btn--danger btn--sm" onClick={() => deletePost(post.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
