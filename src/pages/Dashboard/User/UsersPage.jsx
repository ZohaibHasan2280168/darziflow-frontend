"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from '../../../components/ui/AlertProvider';
import api from "../../../services/reqInterceptor";

const roleColors = {
  MODERATOR: { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" },
  ADMIN: { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80", border: "rgba(34, 197, 94, 0.3)" },
  DEPARTMENT_HEAD: { bg: "rgba(168, 85, 247, 0.15)", text: "#d8b4fe", border: "rgba(168, 85, 247, 0.3)" },
  QC_MEMBER: { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15", border: "rgba(234, 179, 8, 0.3)" },
  CLIENT: { bg: "rgba(239, 68, 68, 0.15)", text: "#fca5a5", border: "rgba(239, 68, 68, 0.3)" },
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await api.get("/users");

    setUsers(res.data.users || []);
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch users";

    setError(message);
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {

      const res = await api.delete(`/users/${id}`);
      if (!res.ok) throw new Error("Failed to delete user");
      showAlert({ title: 'Success', message: 'User deleted successfully', type: 'success' });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      showAlert({ title: 'Error', message: err.message || "Failed to delete user", type: 'error' });
    }
  };

  return (
    <div className="users-container">
      <Navbar />
      <div className="users-content">
        <div className="users-header">
          <div className="header-content">
            <h1 className="header-title">User Management</h1>
            <p className="header-subtitle">View, edit, or remove users</p>
          </div>
          <div className="header-actions">
            <Link to="/add-user" className="add-button">
              Add User
            </Link>
          </div>
        </div>

        <div className="users-card">
          <div className="card-bg-gradient"></div>
          <div className="card-blur-element"></div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <tr key={user._id || idx} className={idx % 2 === 0 ? "even-row" : "odd-row"}>
                        <td className="name-cell">{user.name}</td>
                        <td className="email-cell">{user.email}</td>
                        <td className="role-cell">
                          <span
                            className="role-badge"
                            style={{
                              background: roleColors[user.role]?.bg || "#1e293b",
                              color: roleColors[user.role]?.text || "#e2e8f0",
                              borderColor: roleColors[user.role]?.border || "rgba(99,102,241,0.3)",
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button
                            className="edit-btn"
                            onClick={() => navigate(`/update-user/${user._id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inline Styling */}
      <style jsx>{`
        .users-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          overflow-x: hidden;
        }

        .users-content {
          position: relative;
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .header-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .back-button {
          padding: 0.75rem 1.25rem;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 12px;
          color: #e2e8f0;
          text-decoration: none;
          transition: 0.3s ease;
        }

        .back-button:hover {
          background: rgba(99, 102, 241, 0.3);
          transform: translateY(-2px);
        }

        .header-actions { display: flex; gap: 0.75rem; align-items: center; }

        .add-button {
          padding: 0.75rem 1.25rem;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 12px;
          color: #e2e8f0;
          text-decoration: none;
          font-weight: 600;
          transition: 0.25s ease;
        }
        .add-button:hover { background: rgba(34,197,94,0.25); transform: translateY(-2px); }

        .users-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .card-bg-gradient {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
          border-radius: 50%;
        }

        .card-blur-element {
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent 70%);
          border-radius: 50%;
        }

        .table-wrapper {
          overflow-x: auto;
          position: relative;
          z-index: 1;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table thead tr {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
          border-bottom: 2px solid rgba(99, 102, 241, 0.3);
        }

        .users-table th {
          padding: 1rem;
          color: #e2e8f0;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .users-table td {
          padding: 1rem;
          color: #cbd5e1;
        }

        .even-row {
          background: rgba(255, 255, 255, 0.02);
        }

        .odd-row {
          background: rgba(99, 102, 241, 0.05);
        }

        .users-table tr:hover {
          background: rgba(99, 102, 241, 0.1);
          box-shadow: inset 0 0 15px rgba(99, 102, 241, 0.1);
        }

        .role-badge {
          display: inline-block;
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          font-weight: 600;
          border: 1px solid;
          transition: all 0.3s ease;
        }

        .role-badge:hover {
          transform: scale(1.05);
        }

        .action-cell {
          display: flex;
          gap: 0.75rem;
        }

        .edit-btn,
        .delete-btn {
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: 0.3s ease;
        }

        .edit-btn {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
}
