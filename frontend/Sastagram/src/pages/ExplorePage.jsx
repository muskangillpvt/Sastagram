import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi, usersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Heart, MessageCircle, Search, BadgeCheck } from 'lucide-react';

const styles = `
  .explore-page, .search-page {
    max-width: 935px;
    margin: 0 auto;
    padding: 24px 16px 80px;
  }
  .explore-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
  }
  .explore-item {
    aspect-ratio: 1;
    overflow: hidden;
    position: relative;
    cursor: pointer;
  }
  .explore-item.tall { grid-row: span 2; }
  .explore-item img, .explore-item video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  .explore-item:hover img,
  .explore-item:hover video { transform: scale(1.05); }
  .explore-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    color: white;
    font-weight: 700;
    font-size: 16px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .explore-item:hover .explore-overlay { opacity: 1; }
  .overlay-stat {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .search-bar-container {
    position: relative;
    margin-bottom: 24px;
  }
  .search-bar {
    width: 100%;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 10px 16px 10px 40px;
    font-size: 14px;
    color: var(--text-primary);
    transition: border-color 0.2s;
  }
  .search-bar:focus { border-color: var(--text-tertiary); }
  .search-bar::placeholder { color: var(--text-tertiary); }
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
  }
  .user-result {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 4px;
    border-bottom: 1px solid var(--border-light);
    text-decoration: none;
    color: inherit;
    transition: background 0.15s;
    border-radius: var(--radius-sm);
  }
  .user-result:hover { background: var(--bg-primary); padding: 12px 8px; }
  .user-result-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .user-result-avatar-placeholder {
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
  .user-result-name { font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 4px; }
  .user-result-fullname { font-size: 13px; color: var(--text-secondary); }
`;

export function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi.getExplore().then(res => {
      setPosts(res.data.items);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="explore-page">
        {loading ? (
          <div className="explore-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: 1 }} />
            ))}
          </div>
        ) : (
          <div className="explore-grid">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                to={`/p/${post.id}`}
                className={`explore-item ${i % 5 === 0 ? 'tall' : ''}`}
              >
                {post.mediaItems[0] && (
                  post.mediaItems[0].mediaType === 'Video' ? (
                    <video src={post.mediaItems[0].url} muted />
                  ) : (
                    <img src={post.mediaItems[0].url} alt="post" />
                  )
                )}
                <div className="explore-overlay">
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
        )}
      </div>
    </>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      setSearching(true);
      usersApi.search(query)
        .then(res => setResults(res.data))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <style>{styles}</style>
      <div className="search-page">
        <div className="search-bar-container">
          <Search className="search-icon" size={16} />
          <input
            className="search-bar"
            placeholder="Search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {results.map(user => (
          <Link key={user.id} to={`/${user.username}`} className="user-result">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={user.username} className="user-result-avatar" />
            ) : (
              <div className="user-result-avatar-placeholder">{user.username[0].toUpperCase()}</div>
            )}
            <div>
              <div className="user-result-name">
                {user.username}
                {user.isVerified && <BadgeCheck size={14} fill="#0095f6" stroke="white" />}
              </div>
              {user.fullName && <div className="user-result-fullname">{user.fullName}</div>}
            </div>
          </Link>
        ))}

        {query && !searching && results.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>
            No results for "{query}"
          </div>
        )}
      </div>
    </>
  );
}
