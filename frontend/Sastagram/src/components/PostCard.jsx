import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, BadgeCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { postsApi } from '../services/api';
import toast from 'react-hot-toast';

const styles = `
  .post-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    margin-bottom: 16px;
    overflow: hidden;
    animation: fadeIn 0.3s ease;
  }
  .post-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
  }
  .post-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
  }
  .post-avatar-placeholder {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f09433, #e6683c, #dc2743);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 15px;
    flex-shrink: 0;
    cursor: pointer;
  }
  .post-user-info { flex: 1; }
  .post-username {
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .post-location {
    font-size: 12px;
    color: var(--text-secondary);
  }
  .post-more { color: var(--text-secondary); padding: 4px; }
  .post-media-wrapper {
    position: relative;
    background: #000;
    overflow: hidden;
  }
  .post-image {
    width: 100%;
    max-height: 600px;
    object-fit: cover;
    display: block;
  }
  .post-video {
    width: 100%;
    max-height: 600px;
    object-fit: cover;
    display: block;
  }
  .post-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px 4px;
  }
  .post-action-btn {
    padding: 6px;
    border-radius: 50%;
    transition: transform 0.1s;
    color: var(--text-primary);
  }
  .post-action-btn:hover { transform: scale(1.1); }
  .post-action-btn.liked svg { fill: #ed4956; stroke: #ed4956; }
  .post-action-btn.saved svg { fill: var(--text-primary); }
  .post-save-btn { margin-left: auto; }
  .post-likes {
    padding: 0 16px 6px;
    font-weight: 600;
    font-size: 14px;
  }
  .post-caption {
    padding: 0 16px 8px;
    font-size: 14px;
    line-height: 1.5;
  }
  .post-caption-username {
    font-weight: 600;
    margin-right: 4px;
  }
  .post-view-comments {
    padding: 0 16px 4px;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
  }
  .post-time {
    padding: 4px 16px 12px;
    font-size: 10px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .post-add-comment {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    border-top: 1px solid var(--border-light);
  }
  .post-comment-input {
    flex: 1;
    background: none;
    border: none;
    font-size: 14px;
    color: var(--text-primary);
    resize: none;
  }
  .post-comment-input::placeholder { color: var(--text-tertiary); }
  .post-comment-submit {
    color: var(--blue);
    font-weight: 600;
    font-size: 14px;
    opacity: 0.5;
    transition: opacity 0.2s;
  }
  .post-comment-submit.active { opacity: 1; }
  .media-dots {
    display: flex;
    justify-content: center;
    gap: 4px;
    padding: 8px 0 0;
  }
  .media-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--border);
  }
  .media-dot.active { background: var(--blue); }
`;



export function PostCard({ post: initialPost, onUpdate }) {
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState('');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const handleLike = async () => {
    try {
      if (post.isLiked) {
        await postsApi.unlikePost(post.id);
        const updated = { ...post, isLiked: false, likesCount: post.likesCount - 1 };
        setPost(updated);
        onUpdate?.(updated);
      } else {
        await postsApi.likePost(post.id);
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 300);
        const updated = { ...post, isLiked: true, likesCount: post.likesCount + 1 };
        setPost(updated);
        onUpdate?.(updated);
      }
    } catch {
      toast.error('Failed to update like');
    }
  };

  const handleDoubleTap = () => {
    if (!post.isLiked) handleLike();
  };

  const handleSave = async () => {
    try {
      if (post.isSaved) {
        await postsApi.unsavePost(post.id);
        setPost(p => ({ ...p, isSaved: false }));
      } else {
        await postsApi.savePost(post.id);
        setPost(p => ({ ...p, isSaved: true }));
      }
    } catch {
      toast.error('Failed to update save');
    }
  };

  const currentMedia = post.mediaItems[mediaIndex];

  return (
    <>
      <style>{styles}</style>
      <article className="post-card">
        {/* Header */}
        <div className="post-header">
          <Link to={`/${post.user.username}`}>
            {post.user.profilePictureUrl ? (
              <img src={post.user.profilePictureUrl} alt={post.user.username} className="post-avatar" />
            ) : (
              <div className="post-avatar-placeholder">
                {post.user.username[0].toUpperCase()}
              </div>
            )}
          </Link>
          <div className="post-user-info">
            <div className="post-username">
              <Link to={`/${post.user.username}`}>{post.user.username}</Link>
              {post.user.isVerified && <BadgeCheck size={14} fill="#0095f6" stroke="white" />}
            </div>
            {post.location && (
              <div className="post-location">
                <MapPin size={10} style={{ display: 'inline', marginRight: 2 }} />
                {post.location}
              </div>
            )}
          </div>
          <button className="post-more">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Media */}
        {currentMedia && (
          <div className="post-media-wrapper" onDoubleClick={handleDoubleTap}>
            {currentMedia.mediaType === 'Video' ? (
              <video
                src={currentMedia.url}
                className="post-video"
                controls
                loop
                playsInline
              />
            ) : (
              <img
                src={currentMedia.url}
                alt="Post"
                className="post-image"
              />
            )}
          </div>
        )}

        {/* Media dots */}
        {post.mediaItems.length > 1 && (
          <div className="media-dots">
            {post.mediaItems.map((_, i) => (
              <div
                key={i}
                className={`media-dot ${i === mediaIndex ? 'active' : ''}`}
                onClick={() => setMediaIndex(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="post-actions">
          <button
            className={`post-action-btn ${post.isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            style={{ transform: likeAnimating ? 'scale(1.3)' : undefined }}
          >
            <Heart size={24} />
          </button>
          <Link to={`/p/${post.id}`} className="post-action-btn">
            <MessageCircle size={24} />
          </Link>
          <button className="post-action-btn">
            <Send size={24} />
          </button>
          <button
            className={`post-action-btn post-save-btn ${post.isSaved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            <Bookmark size={24} />
          </button>
        </div>

        {/* Likes */}
        {!post.likesHidden && (
          <div className="post-likes">
            {post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'like' : 'likes'}
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="post-caption">
            <span className="post-caption-username">
              <Link to={`/${post.user.username}`}>{post.user.username}</Link>
            </span>
            {post.caption}
          </div>
        )}

        {/* Comments count */}
        {post.commentsCount > 0 && (
          <Link to={`/p/${post.id}`} className="post-view-comments" style={{ display: 'block' }}>
            View all {post.commentsCount} comments
          </Link>
        )}

        {/* Timestamp */}
        <div className="post-time">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>

        {/* Add comment */}
        <div className="post-add-comment">
          <input
            className="post-comment-input"
            placeholder="Add a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button
            className={`post-comment-submit ${comment.trim() ? 'active' : ''}`}
            disabled={!comment.trim()}
          >
            Post
          </button>
        </div>
      </article>
    </>
  );
}
