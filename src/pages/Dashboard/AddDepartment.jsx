// AddDepartment.jsx - UPDATED (Remove Checkpoint Button Position Fixed)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://darziflow-backend.onrender.com/api";

const ALLOWED_SUBMISSION_TYPES = ["DOCUMENT", "TEXT", "IMAGE", "VIDEO"];

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  return parsedData?.accessToken;
};

// --- Initial Data Structure for the Form ---
const initialCheckpoint = () => ({
  name: "",
  allowedSubmissionTypes: ["TEXT"], // Default
  qcRequired: false,
  minRequiredUploads: 1,
  id: Date.now() + Math.random(), // Temporary ID for React keys
});

const initialOperation = () => ({
  name: "",
  description: "",
  checkpoints: [initialCheckpoint()], // Start with one checkpoint
  id: Date.now() + Math.random() + 100, // Temporary ID for React keys
});

const initialFormState = {
  name: "",
  description: "",
  departmentHead: "", // Placeholder for User ID
  status: "ACTIVE",
  operations: [initialOperation()], // Start with one operation
};

export default function AddDepartment() {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- Handlers for Department Root Fields ---
  const handleRootChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Handlers for Operations Array ---
  const handleOperationChange = (opId, e) => {
    const newOperations = form.operations.map((op) =>
      op.id === opId ? { ...op, [e.target.name]: e.target.value } : op
    );
    setForm({ ...form, operations: newOperations });
  };

  const handleAddOperation = () => {
    setForm({
      ...form,
      operations: [...form.operations, initialOperation()],
    });
  };

  const handleRemoveOperation = (opId) => {
    setForm({
      ...form,
      operations: form.operations.filter((op) => op.id !== opId),
    });
  };

  // --- Handlers for Checkpoints Array (Deeply Nested) ---
  const handleCheckpointChange = (opId, chkId, e) => {
    const { name, value, type, checked } = e.target;

    const newOperations = form.operations.map((op) => {
      if (op.id === opId) {
        const newCheckpoints = op.checkpoints.map((chk) => {
          if (chk.id === chkId) {
            if (type === "checkbox") {
              return { ...chk, [name]: checked };
            }
            if (name === "allowedSubmissionTypes") {
              // Handle multi-select/comma-separated submission types
              return { ...chk, allowedSubmissionTypes: value.split(',').map(s => s.trim().toUpperCase()) };
            }
            return { ...chk, [name]: value };
          }
          return chk;
        });
        return { ...op, checkpoints: newCheckpoints };
      }
      return op;
    });
    setForm({ ...form, operations: newOperations });
  };

  const handleAddCheckpoint = (opId) => {
    const newOperations = form.operations.map((op) =>
      op.id === opId
        ? { ...op, checkpoints: [...op.checkpoints, initialCheckpoint()] }
        : op
    );
    setForm({ ...form, operations: newOperations });
  };

  const handleRemoveCheckpoint = (opId, chkId) => {
    const newOperations = form.operations.map((op) => {
      if (op.id === opId) {
        const newCheckpoints = op.checkpoints.filter((chk) => chk.id !== chkId);
        return { ...op, checkpoints: newCheckpoints };
      }
      return op;
    });
    setForm({ ...form, operations: newOperations });
  };

  // --- API Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = getToken();
    if (!token) {
        setError("No access token found. Please login again.");
        setLoading(false);
        return;
    }

    // 1. Clean the data for API submission (remove temporary IDs)
    const cleanedOperations = form.operations.map(op => {
        const { id, ...opData } = op; // Remove op.id
        opData.checkpoints = opData.checkpoints.map(chk => {
            const { id: chkId, ...chkData } = chk; // Remove chk.id
            // Ensure Submission Types are a valid array of strings
            chkData.allowedSubmissionTypes = chkData.allowedSubmissionTypes
                .filter(type => ALLOWED_SUBMISSION_TYPES.includes(type));
            return chkData;
        });
        return opData;
    }).filter(op => op.name && op.checkpoints.length > 0); // Only submit non-empty ops

    // 2. Prepare the final request body
    const requestBody = {
        name: form.name,
        description: form.description,
        departmentHead: form.departmentHead || null, // API needs a valid ID or null
        status: form.status,
        operations: cleanedOperations,
    };

    try {
      // API Request: POST /api/departments
      const res = await axios.post(
        `${API_URL}/departments`, 
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201 || res.status === 200) { 
        alert(`Department '${form.name}' created successfully!`);
        navigate("/departments"); // Navigate back to the list
      } else {
        throw new Error(res.data?.message || "Failed to create department");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
      setError(`Creation Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Functions for Nested Structure ---

  const renderCheckpointForm = (opId, chk) => (
    <div key={chk.id} className="checkpoint-form">
      {/* Row 1: Checkpoint Name (left) & Min Uploads (right) - aligns top */}
      <div className="input-row">
        <div className="input-group">
          <label>Checkpoint Name</label>
          <input
            type="text"
            name="name"
            value={chk.name}
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)}
            required
          />
        </div>
        <div className="input-group">
          <label>Min Uploads</label>
          <input
            type="number"
            name="minRequiredUploads"
            value={chk.minRequiredUploads}
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)}
            min="0"
          />
        </div>
      </div>

      {/* Row 2: QC Required (left) & Submission Types (right) - submission types moved down */}
      <div className="input-row small-fields">
        <div className="input-group checkbox-group">
          <label htmlFor={`qc-${chk.id}`}>QC Required?</label>
          <input
            type="checkbox"
            id={`qc-${chk.id}`}
            name="qcRequired"
            checked={chk.qcRequired}
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)}
          />
        </div>
        <div className="input-group">
          <label>Submission Types (Comma-separated: IMAGE, TEXT, DOCUMENT)</label>
          <input
            type="text"
            name="allowedSubmissionTypes"
            value={chk.allowedSubmissionTypes.join(', ')}
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)}
            placeholder="e.g., DOCUMENT, IMAGE"
          />
        </div>
      </div>
        {/* The remove button is ADDED back below, aligned with the 'Add Checkpoint' button */}
    </div>
  );

  const renderOperationForm = (op) => (
    <div key={op.id} className="operation-block">
        <div className="operation-header">
            <h3>Operation: {op.name || 'New Operation'}</h3>
            {form.operations.length > 1 && (
                <button 
                    type="button" 
                    className="remove-op-btn" 
                    onClick={() => handleRemoveOperation(op.id)}
                >
                    Remove Operation
                </button>
            )}
        </div>
        
        <div className="input-row">
            <div className="input-group">
                <label>Operation Name</label>
                <input
                    type="text"
                    name="name"
                    value={op.name}
                    onChange={(e) => handleOperationChange(op.id, e)}
                    required
                />
            </div>
            <div className="input-group">
                <label>Operation Description</label>
                <textarea
                    name="description"
                    value={op.description}
                    onChange={(e) => handleOperationChange(op.id, e)}
                    rows="1"
                />
            </div>
        </div>

        <div className="checkpoints-section">
            <h4>Checkpoints ({op.checkpoints.length})</h4>
            {op.checkpoints.map(chk => renderCheckpointForm(op.id, chk))}
            
            <div className="checkpoint-actions-row">
              <button 
                  type="button" 
                  className="add-checkpoint-btn" 
                  onClick={() => handleAddCheckpoint(op.id)}
              >
                  + Add Checkpoint
              </button>
              {/* CHECKPOINT REMOVE BUTTON MOVED HERE, next to ADD button */}
              {op.checkpoints.length > 1 && (
                  <button 
                      type="button" 
                      className="remove-checkpoint-btn-aligned" 
                      onClick={() => handleRemoveCheckpoint(op.id, op.checkpoints[op.checkpoints.length - 1].id)}
                  >
                      &times; Remove Last Checkpoint
                  </button>
              )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="add-department-container"> 
      <div className="add-department-card">
        <h1 className="add-department-title">➕ Create Department Template</h1>
        <p className="add-department-subtitle">Define the workflow structure, operations, and checkpoints.</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="add-department-form">
          
          {/* --- 1. Root Department Metadata --- */}
          <h2>Department Metadata</h2>
          <div className="input-group">
            <label htmlFor="name">Department Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleRootChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleRootChange}
              rows="2"
              required
            />
          </div>
          
          <div className="input-row">
            <div className="input-group">
                <label htmlFor="departmentHead">Department Head (User ID)</label>
                <input
                    type="text"
                    id="departmentHead"
                    name="departmentHead"
                    value={form.departmentHead}
                    onChange={handleRootChange}
                    placeholder="Enter User ID (e.g., 65b533e4f6a7d2c34d58e1c1)"
                />
            </div>
            <div className="input-group">
                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleRootChange}
                >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                </select>
            </div>
          </div>
          
          {/* --- 2. Operations and Checkpoints (Nested Structure) --- */}
          <h2 style={{ marginTop: '2rem' }}>Workflow Operations ({form.operations.length})</h2>
          <div className="operations-list">
            {form.operations.map(renderOperationForm)}
          </div>

          <button 
            type="button" 
            className="add-operation-btn" 
            onClick={handleAddOperation}
          >
            + Add New Operation Block
          </button>
          
          {/* --- 3. Submission Buttons --- */}
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Department Template"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/departments")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        /* --- General Container Styles (Similar to Update/Add User) --- */
        .add-department-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a);
          background-size: 200% 200%;
          animation: gradientMove 8s ease infinite;
          padding: 2rem 1rem;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .add-department-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2.5rem;
          border-radius: 20px;
          width: 100%;
          max-width: 800px; /* Increased max-width for the complex form */
          color: #f8fafc;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .add-department-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #4ade80, #34d399); /* Green gradient for 'Add' */
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
        }

        .add-department-subtitle {
          color: #cbd5e1;
          font-size: 0.95rem;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        h2 {
            font-size: 1.5rem;
            color: #60a5fa;
            border-bottom: 1px solid rgba(96, 165, 250, 0.3);
            padding-bottom: 0.5rem;
            margin-top: 1rem;
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

        .add-department-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          text-align: left;
          width: 100%;
        }
        
        .input-row {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start; /* ensure inputs align at the top of the row */
        }
        
        .input-row.small-fields {
           /* Changed to align input fields horizontally */
           /* The small fields were previously using grid, let's ensure they are aligned */
          display: flex;
          align-items: flex-start; /* align items at top so long labels don't push inputs down */
        }
        
        /* Ensure inputs in the small-fields row take up roughly equal space */
        .input-row.small-fields .input-group {
            flex-basis: 50%;
        }

        /* Ensure the input fields within the input-row are aligned */
        .input-row .input-group:first-child,
        .input-row .input-group:last-child {
            width: 50%; /* Distribute space equally for 2-column layout */
        }

        .input-group label {
          margin-bottom: 0.4rem;
          color: #e2e8f0;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .input-group input,
        .input-group textarea,
        .input-group input,
        .input-group textarea,
        .input-group select {
          border-radius: 10px;
          padding: 0.75rem;
          font-size: 0.95rem;
          outline: none;
          transition: 0.3s ease;
          resize: vertical;
        }

        /* Default select background (fallback) */
        .input-group select {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #f1f5f9;
          /* remove native arrow so we can style consistently */
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding-right: 2.5rem; /* space for custom arrow */
          background-repeat: no-repeat;
          background-position: calc(100% - 1rem) center;
        }

        /* Theme aware select styling using the document root class set by ThemeContext */
        :root.light .add-department-card .input-group select,
        :root.light select {
          background: rgba(255, 255, 255, 0.95);
          color: #0f1724;
          border-color: rgba(15, 23, 36, 0.08);
        }

        :root.dark .add-department-card .input-group select,
        :root.dark select {
          background: rgba(255, 255, 255, 0.06);
          color: #f1f5f9;
          border-color: rgba(255, 255, 255, 0.18);
        }

        /* Style native option elements where browsers allow it so the dropdown list isn't white on dark theme */
        :root.dark .add-department-card .input-group select option,
        :root.dark select option {
          background: #0b1220; /* dark option background */
          color: #f8fafc;
        }

        :root.light .add-department-card .input-group select option,
        :root.light select option {
          background: #ffffff;
          color: #0f1724;
        }

        /* A small CSS-only arrow for the select to replace the native one */
        .input-group select::after {
          content: '';
        }

        .input-group input:focus,
        .input-group textarea:focus,
        .input-group select:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.06); /* subtle, not heavy */
          outline: none;
        }

        /* --- Operation Block Styling --- */
        .operation-block {
            border: 1px solid rgba(167, 139, 250, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
            background: rgba(167, 139, 250, 0.05);
            margin-bottom: 1.5rem;
        }
        
        .operation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .remove-op-btn {
            background: #ef4444;
            color: white;
            padding: 0.4rem 0.8rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: 0.3s;
        }
        .remove-op-btn:hover { background: #dc2626; }

        /* --- Checkpoint Styling --- */
        .checkpoints-section {
            border-top: 1px dashed rgba(255, 255, 255, 0.2);
            padding-top: 1rem;
            margin-top: 1rem;
        }
        
        .checkpoint-form {
            border: 1px solid rgba(96, 165, 250, 0.2);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            background: rgba(96, 165, 250, 0.05);
        }
        
        /* Removed grid-template-columns here, using flex now */
        .input-row.small-fields {
            margin-top: 1rem;
            /* Explicitly define width if necessary, otherwise flex should manage it */
        }
        
        .checkbox-group {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
            margin-top: 15px; /* Alignment fix */
        }
        
        .checkbox-group label {
            margin-bottom: 0;
        }
        
        .checkbox-group input[type="checkbox"] {
            width: 20px;
            height: 20px;
            margin: 0;
            cursor: pointer;
            flex-shrink: 0;
            align-self: center; /* Ensure checkbox aligns vertically with label */
        }

        /* NEW STYLING for ALIGNED CHECKPOINT BUTTONS */
        .checkpoint-actions-row {
            display: flex;
            justify-content: flex-start; /* Start buttons from the left */
            gap: 1rem; /* Space between the two buttons */
            margin-top: 1rem;
        }
        
        .remove-checkpoint-btn-aligned {
            background: #f97316;
            color: white;
            padding: 0.7rem 1rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            align-self: flex-end;
            transition: 0.3s;
            white-space: nowrap;
            font-weight: 600;
        }
        .remove-checkpoint-btn-aligned:hover { 
            background: #ea580c; 
        }

        .add-checkpoint-btn, .add-operation-btn {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
            border: 1px solid #4ade80;
            padding: 0.7rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: 0.3s ease;
            font-weight: 600;
        }
        .add-operation-btn {
            display: block;
            width: 100%;
            margin-top: 0.5rem;
        }
        .add-checkpoint-btn:hover, .add-operation-btn:hover {
            background: rgba(34, 197, 94, 0.4);
        }

        /* --- Submission Buttons --- */
        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }

        .submit-btn {
          background: linear-gradient(90deg, #10b981, #34d399); 
          flex-grow: 1;
          border: none;
          padding: 0.8rem;
          border-radius: 12px;
          font-weight: 600;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover {
          background: linear-gradient(90deg, #059669, #23745a);
          transform: translateY(-2px);
        }

        .cancel-btn {
          background: transparent;
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0.8rem;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.3s ease;
          width: 150px;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .error-text {
          color: #fca5a5;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          text-align: center;
        }

        /* Media Queries for Responsiveness */
        @media (max-width: 600px) {
            .input-row, .input-row.small-fields {
                flex-direction: column;
                display: flex;
            }
            .input-row .input-group:first-child,
            .input-row .input-group:last-child {
                width: 100%;
            }
            .input-row.small-fields .input-group {
                flex-basis: 100%;
            }
            .checkpoint-actions-row {
                flex-direction: column;
                gap: 0.5rem;
            }
            .remove-checkpoint-btn-aligned {
                align-self: flex-start;
                width: 100%;
            }
            .form-actions {
                flex-direction: column;
            }
            .cancel-btn {
                width: 100%;
            }
        }
      `}</style>
    </div>
  );
}