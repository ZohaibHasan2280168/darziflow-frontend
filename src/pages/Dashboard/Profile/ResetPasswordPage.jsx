"use client";

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, SendHorizonal } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Reset failed.");

      setSuccess("Password successfully reset! Redirecting...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-bg min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Centered card */}
      <div className="forgot-card">
        <div className="header">
          <div className="logo-circle">
            <Lock size={28} />
          </div>
          <h1 className="title">Reset Password</h1>
          <p className="subtitle">Enter your new password below.</p>
        </div>

        <div className="form-wrapper">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="animated-input"
                  required
                />
                <div className="input-underline"></div>
                <button
                  type="button"
                  className="input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="animated-input"
                  required
                />
                <div className="input-underline"></div>
                <button
                  type="button"
                  className="input-icon"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`submit-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Resetting..." : <><SendHorizonal size={18} /> Reset Password</>}
            </button>

            <div className="forgot-password-wrapper text-center">
              <Link to="/login" className="forgot-password-link">Back to Login</Link>
            </div>
          </form>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .forgot-bg {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 50%, #667eea 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          position: relative;
        }
        .forgot-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.5) inset;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
        }
        .header { text-align:center; margin-bottom:32px; }
        .logo-circle {
          width:64px; height:64px;
          background:linear-gradient(135deg,#667eea,#764ba2);
          border-radius:50%; display:flex; align-items:center; justify-content:center;
          color:white; margin:0 auto 16px; box-shadow:0 8px 24px rgba(102,126,234,0.4);
        }
        .title { font-size:28px; font-weight:800; margin-bottom:8px; background:linear-gradient(135deg,#667eea,#764ba2); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .subtitle { font-size:14px; color:#6b7280; margin:0; font-weight:500; }

        .space-y-6 { display:flex; flex-direction:column; gap:24px; }
        .input-group { position: relative; }
        .input-wrapper { position: relative; display:flex; align-items:center; }
        .animated-input {
          width:100%; padding:14px 16px 14px 44px;
          border:2px solid #e5e7eb; border-radius:12px;
          font-size:16px; font-weight:500; color:#1f2937; background:#f9fafb; outline:none;
          transition: all 0.3s ease;
        }
        .animated-input:focus { border-color:#667eea; background:white; transform:translateY(-1px); box-shadow:0 0 0 3px rgba(102,126,234,0.1), 0 8px 16px rgba(102,126,234,0.15); }
        .input-underline { position:absolute; bottom:0; left:0; height:2px; width:0; background:linear-gradient(90deg,#667eea,#764ba2); border-radius:2px; transition:width 0.3s ease; }
        .animated-input:focus ~ .input-underline { width:100%; }
        .input-icon { position:absolute; right:12px; color:#9ca3af; display:flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; }

        .submit-button {
          width:100%; padding:14px 24px; background:linear-gradient(135deg,#667eea,#764ba2);
          color:white; border:none; border-radius:12px; font-size:16px; font-weight:700; cursor:pointer;
          transition: all 0.3s ease; display:flex; justify-content:center; align-items:center; gap:8px;
        }
        .submit-button:disabled { opacity:0.7; cursor:not-allowed; }
        .forgot-password-wrapper { margin-top:12px; }
        .forgot-password-link { color:#764ba2; font-size:14px; font-weight:600; text-decoration:none; }
        .forgot-password-link:hover { color:#667eea; }

        .error-message { background:#fee2e2; color:#991b1b; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; border-left:4px solid #dc2626; }
        .success-message { background:#d1fae5; color:#065f46; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; border-left:4px solid #10b981; }

        .floating-orb { position:absolute; border-radius:50%; opacity:0.1; filter:blur(40px); }
        .orb-1 { width:300px; height:300px; background:rgba(255,255,255,0.5); top:-100px; right:-100px; animation:float 8s ease-in-out infinite; }
        .orb-2 { width:200px; height:200px; background:rgba(255,255,255,0.3); bottom:-50px; left:-50px; animation:float 10s ease-in-out infinite reverse; }
        .orb-3 { width:250px; height:250px; background:rgba(255,255,255,0.2); top:50%; left:10%; animation:float 12s ease-in-out infinite; }

        @keyframes float { 0%,100%{transform:translate(0,0);}50%{transform:translate(30px,30px);} }

        @media (max-width:640px){ .forgot-card{padding:32px 24px;} .title{font-size:24px;} .logo-circle{width:56px;height:56px;} }
      `}</style>
    </div>
  );
}
