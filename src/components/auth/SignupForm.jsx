"use client"

import { useState } from "react"
import { FiEye, FiEyeOff, FiMail, FiUser, FiLock } from "react-icons/fi"

export default function SignupForm({ onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    onSubmit(formData)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Name */}
        <div className="input-group">
          <div className="input-wrapper">
            <FiUser className="input-icon" />
            <input
              type="text"
              name="name"
              required
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="animated-input"
            />
            <div className="input-underline"></div>
          </div>
        </div>

        {/* Email */}
        <div className="input-group">
          <div className="input-wrapper">
            <FiMail className="input-icon" />
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="animated-input"
            />
            <div className="input-underline"></div>
          </div>
        </div>

        {/* Password */}
        <div className="input-group">
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="animated-input"
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            <div className="input-underline"></div>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="input-group">
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="animated-input"
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            <div className="input-underline"></div>
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="error-text">{error}</p>}
      </div>

      {/* Submit */}
      <button type="submit" className={`submit-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Sign Up"}
      </button>

      <style jsx>{`
        .space-y-6 {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .space-y-4 {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          position: relative;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
          font-size: 18px;
          pointer-events: none;
          transition: color 0.3s ease;
        }

        .animated-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937; /* dark text */
          background: #f9fafb;
          transition: all 0.3s ease;
          outline: none;
        }

        .animated-input::placeholder {
          color: #9ca3af;
        }

        .animated-input:focus {
          background: white;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .animated-input:focus ~ .input-icon {
          color: #667eea;
        }

        .input-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          width: 0;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .animated-input:focus ~ .input-underline {
          width: 100%;
        }

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
        }

        .error-text {
          color: #e63946;
          font-size: 0.9rem;
          margin-top: 4px;
        }

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
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .animated-input {
            padding: 12px 14px 12px 40px;
            font-size: 15px;
          }
        }
      `}</style>
    </form>
  )
}
