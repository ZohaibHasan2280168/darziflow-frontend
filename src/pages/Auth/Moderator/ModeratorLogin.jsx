import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../../components/auth/LoginForm';
import authService from "../../../services/authService";


export default function ModeratorLogin() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }) => {
    setIsLoading(true);
    setError('');
    try {
      const userData = await authService.login({ email, password });
      if (userData.user.role !== "ADMIN" && userData.user.role !== "MODERATOR") {
        setError("Access denied: Only moderators and admins can login here.");
        return;
      }

      // ✅ If login is successful, redirect
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex-center login-bg">
      {/* animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-circle" aria-hidden>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="login-title">Moderator Login</h2>
            <p className="login-subtitle">Access your moderator dashboard</p>
          </div>

          <div className="form-wrapper">
            {error && <div className="error-message" role="alert">{error}</div>}
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          </div>

          <div className="login-footer">
            {/* <p className="footer-text">
              Don't have an account?{" "}
              <a href="#" className="footer-link">
                Contact admin
              </a>
            </p> */}
          </div>
        </div>
      </div>

      <style jsx>{`
        .min-h-screen { min-height: 100vh; }
        .flex-center { display: flex; align-items: center; justify-content: center; position: relative; }

        .absolute { position: absolute; }
        .inset-0 { top:0; right:0; bottom:0; left:0; }
        .overflow-hidden { overflow: hidden; }
        .pointer-events-none { pointer-events: none; }

        .login-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          position: relative;
        }

        .floating-orb { position: absolute; border-radius: 50%; opacity: 0.12; filter: blur(40px); }
        .orb-1 { width: 300px; height: 300px; background: rgba(255,255,255,0.5); top: -120px; right: -80px; animation: float 8s ease-in-out infinite; }
        .orb-2 { width: 220px; height: 220px; background: rgba(255,255,255,0.28); bottom: -60px; left: -50px; animation: float 10s ease-in-out infinite reverse; }
        .orb-3 { width: 260px; height: 260px; background: rgba(255,255,255,0.22); top: 45%; left: 8%; animation: float 12s ease-in-out infinite; }

        @keyframes float {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(30px,30px); }
        }

        .login-container { perspective: 1000px; position: relative; z-index: 10; padding: 20px; width:100%; max-width:480px; }

        .login-card {
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(18px);
          border-radius: 22px;
          padding: 44px 36px;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 24px 60px rgba(0,0,0,0.28), 0 0 1px rgba(255,255,255,0.5) inset;
          animation: cardSlideIn 0.8s cubic-bezier(0.34,1.56,0.64,1);
          transform-style: preserve-3d;
          transition: transform 0.28s ease;
        }
        .login-card:hover { transform: translateZ(8px) rotateX(2deg); }

        @keyframes cardSlideIn {
          from { opacity:0; transform: translateY(30px) rotateX(8deg); } to { opacity:1; transform: translateY(0) rotateX(0); }
        }

        .login-header { text-align:center; margin-bottom: 28px; animation: fadeInDown 0.8s ease 0.15s both; }
        @keyframes fadeInDown { from { opacity:0; transform: translateY(-16px); } to { opacity:1; transform: translateY(0); } }

        .logo-circle {
          width:64px; height:64px; border-radius:50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display:flex; align-items:center; justify-content:center; color:white; margin:0 auto 12px;
          box-shadow: 0 10px 28px rgba(102,126,234,0.34);
          animation: logoFloat 3s ease-in-out infinite;
        }
        @keyframes logoFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

        .login-title {
          font-size: 26px; font-weight:800; margin:0 0 6px 0;
          background: linear-gradient(135deg,#667eea,#764ba2);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .login-subtitle { margin:0; color:#6b7280; font-weight:500; font-size:14px; }

        .form-wrapper { animation: fadeInUp 0.8s ease 0.35s both; }
        @keyframes fadeInUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }

        .error-message {
          background: #fee2e2; color:#991b1b; padding:12px 14px; border-radius:8px; margin-bottom:14px;
          font-size:14px; border-left:4px solid #dc2626; animation: slideInDown 0.28s ease;
        }
        @keyframes slideInDown { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }

        .login-footer { text-align:center; margin-top:22px; padding-top:18px; border-top:1px solid rgba(0,0,0,0.04); animation: fadeInUp 0.8s ease 0.55s both; }
        .footer-text { color:#6b7280; font-size:14px; margin:0; }
        .footer-link { color:#667eea; text-decoration:none; font-weight:600; position:relative; }
        .footer-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background: linear-gradient(90deg,#667eea,#764ba2); transition: width .28s; }
        .footer-link:hover::after { width:100%; }

        @media (max-width:640px) {
          .login-card { padding: 28px 20px; }
          .logo-circle { width:56px; height:56px; }
          .login-title { font-size:22px; }
        }
      `}</style>
    </div>
  );
}