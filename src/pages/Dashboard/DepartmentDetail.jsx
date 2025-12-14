// DepartmentDetail.jsx - Read-Only Detail View

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "https://darziflow-backend.onrender.com/api";

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  return parsedData?.accessToken;
};

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // 1. --- API FETCH LOGIC (GET /api/departments/:id) ---
  useEffect(() => {
    const fetchDepartment = async () => {
      setFetching(true);
      setError("");
      const token = getToken();

      if (!token) {
        setError("No access token found. Please login again.");
        setFetching(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/departments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDepartment(res.data);

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to fetch department data.";
        setError(errorMessage);
      } finally {
        setFetching(false);
      }
    };

    fetchDepartment();
  }, [id]);

  // --- Render Functions for Nested Structure ---
  const renderCheckpointDetails = (chk, index) => (
    <div key={chk._id || index} className="checkpoint-detail">
        <p><strong>Name:</strong> {chk.name}</p>
        <p><strong>Submission Types:</strong> {chk.allowedSubmissionTypes.join(', ') || 'N/A'}</p>
        <p><strong>QC Required:</strong> {chk.qcRequired ? 'Yes' : 'No'}</p>
        <p><strong>Min Uploads:</strong> {chk.minRequiredUploads || 1}</p>
    </div>
  );

  const renderOperationDetails = (op, index) => (
    <div key={op._id || index} className="operation-block">
        <h3>{op.name || `Operation ${index + 1}`}</h3>
        <p className="description-text"><strong>Description:</strong> {op.description || 'No description provided.'}</p>

        <div className="checkpoints-section">
            <h4>Checkpoints ({op.checkpoints.length})</h4>
            {op.checkpoints.map(renderCheckpointDetails)}
        </div>
    </div>
  );

  // --- UI Loading/Error States ---
  if (fetching) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Fetching department template data...</p>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="detail-loading">
        <p className="error-text">⚠️ Error: {error || 'Department data unavailable.'}</p>
        <button className="back-btn-error" onClick={() => navigate("/departments")}>Go Back</button>
      </div>
    );
  }

  // --- Main Render (Detail UI) ---
  return (
    <div className="detail-container">
      <div className="detail-card">
        <h1 className="detail-title">👀 Department Template Detail</h1>
        <p className="detail-subtitle">Viewing Template for: **{department.name}**</p>
        
        {/* --- 1. Root Department Metadata --- */}
        <section className="metadata-section">
            <h2>Template Metadata</h2>
            <div className="data-row">
                <div className="data-group">
                    <strong>Department Name:</strong>
                    <span>{department.name}</span>
                </div>
                <div className="data-group">
                    <strong>Status:</strong>
                    <span className={`status-${department.status.toLowerCase()}`}>{department.status}</span>
                </div>
            </div>
            <div className="data-group full-width">
                <strong>Department Head (ID):</strong>
                <span>{department.departmentHead || 'N/A'}</span>
            </div>
            <div className="data-group full-width">
                <strong>Description:</strong>
                <p className="description-long">{department.description}</p>
            </div>
        </section>

        {/* --- 2. Operations and Checkpoints (Nested Structure) --- */}
        <section className="operations-section">
            <h2>Workflow Operations ({department.operations.length})</h2>
            <div className="operations-list">
                {department.operations.length > 0 ? (
                    department.operations.map(renderOperationDetails)
                ) : (
                    <p className="empty-state">No operations defined for this template.</p>
                )}
            </div>
        </section>
        
        {/* --- 3. Action Button --- */}
        <div className="form-actions">
            <button
                type="button"
                className="back-btn"
                onClick={() => navigate("/departments")}
            >
                ← Back to Departments List
            </button>
            <button
                type="button"
                className="edit-btn"
                onClick={() => navigate(`/update-department/${id}`)}
            >
                Edit Template
            </button>
        </div>
      </div>

      <style jsx>{`
        /* --- General Container Styles --- */
        .detail-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a);
            padding: 2rem 1rem;
        }
        .detail-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a);
            color: #fff;
            font-size: 1.2rem;
        }
        .detail-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 2.5rem;
            border-radius: 20px;
            width: 100%;
            max-width: 800px;
            color: #f8fafc;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .detail-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            background: linear-gradient(90deg, #60a5fa, #a78bfa); 
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
        }

        .detail-subtitle {
            color: #cbd5e1;
            font-size: 0.95rem;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        h2 {
            font-size: 1.5rem;
            color: #4ade80; /* Green for section headings */
            border-bottom: 1px solid rgba(34, 197, 94, 0.3);
            padding-bottom: 0.5rem;
            margin-top: 2rem;
            margin-bottom: 1.5rem;
        }
        h3 {
            color: #a78bfa;
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
        }
        h4 {
            color: #cbd5e1;
            font-size: 1rem;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            padding-left: 0.5rem;
            border-left: 3px solid #60a5fa;
        }

        /* --- Metadata Section --- */
        .metadata-section {
            padding: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.1);
        }
        .data-row {
            display: flex;
            gap: 2rem;
            margin-bottom: 1rem;
        }
        .data-group {
            display: flex;
            flex-direction: column;
            text-align: left;
            margin-bottom: 1rem;
            width: 50%;
        }
        .data-group.full-width {
            width: 100%;
        }
        .data-group strong {
            margin-bottom: 0.3rem;
            color: #e2e8f0;
            font-weight: 600;
            font-size: 0.95rem;
        }
        .data-group span, .description-long {
            color: #cbd5e1;
            font-size: 1rem;
            padding: 0.5rem 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 5px;
            padding: 0.5rem;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .description-long {
            padding: 0.75rem;
            line-height: 1.5;
        }
        
        .status-active {
            color: #4ade80; 
            font-weight: 700;
        }
        .status-inactive {
            color: #f87171; 
            font-weight: 700;
        }


        /* --- Operation Block Styling --- */
        .operation-block {
            border: 1px solid rgba(167, 139, 250, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
            background: rgba(167, 139, 250, 0.05);
            margin-bottom: 1.5rem;
        }
        .description-text {
            color: #cbd5e1;
            font-size: 0.95rem;
            margin-left: 1rem;
        }

        /* --- Checkpoint Styling --- */
        .checkpoints-section {
            border-top: 1px dashed rgba(255, 255, 255, 0.2);
            padding-top: 1rem;
            margin-top: 1rem;
        }
        
        .checkpoint-detail {
            border: 1px solid rgba(96, 165, 250, 0.2);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            background: rgba(96, 165, 250, 0.05);
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.5rem 1.5rem;
        }
        .checkpoint-detail p {
            margin: 0;
            font-size: 0.9rem;
        }
        .checkpoint-detail strong {
             color: #e2e8f0;
             font-weight: 500;
        }
        .empty-state {
            color: #94a3b8;
            font-style: italic;
            text-align: center;
            padding: 1rem;
        }


        /* --- Action Buttons --- */
        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            justify-content: flex-end;
        }

        .back-btn {
          background: transparent;
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0.8rem;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.3s ease;
          width: 250px;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .edit-btn {
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            border: none;
            padding: 0.8rem;
            border-radius: 12px;
            font-weight: 600;
            color: #fff;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 200px;
        }
        .edit-btn:hover {
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          transform: translateY(-2px);
        }

        .error-text {
            color: #fca5a5;
            margin-bottom: 1rem;
            font-size: 1.1rem;
            text-align: center;
        }
        .back-btn-error {
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            border: 1px solid #fca5a5;
            background: transparent;
            color: #fca5a5;
            cursor: pointer;
            margin-top: 1rem;
        }

        /* Media Queries */
        @media (max-width: 600px) {
            .data-row {
                flex-direction: column;
                gap: 0;
            }
            .data-group {
                width: 100%;
            }
            .checkpoint-detail {
                grid-template-columns: 1fr;
            }
            .form-actions {
                flex-direction: column;
            }
            .back-btn, .edit-btn {
                width: 100%;
            }
        }
      `}</style>
    </div>
  );
}