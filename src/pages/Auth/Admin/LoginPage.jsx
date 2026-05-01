import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from '../../../components/auth/LoginForm';
import { useAuth } from "../../../components/context/AuthContext";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, logout } = useAuth();

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
      setError(err.response?.data?.message || err?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="login-container">
        <div className="login-card animated-gradient-border">
          <div className="login-header">
            <div className="logo-circle admin-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h1 className="login-title">Admin Login</h1>
            <p className="login-subtitle">Secure Access</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-wrapper">
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          <div className="login-footer">
            <p className="footer-text">
              Don't have an account? <button onClick={() => navigate("/admin-signup")} className="footer-link-btn">Sign Up</button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page-wrapper {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--body-bg);
          overflow: hidden;
        }
        .login-container { width: 100%; max-width: 400px; z-index: 10; }
        
        .login-card {
          border-radius: 24px;
          padding: 35px 40px;
          position: relative;
          z-index: 11;
        }

        .logo-circle {
          width: 55px; height: 55px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--accent-gradient); color: white; margin: 0 auto 15px;
        }

        .login-title {
          font-size: 26px; font-weight: 800; text-align: center;
          background: var(--accent-gradient);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 5px;
        }

        .login-subtitle { text-align: center; color: var(--text-secondary); margin-bottom: 25px; }

        .form-wrapper { position: relative; z-index: 20; }

        .error-message {
          background: rgba(239, 68, 68, 0.1); color: #ef4444;
          padding: 10px; border-radius: 8px; margin-bottom: 15px;
          border-left: 4px solid #ef4444; font-size: 13px;
        }

        .login-footer {
          text-align: center; margin-top: 20px;
          padding-top: 20px; border-top: 1px solid var(--border-light);
        }

        .footer-text { font-size: 14px; color: var(--text-secondary); }
        .footer-link-btn {
          background: none; border: none; color: #764ba2;
          font-weight: 600; cursor: pointer; padding: 0 5px;
        }

        :global(.submit-button) {
          z-index: 30;
          position: relative;
        }
      `}</style>
    </div>
  );
}