import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

const authStyles = `
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    padding: 20px;
  }
  .auth-container {
    width: 100%;
    max-width: 350px;
  }
  .auth-box {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 40px 40px 24px;
    text-align: center;
    margin-bottom: 10px;
  }
  .auth-logo {
    font-family: var(--font-logo);
    font-size: 42px;
    margin-bottom: 8px;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .auth-tagline {
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 17px;
    margin-bottom: 28px;
    line-height: 1.3;
  }
  .auth-input {
    width: 100%;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    font-size: 12px;
    margin-bottom: 6px;
    transition: border-color 0.2s;
  }
  .auth-input:focus {
    border-color: var(--text-tertiary);
  }
  .auth-btn {
    width: 100%;
    background: var(--blue);
    color: white;
    border-radius: var(--radius-sm);
    padding: 8px 16px;
    font-weight: 600;
    font-size: 14px;
    margin-top: 8px;
    transition: opacity 0.2s;
  }
  .auth-btn:hover { opacity: 0.85; }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 16px 0;
    color: var(--text-tertiary);
    font-size: 13px;
    font-weight: 600;
  }
  .auth-divider::before, .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .auth-link-box {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 20px;
    text-align: center;
    font-size: 14px;
    color: var(--text-secondary);
  }
  .auth-link-box a {
    color: var(--blue);
    font-weight: 600;
  }
`;

export function LoginPage() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const data = res.data;
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{authStyles}</style>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-logo">Sastagram</div>
            <p className="auth-tagline">Sign in to see photos & videos from your friends.</p>
            <form onSubmit={handleSubmit}>
              <input
                className="auth-input"
                placeholder="Phone number, username, or email"
                value={form.usernameOrEmail}
                onChange={e => setForm(f => ({ ...f, usernameOrEmail: e.target.value }))}
                required
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            <div className="auth-divider">OR</div>
            <div style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>
              <a href="#">Log in with Facebook</a>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--blue)' }}>
              <a href="#">Forgot password?</a>
            </div>
          </div>
          <div className="auth-link-box">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ email: '', fullName: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(form);
      const data = res.data;
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{authStyles}</style>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-logo">Sastagram</div>
            <p className="auth-tagline">Sign up to see photos & videos from your friends.</p>
            <form onSubmit={handleSubmit}>
              <input className="auth-input" placeholder="Mobile Number or Email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <input className="auth-input" placeholder="Full Name" value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
              <input className="auth-input" placeholder="Username" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
              <input className="auth-input" type="password" placeholder="Password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 16, lineHeight: 1.5 }}>
              By signing up, you agree to our{' '}
              <a href="#" style={{ color: 'inherit', fontWeight: 600 }}>Terms</a>,{' '}
              <a href="#" style={{ color: 'inherit', fontWeight: 600 }}>Privacy Policy</a> and{' '}
              <a href="#" style={{ color: 'inherit', fontWeight: 600 }}>Cookies Policy</a>.
            </p>
          </div>
          <div className="auth-link-box">
            Have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </>
  );
}
