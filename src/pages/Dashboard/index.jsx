"use client"

import { useState, useEffect } from "react"
import Navbar from "../../components/layout/Navbar"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API_URL = "https://darziflow-backend.onrender.com/api"

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken")
  const parsedData = storedData ? JSON.parse(storedData) : null
  return parsedData?.accessToken
}

export default function Dashboard() {
  const [stats, setStats] = useState([
    { name: "Admin", value: 0 },
    { name: "Supervisor", value: 0 },
    { name: "QA", value: 0 },
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hoveredRole, setHoveredRole] = useState(null)

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899"]
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = getToken()
        if (!token) {
          setError("No access token found. Please login again.")
          setLoading(false)
          return
        }

        const res = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.status === 200) {
          const { stats: userStats } = res.data
          const validRoles = ["ADMIN", "SUPERVISOR", "QA"]

          const roleCounts = {
            Admin: 0,
            Supervisor: 0,
            QA: 0,
          }

          if (userStats && userStats.roles) {
            Object.entries(userStats.roles).forEach(([role, count]) => {
              if (validRoles.includes(role)) {
                const mappedRole = role === "ADMIN" ? "Admin" : role === "SUPERVISOR" ? "Supervisor" : "QA"
                roleCounts[mappedRole] += count
              }
            })
          }

          setStats([
            { name: "Admin", value: roleCounts.Admin },
            { name: "Supervisor", value: roleCounts.Supervisor },
            { name: "QA", value: roleCounts.QA },
          ])
        } else {
          throw new Error(res.data?.message || "Failed to fetch user statistics")
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch user statistics")
        console.error("Error fetching user stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [])

  const handlePieClick = (data, index) => {
    if (data && data.name) {
      navigate(`/role/${data.name.toLowerCase()}`)
    }
  }

  const handleRoleOptionClick = (roleName) => {
    navigate(`/role/${roleName.toLowerCase()}`)
  }

  const totalUsers = stats.reduce((sum, stat) => sum + stat.value, 0)

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-content">
          <div className="loading-card">
            <div className="spinner"></div>
            <p>Loading user statistics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        {/* Main Stats Card */}
        <div className="stats-card">
          {/* Background animation elements */}
          <div className="card-bg-gradient"></div>
          <div className="card-blur-element"></div>

          <div className="stats-header">
            <div className="header-content">
              <h1 className="stats-title">Team Overview</h1>
              <p className="stats-subtitle">Real-time user distribution by role</p>
            </div>
            <div className="total-badge">
              <span className="badge-label">Total Users</span>
              <span className="badge-value">{totalUsers}</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Pie Chart Section */}
          <div className="chart-container">
            <div className="chart-wrapper">
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie
                    data={stats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={40}
                    paddingAngle={6}
                    startAngle={30}
                    endAngle={390}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={2}
                    onClick={handlePieClick}
                  >
                    {stats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{
                          filter: "drop-shadow(0 4px 12px rgba(99, 102, 241, 0.2))",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Section */}
          <div className="legend-container">
            {stats.map((stat, idx) => (
              <div
                key={stat.name}
                className={`legend-item ${hoveredRole === stat.name ? "active" : ""}`}
                onMouseEnter={() => setHoveredRole(stat.name)}
                onMouseLeave={() => setHoveredRole(null)}
                onClick={() => handleRoleOptionClick(stat.name)}
              >
                <div className="legend-color" style={{ background: COLORS[idx] }}></div>
                <div className="legend-info">
                  <span className="legend-name">{stat.name}</span>
                  <span className="legend-value">{stat.value} users</span>
                </div>
                <div className="legend-percentage">
                  {totalUsers > 0 ? Math.round((stat.value / totalUsers) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={stat.name} className="stat-mini-card" style={{ "--card-delay": `${idx * 0.1}s` }}>
              <div className="mini-card-icon" style={{ background: COLORS[idx] }}>
                {stat.name === "Admin" && "👤"}
                {stat.name === "Supervisor" && "📋"}
                {stat.name === "QA" && "✓"}
              </div>
              <div className="mini-card-content">
                <p className="mini-card-label">{stat.name}</p>
                <p className="mini-card-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          position: relative;
          overflow-x: hidden;
        }

        .dashboard-container::before {
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

        .dashboard-content {
          position: relative;
          z-index: 1;
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          gap: 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: #e2e8f0;
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

        .stats-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          animation: slideUp 0.6s ease-out;
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
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }

        .card-blur-element {
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite reverse;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 2;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          margin-bottom: 0.5rem;
        }

        .stats-subtitle {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
        }

        .total-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 16px;
          padding: 0.75rem 1.25rem;
          backdrop-filter: blur(10px);
        }

        .badge-label {
          font-size: 0.8rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .badge-value {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
        }

        .error-message span {
          font-size: 1.5rem;
        }

        .chart-container {
          display: flex;
          justify-content: center;
          margin: 1.5rem 0;
          position: relative;
          z-index: 2;
        }

        .chart-wrapper {
          perspective: 1000px;
          animation: chartFloat 3s ease-in-out infinite;
        }

        @keyframes chartFloat {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-10px) rotateX(5deg); }
        }

        .legend-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
          margin-top: 1.5rem;
          position: relative;
          z-index: 2;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .legend-item:hover,
        .legend-item.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 0 12px currentColor;
          flex-shrink: 0;
        }

        .legend-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .legend-name {
          color: #e2e8f0;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .legend-value {
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .legend-percentage {
          color: #6366f1;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .stat-mini-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: slideUp 0.6s ease-out;
          animation-delay: var(--card-delay);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-mini-card:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.2);
        }

        .mini-card-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }

        .mini-card-content {
          flex: 1;
        }

        .mini-card-label {
          color: #94a3b8;
          font-size: 0.8rem;
          margin: 0;
          font-weight: 500;
        }

        .mini-card-value {
          color: #e2e8f0;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.25rem 0 0 0;
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1rem;
          }

          .stats-card {
            padding: 1.25rem;
          }

          .stats-header {
            flex-direction: column;
            gap: 1rem;
          }

          .header-content h1 {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .legend-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
