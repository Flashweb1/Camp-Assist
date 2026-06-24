import { useNavigate } from 'react-router-dom';
import './PostCard.css';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const initials = (post.authorName || '?').substring(0, 2).toUpperCase();

  return (
    <div className="pcard card card--interactive" onClick={() => navigate(`/community/${post.id}`)}>
      <div className="pcard__head">
        <div className="pcard__avatar">{initials}</div>
        <div>
          <div className="pcard__author">{post.authorName}</div>
          <div className="pcard__date">{post.createdAt?.toDate().toLocaleDateString()}</div>
        </div>
        {post.tags?.length > 0 && (
          <div className="pcard__tags">
            {post.tags.slice(0, 2).map(t => <span key={t} className="badge badge--green">{t}</span>)}
          </div>
        )}
      </div>
      <p className="pcard__text">{post.text}</p>
      {post.imageUrl && (
        <div className="pcard__img-wrap">
          <img src={post.imageUrl} alt="" className="pcard__img" loading="lazy" />
        </div>
      )}
      <div className="pcard__foot">
        <span className="pcard__stat">❤️ {post.likesCount || 0}</span>
        <span className="pcard__stat">💬 {post.commentCount || 0}</span>
      </div>
    </div>
  );
}
