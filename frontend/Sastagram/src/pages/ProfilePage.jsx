import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BadgeCheck, Settings, Grid, Bookmark, Tag } from 'lucide-react';
import { usersApi, postsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const styles = `
  .profile-page {
    max-width: 935px;
    margin: 0 auto;
    padding: 30px 16px 80px;
  }
  .profile-header {
    display: flex;
    gap: 32px;
    margin-bottom: 44px;
    padding: 0 16px;
  }
  .profile-avatar-wrapper {
    flex-shrink: 0;
  }
  .profile-avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
  }
  .profile-avatar-placeholder {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f09433, #e6683c, #dc2743);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 56px;
    font-weight: 700;
  }
  .profile-info { flex: 1; }
  .profile-username-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .profile-username {
    font-size: 20px;
    font-weight: 300;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .profile-action-btn {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 7px 16px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .profile-action-btn:hover { background: var(--border-light); }
  .profile-action-btn.primary {
    background: var(--blue);
    color: white;
    border-color: var(--blue);
  }
  .profile-action-btn.primary:hover { background: #1877f2; }
  .profile-stats {
    display: flex;
    gap: 40px;
    margin-bottom: 16px;
  }
  .profile-stat { text-align: center; }
  .profile-stat-count { font-weight: 600; font-size: 16px; }
  .profile-stat-label { font-size: 14px; color: var(--text-secondary); }
  .profile-fullname { font-weight: 600; font-size: 14px; }
  .profile-bio { font-size: 14px; white-space: pre-line; }
  .profile-tabs {
    display: flex;
    border-top: 1px solid var(--border);
    margin-top: 16px;
    gap: 32px;
    justify-content: center;
  }
  .profile-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 16px 8px 12px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-tertiary);
    border-top: 1px solid transparent;
    margin-top: -1px;
    cursor: pointer;
    transition: color 0.2s;
  }
  .profile-tab.active {
    color: var(--text-primary);
    border-top-color: var(--text-primary);
  }
  .profile-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
    margin-top: 4px;
  }
  .profile-grid-item {
    aspect-ratio: 1;
    overflow: hidden;
    position: relative;
    cursor: pointer;
  }
  .profile-grid-item img, .profile-grid-item video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s;
  }
  .profile-grid-item:hover img,
  .profile-grid-item:hover video { transform: scale(1.05); }
  .profile-grid-item-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: white;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .profile-grid-item:hover .profile-grid-item-overlay { opacity: 1; }
  .overlay-stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 16px;
  }
  @media (max-width: 600px) {
    .profile-header { flex-direction: column; align-items: center; text-align: center; }
    .profile-stats { justify-content: center; }
    .profile-username-row { justify-content: center; }
  }
`;

export function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const isOwn = username === currentUser?.username;

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    Promise.all([
      usersApi.getUser(username),
      postsApi.getUserPosts(username)
    ]).then(([userRes, postsRes]) => {
      setProfile(userRes.data);
      setPosts(postsRes.data.items);
    }).catch(() => {
      toast.error('User not found');
    }).finally(() => setLoading(false));
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await usersApi.unfollow(profile.username);
        setProfile(p => p ? { ...p, isFollowing: false, followersCount: p.followersCount - 1 } : p);
      } else {
        const res = await usersApi.follow(profile.username);
        const isPending = res.data.status === 'Pending';
        setProfile(p => p ? { ...p, isFollowing: !isPending, isFollowPending: isPending, followersCount: isPending ? p.followersCount : p.followersCount + 1 } : p);
      }
    } catch {
      toast.error('Failed to update follow');
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div style={{ display: 'flex', gap: 32, marginBottom: 44 }}>
          <div className="skeleton" style={{ width: 150, height: 150, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '80%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="profile-page"><p>User not found.</p></div>;

  return (
    <>
      <style>{styles}</style>
      <div className="profile-page">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            {profile.profilePictureUrl ? (
              <img src={profile.profilePictureUrl} alt={profile.username} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {profile.username[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="profile-username-row">
              <span className="profile-username">
                {profile.username}
                {profile.isVerified && <BadgeCheck size={20} fill="#0095f6" stroke="white" />}
              </span>

              {isOwn ? (
                <>
                  <Link to="/settings" className="profile-action-btn">Edit profile</Link>
                  <button className="profile-action-btn"><Settings size={16} /></button>
                </>
              ) : (
                <>
                  <button
                    className={`profile-action-btn ${!profile.isFollowing && !profile.isFollowPending ? 'primary' : ''}`}
                    onClick={handleFollow}
                  >
                    {profile.isFollowPending ? 'Requested' : profile.isFollowing ? 'Following' : 'Follow'}
                  </button>
                  {profile.isFollowing && (
                    <button className="profile-action-btn">Message</button>
                  )}
                </>
              )}
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-count">{profile.postsCount.toLocaleString()}</div>
                <div className="profile-stat-label">posts</div>
              </div>
              <Link to={`/${profile.username}/followers`} className="profile-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="profile-stat-count">{profile.followersCount.toLocaleString()}</div>
                <div className="profile-stat-label">followers</div>
              </Link>
              <Link to={`/${profile.username}/following`} className="profile-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="profile-stat-count">{profile.followingCount.toLocaleString()}</div>
                <div className="profile-stat-label">following</div>
              </Link>
            </div>

            {profile.fullName && <div className="profile-fullname">{profile.fullName}</div>}
            {profile.bio && <div className="profile-bio">{profile.bio}</div>}
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className={`profile-tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
            <Grid size={12} /> Posts
          </button>
          {isOwn && (
            <button className={`profile-tab ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>
              <Bookmark size={12} /> Saved
            </button>
          )}
          <button className={`profile-tab ${tab === 'tagged' ? 'active' : ''}`} onClick={() => setTab('tagged')}>
            <Tag size={12} /> Tagged
          </button>
        </div>

        {/* Grid */}
        <div className="profile-grid">
          {posts.map(post => (
            <Link key={post.id} to={`/p/${post.id}`} className="profile-grid-item">
              {post.mediaItems[0] && (
                post.mediaItems[0].mediaType === 'Video' ? (
                  <video src={post.mediaItems[0].url} muted />
                ) : (
                  <img src={post.mediaItems[0].url} alt="post" />
                )
              )}
              <div className="profile-grid-item-overlay">
                <div className="overlay-stat">
                  <Heart size={18} fill="white" stroke="white" /> {post.likesCount}
                </div>
                <div className="overlay-stat">
                  <MessageCircle size={18} fill="white" stroke="white" /> {post.commentsCount}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: 18, fontWeight: 600 }}>No posts yet</p>
          </div>
        )}
      </div>
    </>
  );
}

// Need these imports for overlay
import { Heart, MessageCircle } from 'lucide-react';
