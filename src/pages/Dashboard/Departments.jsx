// Departments.jsx - Updated with Professional, Compact UI

"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/layout/Navbar"; 

const API_URL = "https://darziflow-backend.onrender.com/api";

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  return parsedData?.accessToken;
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  // 1. --- API FETCH LOGIC (GET /api/departments) ---
  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
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
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch departments from API.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 2. --- API DELETE LOGIC (DELETE /api/departments/:id) ---
  const handleDelete = async (deptId, e) => {
    // Stop event propagation so the row click is not triggered
    e.stopPropagation(); 
    if (!window.confirm(`Are you sure you want to delete department with ID: ${deptId}? This action is permanent (soft delete).`)) {
      return;
    }
    
    const token = getToken();
    if (!token) {
        alert("Authentication failed. Please log in.");
        return;
    }
    
    // Optimistically update the UI before API call
    setDepartments((prev) => prev.filter((dept) => dept._id !== deptId));

    try {
        await axios.delete(`${API_URL}/departments/${deptId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        alert(`Department ${deptId.substring(0, 10)}... deleted successfully.`);

    } catch (err) {
        // Revert UI change if API call fails
        fetchDepartments(); 
        const errorMessage = err.response?.data?.message || err.message || "Failed to delete department.";
        alert(`Error deleting department: ${errorMessage}`);
        setError(`Deletion failed: ${errorMessage}`);
    }
  };

  const handleEdit = (deptId, e) => {
    e.stopPropagation(); // Stop row click
    // Navigate to the update page (Screen 2: Detail/Editor View)
    navigate(`/update-department/${deptId}`);
  };
  
  const handleDetailView = (deptId) => {
    // Navigate to the new read-only detail view
    navigate(`/department-detail/${deptId}`);
  };

  return (
    <div className="departments-container">
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
          {/* Decorative elements kept for theme */}
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
                          <tr 
                            key={dept._id || idx} 
                            className={idx % 2 === 0 ? "even-row clickable-row" : "odd-row clickable-row"}
                            onClick={() => handleDetailView(dept._id)} // <-- NEW CLICK HANDLER
                          >
                        <td className="name-cell">{dept.name}</td>
                        <td className="id-cell">{dept._id ? dept._id.substring(0, 10) + '...' : 'N/A'}</td>
                        <td className="desc-cell">
                          {dept.description 
                            ? (dept.description.length > 50 ? dept.description.substring(0, 50) + '...' : dept.description) 
                            : 'N/A'
                          }
                        </td>
                        <td className="action-cell" onClick={(e) => e.stopPropagation()}> 
                          {/* Stop propagation here to prevent row click when action buttons are pressed */}
                          <button
                            className="edit-btn"
                            onClick={(e) => handleEdit(dept._id, e)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={(e) => handleDelete(dept._id, e)}
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

      {/* INLINE STYLING - UPDATED FOR COMPACTNESS AND PROFESSIONAL LOOK */}
      <style jsx>{`
        .clickable-row {
            cursor: pointer; /* Indicate it's clickable */
        }
        .departments-table tr:hover {
          background: rgba(99, 102, 241, 0.1);
          box-shadow: inset 0 0 10px rgba(99, 102, 241, 0.05);
        }
        
        /* --- General Layout and Theme --- */
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

        /* --- Header and Add Button --- */
        .departments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 1.5rem; /* Reduced margin */
        }

        .header-title {
          font-size: 1.75rem; /* Slightly smaller title */
          font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .add-button {
          padding: 0.5rem 1rem; /* Smaller button */
          background: rgba(34, 197, 94, 0.2); 
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px; /* Smaller radius */
          color: #4ade80; 
          text-decoration: none;
          transition: 0.3s ease;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .add-button:hover {
          background: rgba(34, 197, 94, 0.3);
          transform: translateY(-1px);
        }

        /* --- Card and Table Container --- */
        .departments-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px; /* Slightly smaller radius */
          padding: 1rem; /* Reduced padding */
          position: relative;
          backdrop-filter: blur(15px); /* Slightly less blur */
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); /* Subtler shadow */
        }
        
        /* Decorative background elements (kept) */
        .card-bg-gradient {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent 70%); /* Reduced opacity */
          border-radius: 50%;
        }

        .card-blur-element {
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%); /* Reduced opacity */
          border-radius: 50%;
        }
        
        /* --- Table Styling - COMPACTNESS ACHIEVED HERE --- */
        .table-wrapper {
          overflow-x: auto;
          position: relative;
          z-index: 1;
        }

        .departments-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem; /* Slightly smaller font for table data */
        }

        .departments-table thead tr {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); /* Reduced opacity */
          border-bottom: 1px solid rgba(99, 102, 241, 0.3);
        }

        .departments-table th {
          padding: 0.75rem 1rem; /* Reduced padding for header */
          color: #e2e8f0;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          text-align: left;
        }
        
        /* First and last column alignment fixes */
        .departments-table th:first-child { padding-left: 1.5rem; }
        .departments-table td:first-child { padding-left: 1.5rem; }
        .departments-table th:last-child { padding-right: 1.5rem; text-align: center; }
        .departments-table td:last-child { padding-right: 1.5rem; }


        .departments-table td {
          padding: 0.75rem 1rem; /* Significantly reduced padding for data cells */
          color: #cbd5e1;
          vertical-align: middle; /* Center content vertically */
          border-bottom: 1px solid rgba(255, 255, 255, 0.05); /* Subtle row divider */
        }

        .even-row {
          background: rgba(255, 255, 255, 0.01);
        }

        .odd-row {
          background: rgba(99, 102, 241, 0.03); /* Reduced opacity for a subtler look */
        }
        
        /* Specific Column Styling */
        .id-cell {
          font-family: monospace;
          color: #94a3b8;
        }

        .desc-cell {
          max-width: 250px; /* Limit description width */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* --- Action Buttons --- */
        .action-cell {
          display: flex;
          gap: 0.5rem; /* Reduced gap between buttons */
          justify-content: center; /* Center buttons in the column */
        }

        .edit-btn,
        .delete-btn {
          padding: 0.3rem 0.6rem; /* Much smaller buttons */
          border-radius: 6px; 
          border: none;
          cursor: pointer;
          font-weight: 500; /* Slightly lighter font */
          font-size: 0.8rem; /* Smaller text inside button */
          transition: 0.2s ease;
        }

        .edit-btn {
          background: rgba(59, 130, 246, 0.15); /* Reduced opacity */
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.25);
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.15); /* Reduced opacity */
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.25);
        }
        
        /* --- State Styling (Loading/Error/Empty) --- */
        .loading-state, .error-state, .empty-state {
            text-align: center;
            padding: 2rem;
            color: #94a3b8;
            font-size: 1rem;
        }
        /* Spinner and error icon styles kept the same */
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