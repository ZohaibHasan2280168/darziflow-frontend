import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from '../../../components/ui/AlertProvider';
import api from '../../../services/reqInterceptor';

const ALLOWED_SUBMISSION_TYPES = ["DOCUMENT", "TEXT", "IMAGE", "VIDEO"];


const initialCheckpoint = () => ({
  name: "",
  allowedSubmissionTypes: ["TEXT"],
  qcRequired: false,
  minRequiredUploads: 1,
  id: Date.now() + Math.random(),
});

const initialOperation = () => ({
  name: "",
  description: "",
  checkpoints: [initialCheckpoint()],
  id: Date.now() + Math.random() + 100,
});

const initialFormState = {
  name: "",
  description: "",
  departmentHead: "", 
  status: "ACTIVE",
  operations: [initialOperation()],
};

export default function AddDepartment() {
  const { showAlert } = useAlert();
  const [form, setForm] = useState(initialFormState);
  const [availableHeads, setAvailableHeads] = useState([]); // New state for dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchHeads = async () => {
      
      try {
        const res = await api.get(`/users/available-department-heads`);
        setAvailableHeads(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch department heads", err);
      }
    };
    fetchHeads();
  }, []);

  const handleRootChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOperationChange = (opId, e) => {
    const newOperations = form.operations.map((op) =>
      op.id === opId ? { ...op, [e.target.name]: e.target.value } : op
    );
    setForm({ ...form, operations: newOperations });
  };

  const handleAddOperation = () => {
    setForm({ ...form, operations: [...form.operations, initialOperation()] });
  };

  const handleRemoveOperation = (opId) => {
    setForm({ ...form, operations: form.operations.filter((op) => op.id !== opId) });
  };

  const handleCheckpointChange = (opId, chkId, e) => {
    const { name, value, type, checked } = e.target;
    const newOperations = form.operations.map((op) => {
      if (op.id === opId) {
        const newCheckpoints = op.checkpoints.map((chk) => {
          if (chk.id === chkId) {
            if (type === "checkbox") return { ...chk, [name]: checked };
            if (name === "allowedSubmissionTypes") {
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
      op.id === opId ? { ...op, checkpoints: [...op.checkpoints, initialCheckpoint()] } : op
    );
    setForm({ ...form, operations: newOperations });
  };

  const handleRemoveCheckpoint = (opId, chkId) => {
    const newOperations = form.operations.map((op) => {
      if (op.id === opId) {
        return { ...op, checkpoints: op.checkpoints.filter((chk) => chk.id !== chkId) };
      }
      return op;
    });
    setForm({ ...form, operations: newOperations });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Client-side validation: Department Head is required by backend schema
    if (!form.departmentHead) {
      const msg = 'Department Head is required. Please select a Department Head from the dropdown.';
      setError(msg);
      showAlert({ title: 'Validation', message: msg, type: 'error' });
      setLoading(false);
      return;
    }

    const cleanedOperations = form.operations.map(op => {
        const { id, ...opData } = op;
        opData.checkpoints = opData.checkpoints.map(chk => {
            const { id: chkId, ...chkData } = chk;
            chkData.allowedSubmissionTypes = chkData.allowedSubmissionTypes
                .filter(type => ALLOWED_SUBMISSION_TYPES.includes(type));
            return chkData;
        });
        return opData;
    }).filter(op => op.name && op.checkpoints.length > 0);

    const requestBody = {
        name: form.name,
        description: form.description,
        departmentHead: form.departmentHead || null,
        status: form.status,
        operations: cleanedOperations,
    };

    try {
      const res = await api.post(`/departments`, requestBody);

      if (res.status === 201 || res.status === 200) { 
        showAlert({ title: 'Success', message: `Department '${form.name}' created successfully!`, type: 'success' });
        navigate("/departments");
      }
    } catch (err) {
      console.error('Create department failed', err, err.response?.data);
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : (err.response?.data ? JSON.stringify(err.response.data) : null));
      const displayMsg = serverMsg || `Server Error${status ? ` (HTTP ${status})` : ''}: Failed to create department. Please try again or contact support.`;
      setError(displayMsg);
      showAlert({ title: 'Error', message: displayMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Render Functions ---
  const renderCheckpointForm = (opId, chk) => (
    <div key={chk.id} className="checkpoint-form">
      <div className="input-row">
        <div className="input-group">
          <label>Checkpoint Name</label>
          <input type="text" name="name" value={chk.name} onChange={(e) => handleCheckpointChange(opId, chk.id, e)} required />
        </div>
        <div className="input-group">
          <label>Min Uploads</label>
          <input type="number" name="minRequiredUploads" value={chk.minRequiredUploads} onChange={(e) => handleCheckpointChange(opId, chk.id, e)} min="0" />
        </div>
      </div>
      <div className="input-row small-fields">
        <div className="input-group checkbox-group">
          <label className="switch">
            <input type="checkbox" id={`qc-${chk.id}`} name="qcRequired" checked={chk.qcRequired} onChange={(e) => handleCheckpointChange(opId, chk.id, e)} />
            <span className="switch-slider" aria-hidden="true"></span>
            <span className="switch-label">QC Required</span>
          </label>
        </div>
        <div className="input-group">
          <label>Submission Types (Comma-separated)</label>
          <input type="text" name="allowedSubmissionTypes" value={chk.allowedSubmissionTypes.join(', ')} onChange={(e) => handleCheckpointChange(opId, chk.id, e)} placeholder="e.g., DOCUMENT, IMAGE" />
        </div>
      </div>
    </div>
  );

  const renderOperationForm = (op) => (
    <div key={op.id} className="operation-block">
        <div className="operation-header">
            <h3>Operation: {op.name || 'New Operation'}</h3>
            {form.operations.length > 1 && (
                <button type="button" className="remove-op-btn" onClick={() => handleRemoveOperation(op.id)}>Remove Operation</button>
            )}
        </div>
        <div className="input-row">
            <div className="input-group">
                <label>Operation Name</label>
                <input type="text" name="name" value={op.name} onChange={(e) => handleOperationChange(op.id, e)} required />
            </div>
            <div className="input-group">
                <label>Operation Description</label>
                <textarea name="description" value={op.description} onChange={(e) => handleOperationChange(op.id, e)} rows="1" />
            </div>
        </div>
        <div className="checkpoints-section">
            <h4>Checkpoints ({op.checkpoints.length})</h4>
            {op.checkpoints.map(chk => renderCheckpointForm(op.id, chk))}
            <div className="checkpoint-actions-row">
              <button type="button" className="add-checkpoint-btn" onClick={() => handleAddCheckpoint(op.id)}>+ Add Checkpoint</button>
              {op.checkpoints.length > 1 && (
                  <button type="button" className="remove-checkpoint-btn-aligned" onClick={() => handleRemoveCheckpoint(op.id, op.checkpoints[op.checkpoints.length - 1].id)}>× Remove Last</button>
              )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="add-department-container"> 
      <div className="add-department-card">
        <h1 className="add-department-title">Create Department Template</h1>
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="add-department-form">
          <h2>Department Metadata</h2>
          <div className="input-group">
            <label>Department Name</label>
            <input type="text" name="name" value={form.name} onChange={handleRootChange} required />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleRootChange} rows="2" required />
          </div>
          
          <div className="input-row">
            <div className="input-group">
                <label>Department Head</label>
                {/* DROPDOWN ADDED HERE */}
                <select 
                    name="departmentHead" 
                    value={form.departmentHead} 
                    onChange={handleRootChange}
                >
                    <option value="">-- Select Available Head --</option>
                    {availableHeads.map((head) => (
                        <option key={head._id} value={head._id}>
                            {head.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="input-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleRootChange}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                </select>
            </div>
          </div>
          
          <h2 style={{ marginTop: '2rem' }}>Workflow Operations ({form.operations.length})</h2>
          <div className="operations-list">
            {form.operations.map(renderOperationForm)}
          </div>

          <button type="button" className="add-operation-btn" onClick={handleAddOperation}>+ Add New Operation Block</button>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Department Template"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/departments")}>Cancel</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .add-department-container { min-height: 100vh; display: flex; justify-content: center; align-items: center; background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a); padding: 2rem 1rem; }
        .add-department-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.15); padding: 2.5rem; border-radius: 20px; width: 100%; max-width: 800px; color: #f8fafc; }
        .add-department-title { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; background: linear-gradient(90deg, #4ade80, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; }
        h2 { font-size: 1.5rem; color: #60a5fa; border-bottom: 1px solid rgba(96, 165, 250, 0.3); padding-bottom: 0.5rem; margin-top: 1rem; margin-bottom: 1.5rem; }
        .add-department-form { display: flex; flex-direction: column; gap: 1.2rem; }
        .input-group { display: flex; flex-direction: column; text-align: left; width: 100%; }
        .input-row { display: flex; gap: 1.5rem; align-items: flex-start; }
        .input-group label { margin-bottom: 0.4rem; color: #e2e8f0; font-weight: 500; font-size: 0.95rem; }
        input, textarea, select { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; padding: 0.75rem; font-size: 0.95rem; color: white; outline: none; }
        select option { background: #1e1b4b; color: white; }
        input:focus, select:focus { border-color: #818cf8; }
        .operation-block { border: 1px solid rgba(167, 139, 250, 0.2); border-radius: 12px; padding: 1.5rem; background: rgba(167, 139, 250, 0.05); margin-bottom: 1.5rem; }
        .operation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .remove-op-btn { background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 8px; cursor: pointer; }
        .checkpoint-form { border: 1px solid rgba(96, 165, 250, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: rgba(96, 165, 250, 0.05); }
        .checkbox-group { display:flex; flex-direction: row !important; align-items: center; gap: 10px; margin-top: 10px; min-width:0; }
        .checkbox-group .switch { display:flex; align-items:center; gap:12px; cursor:pointer; padding:4px 6px; }
        .checkbox-group .switch input { display:none; }
        .checkbox-group .switch .switch-slider { width:40px; height:22px; background:#334155; border-radius:999px; position:relative; transition:0.18s ease; flex-shrink:0; }
        .checkbox-group .switch .switch-slider::after { content:''; position:absolute; width:18px; height:18px; background:#fff; border-radius:50%; top:2px; left:2px; transition:0.18s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
        .checkbox-group .switch input:checked + .switch-slider { background:#10b981; }
        .checkbox-group .switch input:checked + .switch-slider::after { transform: translateX(18px); }
        .checkbox-group .switch .switch-label { color:#e2e8f0; font-weight:600; margin-left:8px; white-space:nowrap; }

        .checkpoint-actions-row { display: flex; gap: 1rem; margin-top: 1rem; }
        .add-checkpoint-btn { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #4ade80; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; }
        .remove-checkpoint-btn-aligned { background: #f97316; color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; }
        .add-operation-btn { width: 100%; background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #4ade80; padding: 0.8rem; border-radius: 8px; cursor: pointer; margin-bottom: 1rem; }
        .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
        /* Make both buttons equal width and responsive */
        .form-actions .submit-btn,
        .form-actions .cancel-btn { flex: 1 1 0; min-width: 0; padding: 0.8rem; border-radius: 12px; font-weight: 600; }
        .submit-btn { background: linear-gradient(90deg, #10b981, #34d399); border: none; color: white; cursor: pointer; }
        /* Cancel button styled red */
        .cancel-btn { background: linear-gradient(90deg, #ef4444, #dc2626); border: none; color: white; cursor: pointer; }
        .cancel-btn:hover { opacity: 0.95; }
        .error-text { color: #fca5a5; text-align: center; }
      `}</style>
    </div>
  );
}