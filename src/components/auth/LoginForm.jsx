"use client"

import { useState } from "react"

export default function LoginForm({ onSubmit, isLoading = false }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(credentials)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Email input with animation */}
        <div className="input-group">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <div className="input-wrapper">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="animated-input"
              placeholder="Email address"
              value={credentials.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
            <div className="input-underline"></div>
            <div className="input-icon email-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Password input with animation */}
        <div className="input-group">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <div className="input-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="animated-input"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <div className="input-underline"></div>
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
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
        </div>
      </div>

      {/* Submit button with loading animation */}
      <button type="submit" className={`submit-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
        <div className="button-content">
          <span className="button-text">{isLoading ? "Logging in..." : "Login"}</span>
          {isLoading && (
            <div className="dots-container" role="status" aria-live="polite" aria-label="Loading">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
        </div>
      </button>

      <style jsx>{`
        .space-y-6 {
          display: flex;
          flex-direction: column;
          gap: 24px;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .space-y-4 {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Input group styling */
        .input-group {
          position: relative;
          animation: slideInLeft 0.6s ease-out;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        /* Animated input field */
        .animated-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
          background: #f9fafb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .animated-input::placeholder {
          color: #9ca3af;
        }

        .animated-input:focus {
          background: white;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 
                      0 8px 16px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px) scale(1.01);
        }

        .animated-input:hover:not(:focus) {
          border-color: #d1d5db;
          background: #fafbfc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Input underline animation */
        .input-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          width: 0;
          transition: width 0.3s ease;
          pointer-events: none;
        }

        .animated-input:focus ~ .input-underline {
          width: 100%;
        }

        /* Input icons */
        .input-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .animated-input:focus ~ .input-icon {
          color: #667eea;
          transform: scale(1.1) rotate(5deg);
        }

        /* Eye toggle button */
        .eye-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          transition: all 0.3s ease;
          border-radius: 8px;
        }

        .eye-toggle:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          transform: scale(1.15);
        }

        .eye-toggle:active {
          transform: scale(0.95);
        }

        /* Submit button */
        .submit-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          animation: slideInUp 0.6s ease-out 0.2s both;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .submit-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(-1px) scale(1.01);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-button.loading {
          pointer-events: none;
        }

        .button-content { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; width:100%; }
        .submit-button.loading .button-content { flex-direction: column; gap: 10px; }

        .dots-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }

        .dot {
          height: 12px;
          width: 12px;
          margin-right: 8px;
          border-radius: 10px;
          background-color: #b3d4fc;
          animation: pulse 1.5s infinite ease-in-out;
        }

        .dot:last-child {
          margin-right: 0;
        }

        .dot:nth-child(1) {
          animation-delay: -0.3s;
        }

        .dot:nth-child(2) {
          animation-delay: -0.1s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.1s;
        }

        .dot:nth-child(4) {
          animation-delay: 0.3s;
        }

        .dot:nth-child(5) {
          animation-delay: 0.5s;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            background-color: #b3d4fc;
            box-shadow: 0 0 0 0 rgba(178, 212, 252, 0.7);
          }

          50% {
            transform: scale(1.2);
            background-color: #6793fb;
            box-shadow: 0 0 0 10px rgba(178, 212, 252, 0);
          }

          100% {
            transform: scale(0.8);
            background-color: #b3d4fc;
            box-shadow: 0 0 0 0 rgba(178, 212, 252, 0.7);
          }
        }

        @media (max-width: 640px) {
          .animated-input {
            padding: 12px 14px 12px 40px;
            font-size: 16px;
          }

          .submit-button {
            padding: 12px 20px;
            font-size: 15px;
          }
        }
      `}</style>
    </form>
  )
}
