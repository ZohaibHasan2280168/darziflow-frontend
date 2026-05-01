import { useNavigate } from "react-router-dom"

export default function RoleSelection() {
  const navigate = useNavigate()

  return (
    <div className="role-selection-wrapper">
      <div className="container animated-gradient-border">
        <div className="text-center mb-12">
          <div className="logo-badge mb-6">DarziFlow</div>
          <h1 className="main-title mb-3">Welcome to DarziFlow</h1>
          <p className="subtitle">Choose your role to get started</p>
        </div>

        <div className="button-container">
          <button onClick={() => navigate("/moderator-login")} className="role-button">
            <div className="button-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="button-content">
              <h3 className="button-title">Moderator</h3>
            </div>
            <div className="button-arrow">→</div>
          </button>

          <button onClick={() => navigate("/admin-signup")} className="role-button">
            <div className="button-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className="button-content">
              <h3 className="button-title">Admin</h3>
            </div>
            <div className="button-arrow">→</div>
          </button>
        </div>
      </div>

      <style jsx>{`
        .role-selection-wrapper {
          min-height: 100vh; display: flex; justify-content: center; align-items: center;
          background: var(--body-bg); padding: 20px;
        }
        .container {
          max-width: 500px; width: 100%; border-radius: 24px; padding: 48px 40px;
          text-align: center; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
        }
        .logo-badge {
          display: inline-block; background: var(--accent-gradient);
          color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600;
        }
        .main-title {
          font-size: 2.5rem; font-weight: 800; background: var(--accent-gradient);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .subtitle { color: var(--text-secondary); }
        .button-container { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }
        .role-button {
          display: flex; align-items: center; gap: 16px; padding: 16px 24px;
          background: var(--input-bg); border: 1px solid var(--border-light);
          border-radius: 16px; cursor: pointer; transition: 0.3s ease;
        }
        .role-button:hover { transform: translateY(-3px); border-color: #667eea; }
        .button-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: var(--accent-gradient); color: white;
          display: flex; align-items: center; justify-content: center;
        }
        .button-title { color: var(--text-primary); margin: 0; font-size: 1.1rem; }
        .button-arrow { color: var(--text-muted); font-size: 1.2rem; margin-left: auto; }
      `}</style>
    </div>
  )
}