"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Navbar from "../../components/layout/Navbar"

const API_URL = "http://localhost:5000/api"

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken")
  const parsedData = storedData ? JSON.parse(storedData) : null
  return parsedData?.accessToken
}

export default function AddUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = getToken()
      if (!token) {
        setError("No access token found. Please login again.")
        setLoading(false)
        return
      }

      const res = await axios.post(
        `${API_URL}/admin/create`,
        {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (res.status === 201) {
        setSuccess(true)
        setForm({ name: "", email: "", password: "", role: "" })
        setTimeout(() => {
          navigate(-1)
        }, 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-user-container">
      <Navbar />
      <div className="add-user-content">
        {/* Header Section */}
        <div className="form-header">
          <div className="header-text">
            <h1 className="form-title">Add New User</h1>
            <p className="form-subtitle">Create a new team member account</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="form-card">
          <div className="card-bg-gradient"></div>
          <div className="card-blur-element"></div>

          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <div>
                <p className="success-title">User Created Successfully!</p>
                <p className="success-text">Redirecting back...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div>
                <p className="error-title">Error</p>
                <p className="error-text">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form" autoComplete="off">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className="form-input"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
              <div className="input-border"></div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="john@company.com"
              />
              <div className="input-border"></div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <div className="input-border"></div>
            </div>

            {/* Role Field */}
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="form-input form-select"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="Moderator">Moderator</option>
                <option value="Admin">Admin</option>
                <option value="QC_MEMBER">QC Member</option>
              </select>
              <div className="input-border"></div>
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading || success}>
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
              <button type="button" className="cancel-button" onClick={() => navigate(-1)} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        /* Page background / theme */
        .add-user-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #071022 0%, #0f172a 45%, #071022 100%);
          position: relative;
          overflow-x: hidden;
          color: #e6eef8;
          -webkit-font-smoothing: antialiased;
        }

        /* Subtle neon blobs to match site theme */
        .add-user-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            radial-gradient(circle at 18% 50%, rgba(3, 169, 244, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 40%);
          pointer-events: none;
          z-index: 0;
          mix-blend-mode: screen;
        }

        .add-user-content {
          position: relative;
          z-index: 1;
          padding: 2rem 1.5rem;
          max-width: 680px;
          margin: 0 auto;
        }

        .form-header {
          margin-bottom: 2rem;
          animation: slideUp 0.6s ease-out;
        }

        .header-text h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(90deg, #a5f3fc 0%, #c4b5fd 50%, #7dd3fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
        }

        .form-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0;
        }

        /* Card now follows dark page gradient so form area is fully dark-themed */
        .form-card {
          background: linear-gradient(135deg, #071022 0%, #0f172a 45%);
          backdrop-filter: blur(10px) saturate(120%);
          border: 1px solid rgba(255,255,255,0.03);
          color: #e6eef8;
          border-radius: 18px;
          padding: 2.25rem;
          position: relative;
          overflow: hidden;
          animation: slideUp 0.6s ease-out 0.08s both;
          box-shadow: 0 18px 50px rgba(2,6,23,0.7), 0 4px 10px rgba(0,0,0,0.35);
          transform-style: preserve-3d;
          transition: transform 0.35s cubic-bezier(.2,.9,.2,1), box-shadow 0.35s;
        }
        .form-card:hover {
          transform: translateY(-6px) rotateX(0.9deg);
          box-shadow: 0 26px 70px rgba(2,6,23,0.8), 0 8px 24px rgba(0,0,0,0.4);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-bg-gradient {
          position: absolute;
          top: -40%;
          right: -30%;
          width: 560px;
          height: 560px;
          background: radial-gradient(circle at 30% 30%, rgba(59,130,246,0.12), transparent 40%),
                      radial-gradient(circle at 80% 80%, rgba(168,85,247,0.08), transparent 40%);
          border-radius: 50%;
          filter: blur(18px);
          transform: translateZ(-1px);
        }

        .card-blur-element {
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle at 20% 70%, rgba(139,92,246,0.08), transparent 45%);
          border-radius: 50%;
          filter: blur(14px);
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #86efac;
          position: relative;
          z-index: 2;
          animation: slideUp 0.4s ease-out;
        }

        .success-icon {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .success-title {
          margin: 0;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .success-text {
          margin: 0.25rem 0 0 0;
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #fca5a5;
          position: relative;
          z-index: 2;
          animation: slideUp 0.4s ease-out;
        }

        .error-icon {
          font-size: 1.5rem;
        }

        .error-title {
          margin: 0;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .error-text {
          margin: 0.25rem 0 0 0;
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .form {
          position: relative;
          z-index: 2;
          background: transparent; /* ensure no white background inside the card */
        }

        .form-group {
          margin-bottom: 1.75rem;
          position: relative;
        }

        .form-label {
          display: block;
          color: #cbd5e1;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .form-input {
          width: 100%;
          background: linear-gradient(180deg, rgba(6,10,20,0.6), rgba(12,18,30,0.6));
          border: 1px solid rgba(99, 102, 241, 0.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 6px 18px rgba(2,6,23,0.45);
          border-radius: 12px;
          padding: 0.9rem 1rem;
          padding-right: 3.8rem; /* more space to fit elevated toggle */
          color: #dbeafe;
          font-size: 0.95rem;
          font-family: inherit;
          transition: box-shadow 0.25s ease, transform 0.18s ease, border-color 0.25s ease;
          outline: none;
          -webkit-appearance: none;
        }

        /* elevated show/hide button placed slightly above the input */
        .password-toggle {
          position: absolute;
          right: 5px;
          top: 48%;
          transform: translateY(0);
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          color: #cbd5e1;
          border: 1px solid rgba(99,102,241,0.12);
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 10px;
          z-index: 3;
          box-shadow: 0 8px 20px rgba(2,6,23,0.45);
        }
        .password-toggle:focus {
          outline: 2px solid rgba(99,102,241,0.20);
        }

        .form-input::placeholder {
          color: #6b7280;
          opacity: 0.9;
        }

        .form-input:focus {
          background: linear-gradient(180deg, rgba(6,10,20,0.9), rgba(12,18,30,0.95));
          border-color: rgba(99, 102, 241, 0.65);
          box-shadow: 0 8px 30px rgba(99,102,241,0.09), inset 0 0 0 1px rgba(99,102,241,0.12);
          transform: translateY(-1px);
        }

        .form-input:hover:not(:focus) {
          border-color: rgba(99, 102, 241, 0.35);
        }

        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5e1' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }

        .form-select option {
          background: #1e293b;
          color: #e2e8f0;
        }

        .input-border {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 0.3s ease;
          border-radius: 1px;
        }

        .form-input:focus ~ .input-border {
          width: 100%;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .submit-button,
        .cancel-button {
          flex: 1;
          padding: 0.95rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: inherit;
        }

        /* 3D neon primary button */
        .submit-button {
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 55%, #60a5fa 100%);
          color: white;
          box-shadow: 0 10px 28px rgba(99,102,241,0.18), 0 2px 6px rgba(2,6,23,0.6);
          transform-origin: center;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-4px) translateZ(6px);
          box-shadow: 0 18px 46px rgba(99,102,241,0.22), 0 6px 20px rgba(2,6,23,0.5);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .cancel-button {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          color: #cbd5e1;
          border: 1px solid rgba(99, 102, 241, 0.12);
          box-shadow: 0 6px 16px rgba(2,6,23,0.45);
        }

        .cancel-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(99, 102, 241, 0.18);
          transform: translateY(-3px);
        }

        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .add-user-content {
            padding: 1.5rem 1rem;
          }

          .form-card {
            padding: 1.75rem;
          }

          .header-text h1 {
            font-size: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .submit-button,
          .cancel-button {
            width: 100%;
          }
+          .form-card { transform: none !important; }
        }
      `}</style>
    </div>
  )
}
