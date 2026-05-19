import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { notificationsApi } from '../services/api';
import { BadgeCheck } from 'lucide-react';

const styles = `
  .notif-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px 16px 80px;
  }
  .notif-header {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .notif-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 4px;
    border-radius: var(--radius-sm);
    transition: background 0.15s;
  }
  .notif-item:hover { background: var(--bg-primary); padding: 8px 8px; }
  .notif-item.unread { background: rgba(0,149,246,0.05); }
  .notif-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .notif-avatar-placeholder {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f09433, #e6683c, #dc2743);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 18px;
    flex-shrink: 0;
  }
  .notif-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
  }
  .notif-username { font-weight: 600; }
  .notif-time { color: var(--text-tertiary); font-size: 12px; }
  .notif-post-thumb {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .follow-btn {
    background: var(--blue);
    color: white;
    border-radius: var(--radius-sm);
    padding: 6px 14px;
    font-weight: 600;
    font-size: 13px;
    flex-shrink: 0;
  }
  .notif-unread-dot {
    width: 8px;
    height: 8px;
    background: var(--blue);
    border-radius: 50%;
    flex-shrink: 0;
  }
  .mark-read-btn {
    color: var(--blue);
    font-weight: 600;
    font-size: 14px;
    float: right;
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 16px;
  }
`;

function getNotifText(n) {
  switch (n.type) {
    case 'Like': return 'liked your photo.';
    case 'Comment': return 'commented on your photo.';
    case 'Follow': return 'started following you.';
    case 'FollowRequest': return 'requested to follow you.';
    case 'CommentLike': return 'liked your comment.';
    case 'CommentReply': return 'replied to your comment.';
    case 'Mention': return 'mentioned you in a comment.';
    default: return 'interacted with your content.';
  }
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.getNotifications()
      .then(res => setNotifications(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = () => {
    notificationsApi.markAllRead();
    setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <style>{styles}</style>
      <div className="notif-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="notif-header" style={{ marginBottom: 0 }}>Notifications</div>
          {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={handleMarkAllRead} style={{ float: 'none' }}>
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 10, width: '30%' }} />
                </div>
              </div>
            ))}
          </>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 60 }}>
            <p style={{ fontSize: 16 }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
              {n.actor ? (
                <Link to={`/${n.actor.username}`}>
                  {n.actor.profilePictureUrl ? (
                    <img src={n.actor.profilePictureUrl} alt={n.actor.username} className="notif-avatar" />
                  ) : (
                    <div className="notif-avatar-placeholder">{n.actor.username[0].toUpperCase()}</div>
                  )}
                </Link>
              ) : (
                <div className="notif-avatar-placeholder">S</div>
              )}

              <div className="notif-text">
                {n.actor && (
                  <Link to={`/${n.actor.username}`} className="notif-username">
                    {n.actor.username}
                    {n.actor.isVerified && <BadgeCheck size={12} fill="#0095f6" stroke="white" style={{ display: 'inline', marginLeft: 2 }} />}
                  </Link>
                )}{' '}
                {getNotifText(n)}
                {' '}
                <span className="notif-time">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
              </div>

              {n.postThumbnailUrl && (
                <Link to={`/p/${n.postId}`}>
                  <img src={n.postThumbnailUrl} alt="post" className="notif-post-thumb" />
                </Link>
              )}

              {(n.type === 'Follow' || n.type === 'FollowRequest') && n.actor && (
                <button className="follow-btn">Follow</button>
              )}

              {!n.isRead && <div className="notif-unread-dot" />}
            </div>
          ))
        )}
      </div>
    </>
  );
}
