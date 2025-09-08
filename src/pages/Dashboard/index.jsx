// src/pages/Dashboard/index.jsx
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = "https://darziflow-backend.onrender.com/api";

// Get token from localStorage
const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  return parsedData?.accessToken;
};

export default function Dashboard() {
  const [stats, setStats] = useState([
    { name: 'Admin', value: 0 },
    { name: 'Supervisor', value: 0 },
    { name: 'QA', value: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#2563eb', '#38bdf8', '#fbbf24'];
  const navigate = useNavigate();

  // Fetch user statistics from backend
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("No access token found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${API_URL}/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 200) {
          const { stats: userStats } = res.data;
          
          // Only count these specific roles, ignore MODERATOR
          const validRoles = ['ADMIN', 'SUPERVISOR', 'QA'];
          
          // Initialize counts
          const roleCounts = {
            'Admin': 0,
            'Supervisor': 0,
            'QA': 0
          };

          // Count only valid roles from backend data
          if (userStats && userStats.roles) {
            Object.entries(userStats.roles).forEach(([role, count]) => {
              if (validRoles.includes(role)) {
                const mappedRole = role === 'ADMIN' ? 'Admin' : 
                                 role === 'SUPERVISOR' ? 'Supervisor' : 'QA';
                roleCounts[mappedRole] += count;
              }
              // MODERATOR role is intentionally ignored
            });
          }

          // Update stats state
          setStats([
            { name: 'Admin', value: roleCounts.Admin },
            { name: 'Supervisor', value: roleCounts.Supervisor },
            { name: 'QA', value: roleCounts.QA },
          ]);
        } else {
          throw new Error(res.data?.message || "Failed to fetch user statistics");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch user statistics");
        console.error("Error fetching user stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  // Pie section click handler
  const handlePieClick = (data, index) => {
    if (data && data.name) {
      navigate(`/role/${data.name.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div
          className="rounded-2xl shadow-2xl border border-blue-100 w-full max-w-xl flex flex-col items-center mx-auto mt-16"
          style={{
            minHeight: '540px',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18), 0 1.5px 8px 0 rgba(59,130,246,0.10)',
            padding: '2.5rem 1.5rem',
            border: '1.5px solid rgba(59,130,246,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="text-blue-600">Loading user statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div
        className="rounded-2xl shadow-2xl border border-blue-100 w-full max-w-xl flex flex-col items-center mx-auto mt-16"
        style={{
          minHeight: '540px',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18), 0 1.5px 8px 0 rgba(59,130,246,0.10)',
          padding: '2.5rem 1.5rem',
          border: '1.5px solid rgba(59,130,246,0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Top Center Title */}
        <h2 className="text-2xl font-extrabold mb-2 text-blue-700 text-center tracking-tight w-full">
          User Statistics
        </h2>
        {/* Subtitle Center */}
        <p className="text-gray-500 mb-8 text-center w-full">
          See how your team is distributed by role
        </p>

        {error && (
          <div className="text-red-500 mb-4 text-center">
            {error}
          </div>
        )}

        {/* Pie Chart Center */}
        <div style={{ width: '220px', margin: '0 auto', marginBottom: '2rem' }}>
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={stats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={5}
                startAngle={30}
                endAngle={390}
                stroke="#fff"
                strokeWidth={3}
                style={{
                  filter: 'drop-shadow(0 8px 16px rgba(59,130,246,0.18))',
                  cursor: 'pointer'
                }}
                onClick={handlePieClick}
              >
                {stats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      filter: 'drop-shadow(0 2px 8px rgba(59,130,246,0.18))',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend Center */}
        <div
          className="flex items-center justify-center mt-4 mx-auto"
          style={{ width: 'max-content' }}
        >
          {stats.map((s, idx) => (
            <div key={s.name} className="flex items-center gap-2 mx-4">
              <span style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: COLORS[idx % COLORS.length],
                border: '2px solid #fff',
                boxShadow: '0 2px 6px rgba(59,130,246,0.12)'
              }} />
              <span className="text-gray-700 font-medium">{s.name}: <span className="font-bold">{s.value}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}