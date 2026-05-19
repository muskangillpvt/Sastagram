import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { ProfilePage } from './pages/ProfilePage';
import { ExplorePage, SearchPage } from './pages/ExplorePage';
import { CreatePostPage } from './pages/CreatePostPage';
import { NotificationsPage } from './pages/NotificationsPage';

const appStyles = `
  .app-layout {
    display: flex;
    min-height: 100vh;
  }
  .app-main {
    margin-left: var(--sidebar-width);
    flex: 1;
    min-height: 100vh;
    transition: margin-left 0.3s;
  }
  @media (max-width: 768px) {
    .app-main { margin-left: 0; padding-bottom: 60px; }
  }
`;

function ProtectedLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <style>{appStyles}</style>
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

function AuthRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#262626',
            color: '#ffffff',
            fontSize: '14px',
          }
        }}
      />
      <Routes>
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/:username" element={<ProfilePage />} />
          <Route path="/:username/followers" element={<div style={{padding:40}}>Followers page coming soon</div>} />
          <Route path="/:username/following" element={<div style={{padding:40}}>Following page coming soon</div>} />
          <Route path="/p/:id" element={<div style={{padding:40}}>Post detail page coming soon</div>} />
          <Route path="/reels" element={<div style={{padding:40, textAlign:'center', color:'var(--text-secondary)'}}>Reels coming soon</div>} />
          <Route path="/messages" element={<div style={{padding:40, textAlign:'center', color:'var(--text-secondary)'}}>Messages coming soon</div>} />
          <Route path="/settings" element={<div style={{padding:40}}>Settings coming soon</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
