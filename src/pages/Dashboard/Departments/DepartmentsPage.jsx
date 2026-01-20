"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar"; 
import api from "../../../services/reqInterceptor";


const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/departments`);
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

  const handleDetailView = (deptId) => {
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
                    <th>Department Head</th>
                    <th>Description</th>
                    <th style={{textAlign: 'center'}}>Status</th>
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
                        <td className="head-cell">{typeof dept.departmentHead === 'object' ? dept.departmentHead.name : (dept.departmentHead || 'Not Assigned')}</td>
                        <td className="desc-cell">
                          {dept.description 
                            ? (dept.description.length > 50 ? dept.description.substring(0, 50) + '...' : dept.description) 
                            : 'N/A'
                          }
                        </td>
                        <td className="status-cell" style={{textAlign: 'center'}}>
                          <span className={`status-badge ${(dept.status || 'INACTIVE').toUpperCase()}`}>{(dept.status || 'INACTIVE').toUpperCase()}</span>
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
        .head-cell {
          color: #94a3b8;
          font-weight: 600;
        }

        .desc-cell {
          max-width: 250px; /* Limit description width */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Status column & badge */
        .status-cell { width: 120px; text-align: center; }
        .status-badge { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .status-badge.ACTIVE { background: rgba(16,185,129,0.12); color: #10b981; }
        .status-badge.INACTIVE { background: rgba(245,158,11,0.12); color: #f59e0b; }


        
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