import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Blog.css';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, 'blog_posts'),
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(q);
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Failed to load blog posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="page blog-page">
      <div className="container"><div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div></div>
    </div>
  );

  return (
    <div className="page blog-page">
      <div className="container">
        <div className="page-hd">
          <div className="page-hd__sub" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>Blog</div>
          <div className="page-hd__title">Camp News & Tips</div>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="empty-state__icon">📝</div>
            <div className="empty-state__title">No posts yet</div>
            <div className="empty-state__desc">Check back later for camp announcements and tips.</div>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map(post => (
              <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card card card--interactive">
                {post.imageUrl && (
                  <div className="blog-card__img-wrap">
                    <img src={post.imageUrl} alt={post.title} className="blog-card__img" />
                  </div>
                )}
                <div className="blog-card__body">
                  {post.tags && post.tags.length > 0 && (
                    <div className="blog-card__tags">
                      {post.tags.map(t => <span key={t} className="badge badge--green">{t}</span>)}
                    </div>
                  )}
                  <h2 className="blog-card__title">{post.title}</h2>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                  <div className="blog-card__meta">
                    <span>{post.author}</span>
                    <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
