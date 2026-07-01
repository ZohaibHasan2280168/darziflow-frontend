import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/context/AuthContext";
import SignupForm from '../../../components/auth/SignupForm';
import authService from '../../../services/authService';

export default function AdminSignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError("");
    try {
      await authService.register({ ...formData, role: "ADMIN" });
      await login({ email: formData.email, password: formData.password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="signup-container">
        {/* Animated Border Class Added */}
        <div className="signup-card animated-gradient-border">
          <div className="login-header">
            <div className="logo-circle admin-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h1 className="login-title">Admin Sign Up</h1>
            <p className="login-subtitle">Create your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-wrapper">
            <SignupForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          <div className="legal-links">
            <button className="legal-link" onClick={() => navigate('/terms')}>Terms & Conditions</button>
            <button className="legal-link" onClick={() => navigate('/privacy')}>Privacy Policy</button>
          </div>

          <div className="login-footer">
            <p className="footer-text">
              Already have an account? <button onClick={() => navigate("/admin-login")} className="footer-link-btn">Login</button>
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
          padding: 10px;
        }
        .signup-container { width: 100%; max-width: 420px; z-index: 10; }
        
        .signup-card {
          border-radius: 24px;
          padding: 25px 35px; /* Compact padding */
          position: relative;
          z-index: 11;
          /* Background transparent rakha hai taake animation dikhe */
        }

        .logo-circle {
          width: 50px; height: 50px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--accent-gradient); color: white; margin: 0 auto 10px;
        }

        .login-title {
          font-size: 24px; font-weight: 800; text-align: center;
          background: var(--accent-gradient);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .login-subtitle { text-align: center; color: var(--text-secondary); font-size: 13px; margin-bottom: 15px; }

        .form-wrapper { position: relative; z-index: 20; }

        .legal-links {
          display:flex; gap:10px; justify-content:center; margin-top:10px;
        }
        .legal-link { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 13px; }

        .error-message {
          background: rgba(239, 68, 68, 0.1); color: #ef4444;
          padding: 8px; border-radius: 8px; margin-bottom: 10px; font-size: 12px;
          border-left: 4px solid #ef4444;
        }

        .login-footer {
          text-align: center; margin-top: 15px;
          padding-top: 15px; border-top: 1px solid var(--border-light);
        }

        .footer-text { font-size: 13px; color: var(--text-secondary); }
        .footer-link-btn {
          background: none; border: none; color: #764ba2;
          font-weight: 600; cursor: pointer; padding: 0 5px;
        }

        :global(.animated-input) {
          width: 100%; padding: 10px 12px 10px 40px;
          background: var(--input-bg); border: 1px solid var(--border-light);
          border-radius: 10px; color: var(--text-primary); outline: none;
        }

        :global(.submit-button) {
          width: 100%; padding: 12px; margin-top: 10px;
          background: var(--accent-gradient); color: white;
          border: none; border-radius: 10px; font-weight: 700;
          cursor: pointer; z-index: 30; position: relative;
        }
      `}</style>
    </div>
  );
}