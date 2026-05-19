import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { storiesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

const styles = `
  .stories-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 8px;
    margin-bottom: 16px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .stories-container::-webkit-scrollbar { display: none; }
  .stories-list {
    display: flex;
    gap: 16px;
    width: max-content;
  }
  .story-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    width: 66px;
  }
  .story-avatar-ring {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    padding: 2px;
    background: var(--accent-gradient);
    cursor: pointer;
    transition: transform 0.2s;
  }
  .story-avatar-ring:hover { transform: scale(1.05); }
  .story-avatar-ring.seen {
    background: var(--border) !important;
  }
  .story-avatar-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--bg-secondary);
    padding: 2px;
  }
  .story-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  .story-avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #f09433, #e6683c, #dc2743);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 20px;
  }
  .story-username {
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
    max-width: 66px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .add-story-btn {
    position: relative;
  }
  .add-story-ring {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    transition: background 0.2s;
  }
  .add-story-ring:hover { background: var(--bg-primary); }
  .add-story-plus {
    position: absolute;
    bottom: 0;
    right: 0;
    background: var(--blue);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--bg-secondary);
  }
`;

export function StoriesBar() {
  const { user } = useAuthStore();
  const [storyGroups, setStoryGroups] = useState([]);

  useEffect(() => {
    storiesApi.getStories()
      .then(res => setStoryGroups(res.data))
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="stories-container">
        <div className="stories-list">
          {/* Your story */}
          <div className="story-item add-story-btn">
            <div className="add-story-ring">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="story-avatar-placeholder" style={{ width: 58, height: 58 }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="add-story-plus">
                <Plus size={12} strokeWidth={3} />
              </div>
            </div>
            <span className="story-username">Your story</span>
          </div>

          {storyGroups.map(group => (
            <div key={group.user.id} className="story-item">
              <div className={`story-avatar-ring ${!group.hasUnviewed ? 'seen' : ''}`}>
                <div className="story-avatar-inner">
                  {group.user.profilePictureUrl ? (
                    <img src={group.user.profilePictureUrl} alt={group.user.username} className="story-avatar-img" />
                  ) : (
                    <div className="story-avatar-placeholder">
                      {group.user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className="story-username">{group.user.username}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
