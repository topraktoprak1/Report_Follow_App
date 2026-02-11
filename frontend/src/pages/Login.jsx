import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/proje-raporlama');
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Activity size={28} />
          </div>
          <h1 className="login-logo-text">ANTI-KARMA</h1>
          <p className="login-logo-subtitle">Rapor takip platformu</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="login-field">
            <label className="login-label">E-posta</label>
            <div className="login-input-wrapper">
              <Mail size={16} className="login-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@firma.com"
                className="login-input"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Şifre</label>
            <div className="login-input-wrapper">
              <Lock size={16} className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="login-input"
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="login-footer">
          <p>Varsayılan: admin@firma.com / admin123</p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          position: relative;
          overflow: hidden;
        }
        .login-bg-effects {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .login-bg-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .login-bg-circle.c1 {
          width: 500px; height: 500px;
          background: var(--accent-cyan);
          top: -150px; right: -100px;
          animation: float 8s ease-in-out infinite;
        }
        .login-bg-circle.c2 {
          width: 400px; height: 400px;
          background: var(--accent-purple);
          bottom: -100px; left: -100px;
          animation: float 10s ease-in-out infinite reverse;
        }
        .login-bg-circle.c3 {
          width: 300px; height: 300px;
          background: var(--accent-teal);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: float 12s ease-in-out infinite;
        }
        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }

        .login-card {
          background: rgba(17, 29, 51, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 48px 40px;
          width: 420px;
          max-width: 90vw;
          position: relative;
          z-index: 1;
          box-shadow: var(--shadow-lg);
        }

        .login-logo {
          text-align: center;
          margin-bottom: 36px;
        }
        .login-logo-icon {
          width: 56px; height: 56px;
          background: var(--gradient-primary);
          border-radius: var(--radius-lg);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--bg-primary);
          margin-bottom: 16px;
          box-shadow: var(--shadow-glow);
        }
        .login-logo-text {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-white);
          letter-spacing: 2px;
        }
        .login-logo-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: var(--radius-sm);
          color: var(--accent-red);
          font-size: 0.85rem;
          margin-bottom: 20px;
        }

        .login-field {
          margin-bottom: 20px;
        }
        .login-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .login-input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .login-input:focus {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.1);
        }
        .login-input::placeholder {
          color: var(--text-muted);
        }
        .login-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
        }
        .login-eye-btn:hover { color: var(--text-secondary); }

        .login-submit {
          width: 100%;
          padding: 14px;
          background: var(--gradient-primary);
          border: none;
          border-radius: var(--radius-sm);
          color: var(--bg-primary);
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-top: 8px;
        }
        .login-submit:hover:not(:disabled) {
          box-shadow: var(--shadow-glow);
          transform: translateY(-1px);
        }
        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
