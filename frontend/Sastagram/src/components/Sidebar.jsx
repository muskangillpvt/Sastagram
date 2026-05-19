import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Compass, Film, MessageCircle, Heart, PlusSquare, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

const styles = `
  .sidebar {
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    width: var(--sidebar-width);
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 8px 0 20px;
    z-index: 100;
    transition: width 0.3s;
  }
  .sidebar-logo {
    padding: 16px 20px 8px;
    font-family: var(--font-logo);
    font-size: 28px;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    cursor: pointer;
  }
  .sidebar-logo.collapsed {
    font-size: 0;
    padding: 16px 20px;
  }
  .sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 0;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    border-radius: var(--radius-md);
    margin: 0 8px;
    transition: background 0.15s;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 400;
    position: relative;
  }
  .nav-item:hover { background: var(--bg-primary); }
  .nav-item.active { font-weight: 600; }
  .nav-item svg { flex-shrink: 0; }
  .nav-badge {
    position: absolute;
    top: 8px;
    left: 34px;
    background: var(--accent);
    color: white;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }
  .sidebar-bottom {
    padding: 0 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .sidebar-user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border);
  }
  .sidebar-user-avatar-placeholder {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 1263px) {
    :root { --sidebar-width: 72px; }
    .nav-label { display: none; }
    .sidebar-logo { font-size: 0 !important; }
    .sidebar-logo::after {
      content: '';
      display: block;
      width: 32px;
      height: 32px;
      background: var(--accent-gradient);
      border-radius: 8px;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z'/%3E%3C/svg%3E");
    }
  }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .mobile-nav {
      display: flex !important;
    }
  }

  .mobile-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    padding: 8px 0;
    z-index: 100;
    justify-content: space-around;
  }
  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 16px;
    color: var(--text-primary);
  }
`;



export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [notifCount] = useState(0);

  const navItems = [
    { icon: <Home size={24} />, label: 'Home', to: '/' },
    { icon: <Search size={24} />, label: 'Search', to: '/search' },
    { icon: <Compass size={24} />, label: 'Explore', to: '/explore' },
    { icon: <Film size={24} />, label: 'Reels', to: '/reels' },
    { icon: <MessageCircle size={24} />, label: 'Messages', to: '/messages' },
    { icon: <Heart size={24} />, label: 'Notifications', to: '/notifications', badge: notifCount },
    { icon: <PlusSquare size={24} />, label: 'Create', to: '/create' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{styles}</style>
      <nav className="sidebar">
        <Link to="/" className="sidebar-logo">Sastagram</Link>

        <div className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item ${location.pathname === item.to ? 'active' : ''}`}
            >
              {item.icon}
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}

          <Link
            to={`/${user?.username}`}
            className={`nav-item ${location.pathname === `/${user?.username}` ? 'active' : ''}`}
          >
            {user?.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="" className="sidebar-user-avatar" />
            ) : (
              <div className="sidebar-user-avatar-placeholder">
                <User size={14} />
              </div>
            )}
            <span className="nav-label">Profile</span>
          </Link>
        </div>

        <div className="sidebar-bottom">
          <button className="nav-item" onClick={handleLogout} style={{ width: '100%', textAlign: 'left' }}>
            <LogOut size={24} />
            <span className="nav-label">Log out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        <Link to="/" className="mobile-nav-item"><Home size={24} /></Link>
        <Link to="/search" className="mobile-nav-item"><Search size={24} /></Link>
        <Link to="/create" className="mobile-nav-item"><PlusSquare size={24} /></Link>
        <Link to="/notifications" className="mobile-nav-item"><Heart size={24} /></Link>
        <Link to={`/${user?.username}`} className="mobile-nav-item">
          {user?.profilePictureUrl ? (
            <img src={user.profilePictureUrl} alt="" className="sidebar-user-avatar" />
          ) : <User size={24} />}
        </Link>
      </nav>
    </>
  );
}
