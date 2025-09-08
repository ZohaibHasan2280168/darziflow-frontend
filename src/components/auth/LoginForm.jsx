import { useState } from 'react';

export default function LoginForm({ onSubmit }) {
  const [credentials, setCredentials] = useState({
    workEmail: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="workEmail"
            name="workEmail"
            type="email"
            autoComplete="email"
            required
            className="input"
            placeholder="Email address"
            value={credentials.workEmail}
            onChange={handleChange}
          />
        </div>
        <div style={{ position: "relative" }}>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="input"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            style={{ paddingRight: "36px" }}
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer"
            }}
          >
            {showPassword ? (
              // Eye Open SVG
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            ) : (
              // Eye Closed SVG
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.07 21.07 0 0 1 5.06-7.06"/>
                <path d="M1 1l22 22"/>
                <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/>
              </svg>
            )}
          </span>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Login
        </button>
      </div>
    </form>
  );
}