import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Blog.css';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, 'blog_posts'),
          where('slug', '==', slug),
          where('published', '==', true),
          limit(1)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          setNotFound(true);
        } else {
          setPost({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return (
    <div className="page blog-page">
      <div className="container"><div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div></div>
    </div>
  );

  if (notFound || !post) return (
    <div className="page blog-page">
      <div className="container">
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div className="empty-state__icon">📄</div>
          <div className="empty-state__title">Post not found</div>
          <Link to="/blog" className="btn btn--outline" style={{ marginTop: 16 }}>← Back to Blog</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page blog-page">
      <div className="container--sm">
        <Link to="/blog" className="btn btn--ghost" style={{ marginBottom: 24 }}>← Back to Blog</Link>

        <article className="blog-post">
          {post.tags && post.tags.length > 0 && (
            <div className="blog-post__tags">
              {post.tags.map(t => <span key={t} className="badge badge--green">{t}</span>)}
            </div>
          )}
          <h1 className="blog-post__title">{post.title}</h1>
          <div className="blog-post__meta">
            <span>{post.author}</span>
            <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
          </div>

          {post.imageUrl && (
            <div className="blog-post__img-wrap">
              <img src={post.imageUrl} alt={post.title} className="blog-post__img" />
            </div>
          )}

          <div className="blog-post__content markdown-body">
            <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
          </div>
        </article>
      </div>
    </div>
  );
}
