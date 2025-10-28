"use client"

import { useEffect, useState } from "react"
import Navbar from "../../components/layout/Navbar"
import { Link } from "react-router-dom"

const API_URL = "https://darziflow-backend.onrender.com/api"

const getToken = () => {
  const stored = localStorage.getItem("useraccesstoken")
  const parsed = stored ? JSON.parse(stored) : null
  return parsed?.accessToken
}

const roleColors = {
  Moderator: { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" },
  Admin: { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80", border: "rgba(34, 197, 94, 0.3)" },
  QA: { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15", border: "rgba(234, 179, 8, 0.3)" },
  SUPERVISOR: { bg: "rgba(168, 85, 247, 0.15)", text: "#d8b4fe", border: "rgba(168, 85, 247, 0.3)" },
  QC_OFFICER: { bg: "rgba(239, 68, 68, 0.15)", text: "#fca5a5", border: "rgba(239, 68, 68, 0.3)" },
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getToken()
        if (!token) {
          setError("No access token found. Please login again.")
          setLoading(false)
          return
        }

        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await res.json()
        setUsers(data.users || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="users-container">
      <Navbar />
      <div className="users-content">
        {/* Header Section */}
        <div className="users-header">
          <div className="header-content">
            <h1 className="header-title">User Management</h1>
            <p className="header-subtitle">View and manage all system users</p>
          </div>
          <Link to="/dashboard" className="back-button">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Users Table Card */}
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
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <tr key={user._id || idx} className={idx % 2 === 0 ? "even-row" : "odd-row"}>
                        <td className="name-cell">
                          <span className="user-name">{user.name}</span>
                        </td>
                        <td className="email-cell">
                          <span className="user-email">{user.workEmail}</span>
                        </td>
                        <td className="role-cell">
                          <span
                            className="role-badge"
                            style={{
                              background: roleColors[user.role]?.bg || roleColors.Moderator.bg,
                              color: roleColors[user.role]?.text || roleColors.Moderator.text,
                              borderColor: roleColors[user.role]?.border || roleColors.Moderator.border,
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="empty-state">
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

      <style jsx>{`
        .users-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          position: relative;
          overflow-x: hidden;
        }

        .users-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .users-content {
          position: relative;
          z-index: 1;
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
          animation: slideUp 0.6s ease-out;
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
        }

        .header-subtitle {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 12px;
          color: #e2e8f0;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .back-button:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
        }

        .users-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          animation: slideUp 0.6s ease-out 0.1s both;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
          top: -50%;
          right: -50%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
        }

        .card-blur-element {
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
          position: relative;
          z-index: 2;
        }

        .error-state {
          color: #fca5a5;
          gap: 0.5rem;
        }

        .error-state span {
          font-size: 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(99, 102, 241, 0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .table-wrapper {
          overflow-x: auto;
          position: relative;
          z-index: 2;
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
          text-align: left;
          color: #e2e8f0;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .users-table tbody tr {
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
          transition: all 0.3s ease;
        }

        .users-table tbody tr.even-row {
          background: rgba(255, 255, 255, 0.02);
        }

        .users-table tbody tr.odd-row {
          background: rgba(99, 102, 241, 0.05);
        }

        .users-table tbody tr:hover {
          background: rgba(99, 102, 241, 0.1);
          box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.1);
        }

        .users-table td {
          padding: 1rem;
          color: #cbd5e1;
          font-size: 0.95rem;
        }

        .name-cell {
          font-weight: 500;
        }

        .user-name {
          color: #e2e8f0;
          font-weight: 600;
        }

        .user-email {
          color: #94a3b8;
        }

        .role-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          border: 1px solid;
          transition: all 0.3s ease;
          cursor: default;
        }

        .role-badge:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem !important;
          color: #94a3b8;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .users-content {
            padding: 1rem;
          }

          .users-card {
            padding: 1.25rem;
          }

          .users-header {
            flex-direction: column;
            gap: 1rem;
          }

          .header-content h1 {
            font-size: 1.5rem;
          }

          .table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .users-table th,
          .users-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.85rem;
          }

          .users-table th {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}
