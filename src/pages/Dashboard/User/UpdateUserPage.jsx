import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/reqInterceptor";
import { useAlert } from '../../../components/ui/AlertProvider';


export default function UpdateUser() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
              <option value="DEPARTMENT_HEAD">Department Head</option>
              <option value="QC_MEMBER">QC Member</option>
              <option value="CLIENT">Client</option>
            </select>
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
          background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a);
          background-size: 200% 200%;
          animation: gradientMove 8s ease infinite;
          padding: 1rem;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .update-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2.5rem;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          color: #f8fafc;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .update-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .update-subtitle {
          color: #cbd5e1;
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
          color: #e2e8f0;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .input-group input,
        .input-group select {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #f1f5f9;
          border-radius: 10px;
          padding: 0.75rem;
          font-size: 0.95rem;
          outline: none;
          transition: 0.3s ease;
        }

        .input-group input:focus,
        .input-group select:focus {
          border-color: #818cf8;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
        }

        .update-btn {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border: none;
          padding: 0.8rem;
          border-radius: 12px;
          font-weight: 600;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .update-btn:hover {
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          transform: translateY(-2px);
        }

        .cancel-btn {
          margin-top: 0.5rem;
          background: transparent;
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0.8rem;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .error-text {
          color: #fca5a5;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
