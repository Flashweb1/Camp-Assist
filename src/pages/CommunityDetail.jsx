import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy, addDoc, deleteDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './CommunityDetail.css';

export default function CommunityDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [postSnap, commentsSnap] = await Promise.all([
          getDoc(doc(db, 'community_posts', postId)),
          getDocs(query(collection(db, 'community_posts', postId, 'comments'), orderBy('createdAt', 'asc'))),
        ]);
        if (!postSnap.exists()) { setLoading(false); return; }
        setPost({ id: postSnap.id, ...postSnap.data() });
        setComments(commentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        if (currentUser) {
          const likeSnap = await getDoc(doc(db, 'community_posts', postId, 'likes', currentUser.uid));
          setLiked(likeSnap.exists());
        }
      } catch { /* silent */ } finally { setLoading(false); }
    }
    load();
  }, [postId, currentUser]);

  const toggleLike = async () => {
    if (!currentUser) { navigate('/login?redirect=/community/' + postId); return; }
    const likeRef = doc(db, 'community_posts', postId, 'likes', currentUser.uid);
    const postRef = doc(db, 'community_posts', postId);
    try {
      await runTransaction(db, async (tx) => {
        const postDoc = await tx.get(postRef);
        const currentLikes = postDoc.data().likesCount || 0;
        if (liked) {
          tx.delete(likeRef);
          tx.update(postRef, { likesCount: Math.max(0, currentLikes - 1) });
        } else {
          tx.set(likeRef, { likedAt: serverTimestamp() });
          tx.update(postRef, { likesCount: currentLikes + 1 });
        }
      });
      setLiked(!liked);
      setPost(p => ({ ...p, likesCount: (p.likesCount || 0) + (liked ? -1 : 1) }));
    } catch { addToast('Error updating like', 'error'); }
  };

  const addComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    setSending(true);
    try {
      const name = currentUser.email?.split('@')[0] || 'Anonymous';
      await addDoc(collection(db, 'community_posts', postId, 'comments'), {
        authorId: currentUser.uid,
        authorName: name,
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      });
      setCommentText('');
      const snap = await getDocs(query(collection(db, 'community_posts', postId, 'comments'), orderBy('createdAt', 'asc')));
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPost(p => ({ ...p, commentCount: snap.size }));
    } catch { addToast('Failed to add comment', 'error'); } finally { setSending(false); }
  };

  if (loading) return <div className="page"><div className="container"><div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div></div></div>;
  if (!post) return (
    <div className="page">
      <div className="container">
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state__icon">📄</div>
          <div className="empty-state__title">Post not found</div>
          <button className="btn btn--outline" style={{ marginTop: 16 }} onClick={() => navigate('/community')}>← Back to Feed</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page cmd-page">
      <div className="container--sm">
        <button className="btn btn--ghost" onClick={() => navigate('/community')} style={{ marginBottom: 20 }}>← Back to Feed</button>

        <div className="card cmd-post">
          <div className="cmd-head">
            <div className="cmd-avatar">{(post.authorName || '?').substring(0, 2).toUpperCase()}</div>
            <div>
              <div className="cmd-author">{post.authorName}</div>
              <div className="cmd-date">{post.createdAt?.toDate().toLocaleDateString()}</div>
            </div>
            {post.tags?.map(t => <span key={t} className="badge badge--green" style={{ marginLeft: 'auto' }}>{t}</span>)}
          </div>
          <p className="cmd-text">{post.text}</p>
          {post.imageUrl && (
            <div className="cmd-img-wrap"><img src={post.imageUrl} alt="" className="cmd-img" /></div>
          )}
          <div className="cmd-actions">
            <button className={`cmd-like ${liked ? 'cmd-like--on' : ''}`} onClick={toggleLike}>
              {liked ? '❤️' : '🤍'} {post.likesCount || 0}
            </button>
          </div>
        </div>

        <div className="cmd-comments">
          <h3 className="cmd-comments__title">Comments ({comments.length})</h3>
          {currentUser ? (
            <div className="cmd-comment-form">
              <input className="form-input" value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..." onKeyDown={e => e.key === 'Enter' && addComment()} />
              <button className="btn btn--primary btn--sm" disabled={sending || !commentText.trim()} onClick={addComment}>Send</button>
            </div>
          ) : (
            <p className="cmd-login-prompt" onClick={() => navigate('/login?redirect=/community/' + postId)}>Log in to comment</p>
          )}
          {comments.length === 0 ? (
            <p className="cmd-no-comments">No comments yet.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="cmd-comment">
                <div className="cmd-comment__avatar">{(c.authorName || '?').substring(0, 1).toUpperCase()}</div>
                <div className="cmd-comment__body">
                  <div className="cmd-comment__author">{c.authorName}</div>
                  <div className="cmd-comment__text">{c.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
