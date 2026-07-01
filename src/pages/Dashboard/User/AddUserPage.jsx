"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../../services/reqInterceptor";

export default function AddUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  // Custom Dropdown State
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [roleSearch, setRoleSearch] = useState("")
  const roleDropdownRef = useRef(null)

  const navigate = useNavigate()

  const roles = [
    { label: "Moderator", value: "Moderator" },
    { label: "Admin", value: "ADMIN" },
    { label: "QC Member", value: "QC_MEMBER" }
  ];

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleRoleSelect = (roleValue) => {
    setForm((prev) => ({ ...prev, role: roleValue }));
    setIsRoleOpen(false);
    setRoleSearch("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Manual validation for custom dropdown
    if (!form.role) {
      setError("Please select a role.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { name, email, role } = form;

      const res = await api.post("/users/create", { name, email, role });

      if (res.status === 201) {
        setSuccess(true);
        setForm({ name: "", email: "", role: "" });

        if (res.data.tempPassword) {
          alert(`Temporary password for user: ${res.data.tempPassword}`);
        }

        setTimeout(() => navigate(-1), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-container">
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
          {/* Backgrounds moved to a wrapper to prevent overflowing card content from being clipped */}
          <div className="card-backgrounds">
            <div className="card-bg-gradient"></div>
            <div className="card-blur-element"></div>
          </div>

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
              <label htmlFor="name" className="form-label">Full Name</label>
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

            {/* Role Field - Custom Dropdown */}
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="custom-dropdown-container" ref={roleDropdownRef}>
                <button
                  type="button"
                  className={`dropdown-trigger ${!form.role ? 'placeholder' : ''}`}
                  onClick={() => setIsRoleOpen(!isRoleOpen)}
                >
                  <span>{roles.find(r => r.value === form.role)?.label || "Select a role"}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </button>

                {isRoleOpen && (
                  <div className="dropdown-popover">
                    
                    <div className="dropdown-options">
                      {roles
                        .filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase()))
                        .map(role => (
                          <div
                            key={role.value}
                            className={`dropdown-option ${form.role === role.value ? 'selected' : ''}`}
                            onClick={() => handleRoleSelect(role.value)}
                          >
                            <span className="option-text">{role.label}</span>
                            {form.role === role.value && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        ))}
                      {roles.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase())).length === 0 && (
                        <div className="dropdown-no-results">No roles found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 0rem;
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
          display: flex;
          justify-content: center;
          align-items: center;
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
          text-align: center;
          margin-bottom: 1rem;
          animation: slideUp 0.6s ease-out;
        }

        .form-header h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(90deg, #a5f3fc, #c4b5fd, #7dd3fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.35rem 0;
        }

        .header-text h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          -webkit-text-stroke: 1px var(--text-primary);
          text-shadow: 
            -1px -1px 0 var(--body-bg),  
             1px -1px 0 var(--body-bg),
            -1px  1px 0 var(--body-bg),
             1px  1px 0 var(--body-bg);
          margin: 0 0 0.35rem 0;
        }

        .form-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0 0 0.75rem 0;
        }

        /* Card styles updated to allow dropdown to break out */
        .form-card {
          background: linear-gradient(135deg, #071022 0%, #0f172a 45%);
          backdrop-filter: blur(10px) saturate(120%);
          border: 1px solid rgba(255,255,255,0.03);
          color: #e6eef8;
          border-radius: 18px;
          width: 100%;
          max-width: 100%;
          padding: 2.25rem;
          position: relative;
          /* overflow: hidden; REMOVED to allow dropdown to show */
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
        
        /* New wrapper to contain only the decorative backgrounds */
        .card-backgrounds {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 18px;
          overflow: hidden;
          z-index: 0;
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
          background: transparent;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .form-input {
          width: 100%;
          border-radius: 12px;
          padding: 0.9rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent; 
          color: #ffffff;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: background 0.25s ease, box-shadow 0.25s ease, color 0.25s ease;
        }

        .form-input:focus {
          background: rgba(12,18,30,0.95);
          border-color: rgba(96, 165, 250, 0.5);
        }

        /* --- Custom Dropdown UI --- */
        .custom-dropdown-container {
          position: relative;
          width: 100%;
        }

        .dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          border-radius: 12px;
          padding: 0.9rem 1rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          cursor: pointer;
          transition: background 0.25s ease, border-color 0.25s ease;
        }

        .dropdown-trigger:focus, .dropdown-trigger:hover {
          background: rgba(12,18,30,0.95);
        }

        .dropdown-trigger.placeholder {
          color: #94a3b8;
        }

        .dropdown-popover {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          z-index: 50;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .dropdown-search-wrapper {
          padding: 0.5rem 1rem; /* Reduced padding */
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .dropdown-search-wrapper input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 0.9rem;
          color: #ffffff;
          background: transparent;
        }

        .dropdown-search-wrapper input::placeholder {
          color: #94a3b8;
        }

        .dropdown-options {
          max-height: 200px;
          overflow-y: auto;
          padding: 0.25rem 0;
        }

        .dropdown-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem; /* Reduced padding */
          cursor: pointer;
          transition: background 0.2s ease;
          color: #cbd5e1;
        }

        .dropdown-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-option.selected {
          background: rgba(96, 165, 250, 0.15);
          color: #ffffff;
          font-weight: 500;
        }

        .dropdown-no-results {
          padding: 0.75rem;
          text-align: center;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .form-group {
          margin-bottom: 0.75rem;
          position: relative;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.85rem;
          color: #e6eef8;
        }

        .cancel-button {
          flex: 1;
          padding: 0.95rem 1.75rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          color: #cbd5e1;
          border: 1px solid rgba(99, 102, 241, 0.12);
          box-shadow: 0 6px 16px rgba(2,6,23,0.45);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-button:hover:not(:disabled) {
          background: linear-gradient(90deg, #f87171 55%, #fca5a5 100%);
          border-color: rgba(239, 68, 68, 0.5);
          color: white;
          transform: translateY(-3px);
        }

        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.95rem 1.75rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 55%, #60a5fa 100%);
          color: #fff;
          border: none;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
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

        @media (max-width: 640px) {
          .add-user-content {
            padding: 1.5rem 1rem;
          }

          .form-card {
            padding: 1.75rem;
            transform: none !important;
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
        }
        /* Light mode overrides: ensure page, card and dropdown become light and text turns dark */
        html.light .add-user-container,
        body.light .add-user-container,
        :root.light .add-user-container {
          background: var(--body-bg) !important;
          color: var(--text-primary) !important;
        }

        html.light .form-card,
        body.light .form-card,
        :root.light .form-card {
          background: var(--card-bg) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-light) !important;
          box-shadow: var(--card-shadow) !important;
        }

        /* Dropdown and options in light mode */
        html.light .dropdown-trigger,
        body.light .dropdown-trigger,
        :root.light .dropdown-trigger {
          background: var(--input-bg) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-light) !important;
        }

        html.light .dropdown-popover,
        body.light .dropdown-popover,
        :root.light .dropdown-popover {
          background: var(--card-bg) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-light) !important;
        }

        html.light .dropdown-option,
        body.light .dropdown-option,
        :root.light .dropdown-option {
          color: var(--text-primary) !important;
        }

        html.light .dropdown-option:hover,
        body.light .dropdown-option:hover,
        :root.light .dropdown-option:hover {
          background: var(--card-hover-bg) !important;
        }
      `}</style>
    </div>
  )
}