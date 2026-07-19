"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

export default function LoginForm({ onSubmit, isLoading = false }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isLoading) {
      onSubmit(credentials)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Email input */}
        <div className="input-group">
          <div className="input-wrapper">
            <input
              name="email"
              type="email"
              required
              className="animated-input"
              placeholder="Email address"
              value={credentials.email}
              onChange={handleChange}
            />
            <div className="input-underline"></div>
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Password input */}
        <div className="input-group">
          <div className="input-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="animated-input"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
            />
            <div className="input-underline"></div>
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.07 21.07 0 0 1 5.06-7.06"></path>
                  <path d="M1 1l22 22"></path>
                  <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"></path>
                </svg>
              )}
            </button>
          </div>
          <div className="forgot-link-wrapper">
            <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
          </div>
        </div>
      </div>

      <button type="submit" className={`submit-button ${isLoading ? "is-loading" : ""}`} disabled={isLoading}>
        <span className="button-text">{isLoading ? "Logging in..." : "Login"}</span>
        {isLoading && (
          <div className="dots-loader">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
      </button>

      <style jsx>{`
        .space-y-6 { display: flex; flex-direction: column; gap: 20px; }
        .space-y-4 { display: flex; flex-direction: column; gap: 12px; }

        .input-wrapper { position: relative; display: flex; align-items: center; }

        .animated-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background: var(--input-bg);
          border: 1px solid var(--border-light);
          border-radius: 10px;
          color: var(--text-primary);
          outline: none;
          transition: 0.3s;
        }

        .animated-input:focus {
          border-color: #667eea;
          background: var(--card-bg);
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .input-icon { position: absolute; left: 12px; color: var(--text-muted); }
        .input-underline {
          position: absolute; bottom: 0; left: 0; height: 2px;
          background: var(--accent-gradient); width: 0; transition: 0.3s;
        }
        .animated-input:focus ~ .input-underline { width: 100%; }

        .eye-toggle {
          position: absolute; right: 10px; background: none;
          border: none; color: var(--text-muted); cursor: pointer;
        }

        .forgot-link-wrapper {
          margin-top: 8px;
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }

        .forgot-password-link {
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
        }

        .forgot-password-link:hover {
          color: #667eea;
        }

        .submit-button {
          width: 100%;
          padding: 14px;
          background: var(--accent-gradient);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          position: relative;
          transition: 0.3s;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          overflow: hidden;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-button:disabled { opacity: 0.8; cursor: not-allowed; }

        /* Dots Loader Styles */
        .dots-loader { display: flex; gap: 4px; }
        .dot {
          width: 6px; height: 6px; background: white;
          border-radius: 50%; animation: blink 1.4s infinite both;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </form>
  )
}
