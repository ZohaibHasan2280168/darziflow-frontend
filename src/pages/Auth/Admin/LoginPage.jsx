import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginForm from '../../../components/auth/LoginForm';
import { useAuth } from "../../../components/context/AuthContext";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login,logout } = useAuth();

  const handleSubmit = async (credentials) => {
    setIsLoading(true);
    setError("");

    try {
      const userData = await login({
        email: credentials.email,
        password: credentials.password,
        platform: "WEB",
      });

    if (userData.user.role !== "ADMIN") {
      await logout(); 
      setError("Access denied: Only admins can login here.");
      return;
    }

  
    navigate("/dashboard");
    
    } catch (err) {
      setError(
        err.response?.data?.message || err?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Main login card */}
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-circle admin-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h1 className="login-title admin-title">Admin Login</h1>
            <p className="login-subtitle">Full system access</p>
          </div>

          <div className="form-wrapper">
            {error && <div className="error-message">{error}</div>}
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />

            {/* 🔹 Forgot Password Link */}
            <div className="forgot-password-wrapper">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>
          </div>

          <div className="login-footer">
            <p className="footer-text">
              Need help?{" "}
              <a href="#" className="footer-link">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .min-h-screen { min-height: 100vh; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .absolute { position: absolute; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .overflow-hidden { overflow: hidden; }
        .pointer-events-none { pointer-events: none; }

        .login-bg {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 50%, #667eea 100%);
          position: relative;
          overflow: hidden;
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          filter: blur(40px);
        }

        .orb-1 { width: 300px; height: 300px; background: rgba(255, 255, 255, 0.5); top: -100px; right: -100px; animation: float 8s ease-in-out infinite; }
        .orb-2 { width: 200px; height: 200px; background: rgba(255, 255, 255, 0.3); bottom: -50px; left: -50px; animation: float 10s ease-in-out infinite reverse; }
        .orb-3 { width: 250px; height: 250px; background: rgba(255, 255, 255, 0.2); top: 50%; left: 10%; animation: float 12s ease-in-out infinite; }

        @keyframes float {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(30px,30px); }
        }

        .login-container { perspective: 1000px; position: relative; z-index: 10; padding: 20px; width: 100%; max-width: 450px; }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3),
                      0 0 1px rgba(255,255,255,0.5) inset;
          animation: cardSlideIn 0.8s cubic-bezier(0.34,1.56,0.64,1);
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .login-card:hover { transform: translateZ(10px) rotateX(2deg); }

        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(30px) rotateX(10deg); }
          to { opacity: 1; transform: translateY(0) rotateX(0); }
        }

        .login-header { text-align: center; margin-bottom: 32px; animation: fadeInDown 0.8s ease 0.2s both; }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo-circle {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: white; margin: 0 auto 16px;
          box-shadow: 0 8px 24px rgba(102,126,234,0.4);
          animation: logoFloat 3s ease-in-out infinite;
        }

        .logo-circle.admin-logo {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          box-shadow: 0 8px 24px rgba(118,75,162,0.4);
        }

        @keyframes logoFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .login-title {
          font-size: 28px; font-weight: 800; margin: 0 0 8px;
          background: linear-gradient(135deg,#667eea,#764ba2);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .login-title.admin-title {
          background: linear-gradient(135deg,#764ba2,#667eea);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .login-subtitle { font-size: 14px; color: #6b7280; margin: 0; font-weight: 500; }

        .form-wrapper { animation: fadeInUp 0.8s ease 0.4s both; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .forgot-password-wrapper {
          text-align: right;
          margin-top: 10px;
        }

        .forgot-password-link {
          color: #764ba2;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .forgot-password-link:hover {
          color: #667eea;
        }

        .error-message {
          background: #fee2e2; color: #991b1b;
          padding: 12px 16px; border-radius: 8px;
          margin-bottom: 16px; font-size: 14px;
          border-left: 4px solid #dc2626; animation: slideInDown 0.3s ease;
        }

        .login-footer {
          text-align: center; margin-top: 24px;
          padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.05);
          animation: fadeInUp 0.8s ease 0.6s both;
        }

        .footer-text { font-size: 14px; color: #6b7280; margin: 0; }

        .footer-link {
          color: #764ba2; text-decoration: none; font-weight: 600;
          transition: all 0.3s ease; position: relative;
        }

        .footer-link::after {
          content: ''; position: absolute; bottom: -2px; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg,#764ba2,#667eea);
          transition: width 0.3s ease;
        }

        .footer-link:hover::after { width: 100%; }

        @media (max-width: 640px) {
          .login-card { padding: 32px 24px; }
          .login-title { font-size: 24px; }
          .logo-circle { width: 56px; height: 56px; }
        }
      `}</style>
    </div>
  );
}
