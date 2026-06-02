import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/reqInterceptor";
import { useAlert } from '../../../components/ui/AlertProvider';


export default function UpdateUser() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  // Custom dropdown state for Role (so theme + behavior match other pages)
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        

        const res = await api.get(`/users/${id}`);
        const user = res.data.user;
        console.log("fetched user", user);

        if (user) {
          setForm({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "",
          });
        } else {
          throw new Error(res.data?.message || "Failed to fetch user data");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [id]);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const roles = [
    { label: 'Moderator', value: 'MODERATOR' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Department Head', value: 'DEPARTMENT_HEAD' },
    { label: 'QC Member', value: 'QC_MEMBER' },
    { label: 'Client', value: 'CLIENT' }
  ];

  const handleRoleSelect = (value) => {
    setForm((p) => ({ ...p, role: value }));
    setIsRoleOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.put(`/users/${id}`, { name: form.name, email: form.email, role: form.role });

      if (res.status === 200) {
        showAlert({ title: 'Success', message: 'User updated successfully!', type: 'success' });
        navigate(-1);
      } else {
        throw new Error(res.data?.message || "Failed to update user");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="update-loading">
        <p>Loading user data...</p>
        <style jsx>{`
          .update-loading {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a);
            color: #fff;
            font-size: 1.2rem;
            letter-spacing: 0.5px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="update-container">
      <div className="update-card">
        <h1 className="update-title">Update User</h1>
        <p className="update-subtitle">Modify user details below</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="update-form">
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Role</label>
            <div className="custom-dropdown" ref={roleDropdownRef}>
              <button
                type="button"
                className={`dropdown-trigger ${!form.role ? 'placeholder' : ''}`}
                onClick={() => setIsRoleOpen((s) => !s)}
              >
                <span>{roles.find(r => r.value === form.role)?.label || 'Select Role'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </button>

              {isRoleOpen && (
                <div className="dropdown-popover">
                  <div className="dropdown-options">
                    {roles.map(r => (
                      <div key={r.value} className={`dropdown-option ${form.role === r.value ? 'selected' : ''}`} onClick={() => handleRoleSelect(r.value)}>
                        <span className="option-text">{r.label}</span>
                        {form.role === r.value && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="update-btn" disabled={loading}>
            {loading ? "Updating..." : "Update User"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </form>
      </div>

      <style jsx>{`
        .update-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--main-bg);
          padding: 1rem;
        }

        .update-card {
          background: var(--card-bg);
          backdrop-filter: blur(10px) saturate(120%);
          border: 1px solid var(--border-light);
          padding: 2.5rem;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          color: var(--text-primary);
          box-shadow: var(--card-shadow);
        }

        .update-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .update-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .update-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .input-group label {
          margin-bottom: 0.4rem;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
        }

        .input-group input {
          background: var(--input-bg);
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          border-radius: 10px;
          padding: 0.75rem;
          font-size: 0.95rem;
          outline: none;
          transition: 0.3s ease;
        }

        .input-group input:focus {
          border-color: rgba(59,130,246,0.6);
          box-shadow: 0 0 8px rgba(59,130,246,0.12);
        }

        /* Custom dropdown styles */
        .custom-dropdown { position: relative; }

        .dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          background: var(--input-bg);
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          cursor: pointer;
        }

        .dropdown-trigger.placeholder { color: var(--text-secondary); }

        .dropdown-popover {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          background: var(--card-bg);
          border: 1px solid var(--border-light);
          border-radius: 10px;
          box-shadow: var(--card-shadow);
          z-index: 60;
          overflow: hidden;
        }

        .dropdown-options { max-height: 200px; overflow-y: auto; }

        .dropdown-option {
          padding: 0.6rem 0.9rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-primary);
        }

        .dropdown-option:hover { background: var(--card-hover-bg); }

        .dropdown-option.selected { background: rgba(59,130,246,0.08); }

        .update-btn {
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          border: none;
          padding: 0.8rem;
          border-radius: 12px;
          font-weight: 600;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .update-btn:hover { transform: translateY(-2px); }

        .cancel-btn {
          margin-top: 0.5rem;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          padding: 0.8rem;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .cancel-btn:hover { background: var(--card-hover-bg); }

        .error-text { color: #f87171; margin-bottom: 1rem; font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
