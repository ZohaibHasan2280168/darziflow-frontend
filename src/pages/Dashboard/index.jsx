"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/layout/Navbar";
import RolePieChart from "../../components/charts/RolePieChart";
import { useAuth } from "../../components/context/AuthContext";

const API_URL = "http://localhost:5000/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    const storedData = localStorage.getItem("useraccesstoken");
    const parsedData = storedData ? JSON.parse(storedData) : null;
    return parsedData?.accessToken;
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("No access token found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          const { stats: userStats } = res.data;
          const dynamicStats = [];

          // Count all roles dynamically
          if (userStats?.roles) {
            Object.entries(userStats.roles).forEach(([role, count]) => {
              if (count > 0) {
                let displayName = role
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase()); // Format name
                dynamicStats.push({ name: displayName, value: count });
              }
            });
          }

          setStats(dynamicStats);
        } else {
          throw new Error(res.data?.message || "Failed to fetch stats");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const totalUsers = stats.reduce((sum, s) => sum + s.value, 0);

  const handleRoleOptionClick = (roleName) => {
    navigate(`/role/${roleName.toLowerCase()}`);
  };

  if (!user) return <p>Loading...</p>;
  if (loading) return <div className="dashboard-loading">Loading stats...</div>;

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <div className="stats-card">
          <div className="stats-header">
            <h1>Team Overview</h1>
            <div>Total Users: {totalUsers}</div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <RolePieChart data={stats} />

          <div className="legend-container">
            {stats.map((stat, idx) => (
              <div
                key={stat.name}
                className="legend-item"
                onClick={() => handleRoleOptionClick(stat.name)}
              >
                <div
                  className="legend-color"
                  style={{ backgroundColor: RolePieChart.DEFAULT_COLORS?.[idx] || "#888" }}
                ></div>
                <div>
                  {stat.name} - {stat.value} (
                  {totalUsers > 0 ? Math.round((stat.value / totalUsers) * 100) : 0}%)
                </div>
              </div>
            ))}
          </div>

          {user.role === "ADMIN" && (
            <div className="admin-actions" style={{ marginTop: "1.5rem" }}>
              <button onClick={() => navigate("/add-user")}>Add User</button>
              <button onClick={() => navigate("/users")}>All Users</button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #0f172a;
          color: #fff;
        }
        .dashboard-content {
          max-width: 1200px;
          margin: auto;
          padding: 2rem;
        }
        .stats-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
        }
        .legend-container {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }
        .legend-item {
          cursor: pointer;
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }
        .admin-actions button {
          margin-right: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          background-color: #6366f1;
          color: white;
        }
        .admin-actions button:hover {
          background-color: #8b5cf6;
        }
      `}</style>
    </div>
  );
}
