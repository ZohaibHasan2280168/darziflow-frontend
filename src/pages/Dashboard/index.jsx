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

 

  // Define fixed roles with their backend key, display name, and color

  const initialStats = [

    { name: "Admin", value: 0, backendKey: "ADMIN", color: "rgb(0, 136, 254)" },

    { name: "Client", value: 0, backendKey: "CLIENT", color: "rgb(0, 196, 159)" },

    // Assuming QC Member's backend key is QC_MEMBER or similar

    { name: "QC Member", value: 0, backendKey: "QC_MEMBER", color: "rgb(255, 187, 40)" },

  ];

 

  const [stats, setStats] = useState(initialStats);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  const getToken = () => {

  const storedData = localStorage.getItem("useraccesstoken")

  const parsedData = storedData ? JSON.parse(storedData) : null

  return parsedData?.accessToken

}



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

         

          const newStats = initialStats.map(stat => {

            // Get count using the backendKey (e.g., "ADMIN")

            const count = userStats?.roles?.[stat.backendKey] || 0;

            return {

              ...stat,

              value: count

            };

          });



          setStats(newStats);



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



  // Handler to navigate when a role is clicked

  const handleRoleOptionClick = (roleDisplayName) => {

    // Converts "QC Member" -> "qc_member" for the URL parameter

    const urlRoleSlug = roleDisplayName.toLowerCase().replace(/\s+/g, '_');

    // Navigates to the new filtered user list page

    navigate(`/users/role/${urlRoleSlug}`);

  };



  const totalUsers = stats.reduce((sum, s) => sum + s.value, 0);



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

                onClick={() => handleRoleOptionClick(stat.name)} // Pass the display name

              >

                <div

                  className="legend-color"

                  style={{ backgroundColor: stat.color || "#888" }}

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

          padding: 0.25rem 0.5rem;

          border-radius: 4px;

          transition: background-color 0.2s;

        }

        .legend-item:hover {

             background-color: rgba(255, 255, 255, 0.1);

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