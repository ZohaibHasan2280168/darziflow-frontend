// UpdateDepartments.jsx - Full Template Editor

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "https://darziflow-backend.onrender.com/api";

const ALLOWED_SUBMISSION_TYPES = ["DOCUMENT", "TEXT", "IMAGE", "VIDEO"];

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  return parsedData?.accessToken;
};

// --- Helper Functions for Checkpoint and Operation ID generation (used for dynamic additions) ---
const newCheckpoint = () => ({
  name: "",
  allowedSubmissionTypes: ["TEXT"],
  qcRequired: false,
  minRequiredUploads: 1,
  // Note: We use Math.random() as a temporary unique key for new items *before* they are saved.
  id: Date.now() + Math.random(), 
});

const newOperation = () => ({
  name: "",
  description: "",
  checkpoints: [newCheckpoint()],
  id: Date.now() + Math.random() + 100,
});
// ------------------------------------------------------------------------------------------

export default function UpdateDepartments() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State structure mirrors the API response body, including operations array
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    departmentHead: "",
    status: "",
    operations: [], // Crucial array for nested structure
  });
  
  const [loading, setLoading] = useState(false); // For form submission
  const [fetching, setFetching] = useState(true); // For initial data load
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

        // Map the fetched data to state, ensuring all operations/checkpoints have temporary IDs for React keys
        const fetchedData = res.data;
        const initializedOperations = fetchedData.operations.map(op => ({
            ...op,
            // Ensure ID is present for tracking updates/removals
            id: op._id || op.id || newOperation().id, 
            checkpoints: op.checkpoints.map(chk => ({
                ...chk,
                id: chk._id || chk.id || newCheckpoint().id, 
                // Convert allowedSubmissionTypes from string to array if needed (based on API consistency)
                allowedSubmissionTypes: Array.isArray(chk.allowedSubmissionTypes) 
                                        ? chk.allowedSubmissionTypes 
                                        : (chk.allowedSubmissionTypes || '').split(',').map(s => s.trim().toUpperCase()),
            }))
        }));

        setForm({
            name: fetchedData.name || "",
            description: fetchedData.description || "",
            departmentHead: fetchedData.departmentHead || "",
            status: fetchedData.status || "ACTIVE",
            operations: initializedOperations,
        });

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to fetch department data.";
        setError(errorMessage);
      } finally {
        setFetching(false);
      }
    };

    fetchDepartment();
  }, [id]);
  
  // --- Handlers for Department Root Fields ---
  const handleRootChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Handlers for Operations Array ---
  const handleOperationChange = (opId, e) => {
    const { name, value } = e.target;
    const newOperations = form.operations.map((op) =>
      op.id === opId ? { ...op, [name]: value } : op
    );
    setForm({ ...form, operations: newOperations });
  };

  const handleAddOperation = () => {
    setForm({
      ...form,
      operations: [...form.operations, newOperation()],
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
        ? { ...op, checkpoints: [...op.checkpoints, newCheckpoint()] }
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
  
  // 2. --- API SUBMISSION LOGIC (PUT /api/departments/:id) ---
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

    // Prepare the operations data: Remove temporary 'id' and potential '_id' from checkpoints
    const cleanedOperations = form.operations.map(op => {
        // Use a filter to include only fields needed by the API, excluding temporary keys ('id')
        const { id, _id, ...opData } = op; 
        
        opData.checkpoints = opData.checkpoints.map(chk => {
            const { id: chkId, _id: chkMongoId, ...chkData } = chk; 
            
            // Ensure Submission Types are a valid array
            chkData.allowedSubmissionTypes = chkData.allowedSubmissionTypes
                .filter(type => ALLOWED_SUBMISSION_TYPES.includes(type));
            
            // If the checkpoint came from the DB, keep its MongoDB _id for updating the embedded document
            if (chkMongoId) {
                return { _id: chkMongoId, ...chkData };
            }
            return chkData;
        });
        
        // If the operation came from the DB, keep its MongoDB _id for updating the embedded document
        if (_id) {
            return { _id, ...opData };
        }
        return opData;
    }).filter(op => op.name); // Filter out empty operations
    
    // Final request body: The API requires the full structure to be sent in the PUT request
    const requestBody = {
        name: form.name,
        description: form.description,
        departmentHead: form.departmentHead || null, 
        status: form.status,
        operations: cleanedOperations,
    };

    try {
      // API Request: PUT /api/departments/{{deptId}}
      await axios.put(
        `${API_URL}/departments/${id}`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Department '${form.name}' template updated successfully!`);
      navigate("/departments"); 
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
      setError(`Update Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };


  // --- Render Functions (Reusing AddDepartment structure) ---

  const renderCheckpointForm = (opId, chk) => (
    <div key={chk.id} className="checkpoint-form">
        {/* Checkpoint fields */}
        {/* ... (Implementation is identical to AddDepartment.jsx) ... */}
        {/* Row 1: Checkpoint Name (left) & Min Uploads (right) */}
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

        {/* Row 2: QC Required (left) & Submission Types (right) - moved down */}
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
            <label>Submission Types (Comma-separated: {ALLOWED_SUBMISSION_TYPES.join(', ')})</label>
            <input
              type="text"
              name="allowedSubmissionTypes"
              value={chk.allowedSubmissionTypes.join(', ')}
              onChange={(e) => handleCheckpointChange(opId, chk.id, e)}
              placeholder="e.g., DOCUMENT, IMAGE"
            />
          </div>
          <button 
            type="button" 
            className="remove-btn" 
            onClick={() => handleRemoveCheckpoint(opId, chk.id)}
            disabled={form.operations.find(op => op.id === opId)?.checkpoints.length === 1}
          >
            &times; Remove
          </button>
        </div>
    </div>
  );

  const renderOperationForm = (op) => (
    <div key={op.id} className="operation-block">
        <div className="operation-header">
            <h3>Operation: {op.name || 'New Operation'}</h3>
            {form.operations.length >= 1 && (
                <button 
                    type="button" 
                    className="remove-op-btn" 
                    onClick={() => handleRemoveOperation(op.id)}
                >
                    Remove Operation
                </button>
            )}
        </div>
        
        {/* Operation fields */}
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

        {/* Checkpoints Section */}
        <div className="checkpoints-section">
            <h4>Checkpoints ({op.checkpoints.length})</h4>
            {op.checkpoints.map(chk => renderCheckpointForm(op.id, chk))}
            
            <button 
                type="button" 
                className="add-checkpoint-btn" 
                onClick={() => handleAddCheckpoint(op.id)}
            >
                + Add Checkpoint
            </button>
        </div>
    </div>
  );


  // --- UI Loading/Error States ---
  if (fetching) {
    return (
      <div className="update-loading">
        <div className="spinner"></div>
        <p>Fetching department template data...</p>
      </div>
    );
  }

  // --- Main Render (Editor UI) ---
  return (
    <div className="update-container">
      <div className="update-card">
        <h1 className="update-title">📝 Edit Department Template</h1>
        <p className="update-subtitle">Modifying: **{form.name}** (ID: {id})</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="update-form">
          
          {/* --- 1. Root Department Metadata --- */}
          <h2>Template Metadata</h2>
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
            <button type="submit" className="update-btn" disabled={loading}>
              {loading ? "Saving Template..." : "Save Department Template Changes"}
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
        /* Reusing and adjusting styling from AddDepartment.jsx and your provided snippet */
        .update-container {
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
        
        /* Spinner/Loading State */
        .update-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a);
            color: #fff;
            font-size: 1.2rem;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid #60a5fa;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .update-card {
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

        .update-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #a78bfa, #60a5fa); 
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
        }

        .update-subtitle {
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

        .update-form {
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
          align-items: flex-start; /* align inputs at top */
        }
        
        .input-row.small-fields {
          align-items: flex-start; /* align small row items at top so submission types doesn't get pushed down */
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
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding-right: 2.5rem; /* space for custom arrow */
          background-repeat: no-repeat;
          background-position: calc(100% - 1rem) center;
        }

        /* Theme aware select styling */
        :root.light .update-container .input-group select,
        :root.light select {
          background: rgba(255, 255, 255, 0.95);
          color: #0f1724;
          border-color: rgba(15, 23, 36, 0.08);
        }

        :root.dark .update-container .input-group select,
        :root.dark select {
          background: rgba(255, 255, 255, 0.06);
          color: #f1f5f9;
          border-color: rgba(255, 255, 255, 0.18);
        }

        /* Style option background to avoid white dropdown in dark mode */
        :root.dark .update-container .input-group select option,
        :root.dark select option {
          background: #0b1220;
          color: #f8fafc;
        }

        :root.light .update-container .input-group select option,
        :root.light select option {
          background: #ffffff;
          color: #0f1724;
        }

        .input-group input:focus,
        .input-group textarea:focus,
        .input-group select:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.06);
          outline: none;
        }

        /* --- Operation Block Styling (Same as Add) --- */
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

        /* --- Checkpoint Styling (Same as Add) --- */
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
        
        .input-row.small-fields {
            display: grid;
            grid-template-columns: 1fr 1fr auto;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .checkbox-group {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
            margin-top: 15px;
        }
        
        .checkbox-group input[type="checkbox"] {
            width: 20px;
            height: 20px;
            margin: 0;
            cursor: pointer;
            flex-shrink: 0;
        }

        .remove-btn {
            background: #f97316;
            color: white;
            padding: 0.75rem 0.8rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            align-self: flex-end;
            transition: 0.3s;
            white-space: nowrap;
        }
        .remove-btn:hover { background: #ea580c; }
        
        .add-checkpoint-btn, .add-operation-btn {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            border: 1px solid #60a5fa;
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
            background: rgba(59, 130, 246, 0.4);
        }

        /* --- Submission Buttons --- */
        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }

        .update-btn {
          background: linear-gradient(90deg, #6366f1, #8b5cf6); 
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

        .update-btn:hover {
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
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
            .input-row.small-fields {
                grid-template-columns: 1fr;
            }
            .remove-btn {
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