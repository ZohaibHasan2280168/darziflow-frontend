// Departments.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// Assuming Navbar is imported or included in your main layout, 
// I'll keep the structure similar to Users.jsx.
import Navbar from "../../components/layout/Navbar"; 

const API_URL = "http://localhost:5000/api";

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  return parsedData?.accessToken;
};

// --- Mock Data for UI Display (as requested previously) ---
const MOCK_DEPARTMENTS = [
    { _id: "60c84f40f0f1c30015b637a1", name: "Cutting & Stitching", description: "All garment preparation and assembly tasks." },
    { _id: "60c84f40f0f1c30015b637a2", name: "Design & Pattern", description: "Design creation, pattern drafting, and samples." },
    { _id: "60c84f40f0f1c30015b637a3", name: "Finishing & QC", description: "Final checks, buttoning, and quality control (QC)." },
    { _id: "60c84f40f0f1c30015b637a4", name: "Inventory Management", description: "Managing fabric, thread, and accessory stock." },
    { _id: "60c84f40f0f1c30015b637a5", name: "Dispatch", description: "Packaging and shipping finished orders to clients." },
];
// ---------------------------------

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    // --- Mock Data Logic ---
    try {
      // Simulate API loading time
      await new Promise(resolve => setTimeout(resolve, 800)); 
      setDepartments(MOCK_DEPARTMENTS);
      setLoading(false);
    } catch (err) {
      // This is generally for token check failure, not mock data fail
      setError("Failed to initialize mock data.");
      setLoading(false);
    }
    
    /* --- NOTE: When switching to Real API, uncomment this block and remove the Mock Logic ---
    const token = getToken();
    if (!token) {
      setError("No access token found. Please login again.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/departments`, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch departments from API.");
      setLoading(false);
    }
    */
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = (deptId) => {
    if (!window.confirm(`Are you sure you want to delete department with ID: ${deptId}?`)) {
      return;
    }
    // Mock Delete Action: Update UI only
    setDepartments((prev) => prev.filter((dept) => dept._id !== deptId));
    alert("Department deleted successfully! (Mock Action)");
    
    // NOTE: Add actual axios.delete call here when backend is ready.
  };

  const handleUpdate = (deptId) => {
    // Navigate to the update page
    navigate(`/update-department/${deptId}`);
  };

  return (
    <div className="departments-container">
      {/* Assuming Navbar is included here as per Users.jsx structure */}
      <Navbar /> 
      
      <div className="departments-content">
        <div className="departments-header">
          <div className="header-content">
            <h1 className="header-title">Department Management</h1>
            <p className="header-subtitle">View, edit, or remove production departments</p>
          </div>
          <Link to="/add-department" className="add-button">
            + Add New Department
          </Link>
        </div>

        <div className="departments-card">
          <div className="card-bg-gradient"></div>
          <div className="card-blur-element"></div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading departments...</p>
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
              <table className="departments-table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length > 0 ? (
                    departments.map((dept, idx) => (
                      <tr key={dept._id || idx} className={idx % 2 === 0 ? "even-row" : "odd-row"}>
                        <td className="name-cell">{dept.name}</td>
                        <td className="id-cell">{dept._id.substring(0, 10)}...</td>
                        <td className="desc-cell">{dept.description || 'N/A'}</td>
                        <td className="action-cell">
                          <button
                            className="edit-btn"
                            onClick={() => handleUpdate(dept._id)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(dept._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        No departments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* INLINE STYLING COPIED FROM USERS.JSX, ADJUSTED FOR DEPARTMENT CLASSES */}
      <style jsx>{`
        .departments-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          overflow-x: hidden;
        }

        .departments-content {
          position: relative;
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .departments-header {
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

        .add-button { /* Changed from back-button */
          padding: 0.75rem 1.25rem;
          background: rgba(34, 197, 94, 0.2); /* Green background for 'Add' */
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          color: #4ade80; /* Light green text */
          text-decoration: none;
          transition: 0.3s ease;
          font-weight: 600;
        }

        .add-button:hover {
          background: rgba(34, 197, 94, 0.3);
          transform: translateY(-2px);
        }

        .departments-card {
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

        .departments-table {
          width: 100%;
          border-collapse: collapse;
        }

        .departments-table thead tr {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
          border-bottom: 2px solid rgba(99, 102, 241, 0.3);
        }

        .departments-table th {
          padding: 1rem;
          color: #e2e8f0;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .departments-table td {
          padding: 1rem;
          color: #cbd5e1;
          vertical-align: top; /* Ensure content starts at the top */
        }

        .even-row {
          background: rgba(255, 255, 255, 0.02);
        }

        .odd-row {
          background: rgba(99, 102, 241, 0.05);
        }

        .departments-table tr:hover {
          background: rgba(99, 102, 241, 0.1);
          box-shadow: inset 0 0 15px rgba(99, 102, 241, 0.1);
        }

        /* Removed role-badge styles as departments don't have roles */

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
        
        /* Loading/Error State Styling */
        .loading-state, .error-state, .empty-state {
            text-align: center;
            padding: 2rem;
            color: #94a3b8;
            font-size: 1.1rem;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid #60a5fa;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error-state span {
            font-size: 2rem;
            display: block;
            margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default Departments;