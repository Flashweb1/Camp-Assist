import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Community.css';

export default function CommunityPost() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!currentUser) { navigate('/login'); return null; }

  const toggleTag = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'community_posts'), {
        authorId: currentUser.uid,
        authorName: userProfile?.name || currentUser.email?.split('@')[0] || 'Anonymous',
        text: text.trim(),
        imageUrl: imageUrl.trim(),
        tags,
        likesCount: 0,
        commentCount: 0,
        createdAt: serverTimestamp(),
      });
      addToast('Post created!', 'success');
      navigate('/community');
    } catch {
      addToast('Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page cm-page">
      <div className="container--sm">
        <div className="cm-head">
          <div>
            <div className="page-hd__sub" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>Community</div>
            <div className="page-hd__title">New Post</div>
          </div>
        </div>

        <form className="card cm-form" onSubmit={submit}>
          <textarea
            className="form-input cm-form__text"
            rows={5}
            placeholder="What's on your mind?"
            value={text}
            onChange={e => setText(e.target.value)}
            required
          />
          <input
            className="form-input"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          <div className="cm-form__tags">
            <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Tags:</span>
            {['Announcements', 'Social', 'Lost & Found'].map(t => (
              <span key={t}
                className={`chip ${tags.includes(t) ? 'chip--active' : ''}`}
                onClick={() => toggleTag(t)}
                style={{ cursor: 'pointer' }}>
                {t}
              </span>
            ))}
          </div>
          <button className="btn btn--primary btn--full" disabled={loading || !text.trim()}>
            {loading ? 'Posting...' : 'Post →'}
          </button>
        </form>
      </div>
    </div>
  );
}
