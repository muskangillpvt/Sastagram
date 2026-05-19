import { useState, useEffect } from 'react';
import { postsApi } from '../services/api';
import { PostCard } from '../components/PostCard';
import { StoriesBar } from '../components/StoriesBar';

const styles = `
  .home-layout {
    display: flex;
    justify-content: center;
    gap: 32px;
    padding: 24px 16px;
    max-width: 935px;
    margin: 0 auto;
  }
  .feed-column {
    width: 100%;
    max-width: 470px;
  }
  .load-more-btn {
    width: 100%;
    padding: 12px;
    color: var(--blue);
    font-weight: 600;
    font-size: 14px;
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 24px;
  }
  .feed-empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
  }
  .feed-empty h3 {
    font-size: 22px;
    margin-bottom: 8px;
    color: var(--text-primary);
  }
  .skeleton-post {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    margin-bottom: 16px;
    overflow: hidden;
  }
`;

export function HomePage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPosts = async (pageNum) => {
    try {
      const res = await postsApi.getFeed(pageNum);
      const data = res.data;
      if (pageNum === 1) {
        setPosts(data.items);
      } else {
        setPosts(prev => [...prev, ...data.items]);
      }
      setHasMore(data.hasMore);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(1); }, []);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="home-layout">
        <div className="feed-column">
          <StoriesBar />

          {loading ? (
            <>
              {[1,2,3].map(i => (
                <div key={i} className="skeleton-post">
                  <div style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 10, width: '25%' }} />
                    </div>
                  </div>
                  <div className="skeleton" style={{ height: 400 }} />
                  <div style={{ padding: 12 }}>
                    <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '80%' }} />
                  </div>
                </div>
              ))}
            </>
          ) : posts.length === 0 ? (
            <div className="feed-empty">
              <h3>Welcome to Sastagram!</h3>
              <p>Follow some people to see posts in your feed.</p>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
              {hasMore && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load more
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
