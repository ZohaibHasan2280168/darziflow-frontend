import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useAlert } from '../../../components/ui/AlertProvider';
import api from '../../../services/reqInterceptor';
import './AddDepartment.css';

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
  const [availableHeads, setAvailableHeads] = useState([]);
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
  const renderCheckpointForm = (opId, chk, chkIndex) => (
    <div key={chk.id} className="add-department-checkpoint-form">
      <div className="add-department-input-row">
        <div className="add-department-input-group">
          <label>Checkpoint Name</label>
          <input 
            type="text" 
            name="name" 
            value={chk.name} 
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)} 
            required 
            placeholder={`Checkpoint ${chkIndex + 1}`}
          />
        </div>
        <div className="add-department-input-group">
          <label>Min Required Uploads</label>
          <input 
            type="number" 
            name="minRequiredUploads" 
            value={chk.minRequiredUploads} 
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)} 
            min="0" 
            placeholder="1"
          />
        </div>
      </div>
      <div className="add-department-input-row add-department-input-row-small-fields">
        <div className="add-department-input-group add-department-checkbox-group">
          <label className="add-department-switch">
            <input 
              type="checkbox" 
              id={`qc-${chk.id}`} 
              name="qcRequired" 
              checked={chk.qcRequired} 
              onChange={(e) => handleCheckpointChange(opId, chk.id, e)} 
            />
            <span className="add-department-switch-slider" aria-hidden="true"></span>
            <span className="add-department-switch-label">
              {chk.qcRequired ? '✅ QC Required' : 'QC Required'}
            </span>
          </label>
        </div>
        <div className="add-department-input-group">
          <label>Submission Types</label>
          <input 
            type="text" 
            name="allowedSubmissionTypes" 
            value={chk.allowedSubmissionTypes.join(', ')} 
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)} 
            placeholder="DOCUMENT, IMAGE, TEXT, VIDEO"
          />
        </div>
      </div>
    </div>
  );

  const renderOperationForm = (op, opIndex) => (
    <div key={op.id} className="add-department-operation-block">
      <div className="add-department-operation-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="add-department-operation-number">
            {opIndex + 1}
          </div>
          <h3>Operation: {op.name || `Operation ${opIndex + 1}`}</h3>
        </div>
        {form.operations.length > 1 && (
          <button 
            type="button" 
            className="add-department-remove-op-btn"
            onClick={() => handleRemoveOperation(op.id)}
          >
            Remove
          </button>
        )}
      </div>
      <div className="add-department-input-row">
        <div className="add-department-input-group">
          <label>Operation Name</label>
          <input 
            type="text" 
            name="name" 
            value={op.name} 
            onChange={(e) => handleOperationChange(op.id, e)} 
            required 
            placeholder={`Enter operation ${opIndex + 1} name`}
          />
        </div>
        <div className="add-department-input-group">
          <label>Description</label>
          <textarea 
            name="description" 
            value={op.description} 
            onChange={(e) => handleOperationChange(op.id, e)} 
            rows="2" 
            placeholder="Brief description of this operation"
          />
        </div>
      </div>
      <div className="add-department-checkpoints-section">
        <h4>
          Checkpoints 
          <span className="add-department-count-badge">{op.checkpoints.length}</span>
        </h4>
        {op.checkpoints.map((chk, chkIndex) => renderCheckpointForm(op.id, chk, chkIndex))}
        <div className="add-department-checkpoint-actions-row">
          <button 
            type="button" 
            className="add-department-add-checkpoint-btn"
            onClick={() => handleAddCheckpoint(op.id)}
          >
            <span>+</span> Add Checkpoint
          </button>
          {op.checkpoints.length > 1 && (
            <button 
              type="button" 
              className="add-department-remove-checkpoint-btn"
              onClick={() => handleRemoveCheckpoint(op.id, op.checkpoints[op.checkpoints.length - 1].id)}
            >
              <span>×</span> Remove Last
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="add-department-container-wrapper">
      <div className="add-department-card">
        <div className="add-department-header-container">
          <button 
            className="add-department-back-btn"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <FiArrowLeft size={20} />
            <span>Back to Departments</span>
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="add-department-title">Create Department Template</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Define department workflow, operations, and checkpoints
          </p>
        </div>
        
        {error && <div className="add-department-error-text">{error}</div>}

        <form onSubmit={handleSubmit} className="add-department-form">
          <h2>Department Details</h2>
          
          <div className="add-department-input-group">
            <label>Department Name</label>
            <input 
              type="text" 
              name="name" 
              value={form.name} 
              onChange={handleRootChange} 
              required 
              placeholder="e.g., Graphic Design Department"
            />
          </div>

          <div className="add-department-input-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleRootChange} 
              rows="3" 
              required 
              placeholder="Describe the department's purpose and responsibilities"
            />
          </div>
          
          <div className="add-department-input-row">
            <div className="add-department-input-group">
              <label>Department Head</label>
              <select 
                name="departmentHead" 
                value={form.departmentHead} 
                onChange={handleRootChange}
              >
                <option value="">-- Select Department Head --</option>
                {availableHeads.map((head) => (
                  <option key={head._id} value={head._id}>
                    {head.name} {head.email ? `(${head.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="add-department-input-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleRootChange}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          
          <h2 style={{ marginTop: '2rem' }}>
            Workflow Operations
            <span className="add-department-count-badge">{form.operations.length}</span>
          </h2>
          
          <div className="add-department-operations-list">
            {form.operations.map((op, index) => renderOperationForm(op, index))}
          </div>

          <button 
            type="button" 
            className="add-department-add-operation-btn"
            onClick={handleAddOperation}
          >
            <span>+</span> Add Another Operation
          </button>
          
          <div className="add-department-form-actions">
            <button 
              type="submit" 
              className="add-department-submit-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="add-department-spinning">⏳</span> Creating Template...
                </>
              ) : (
                'Create Department Template'
              )}
            </button>
            <button 
              type="button" 
              className="add-department-cancel-btn"
              onClick={() => navigate("/departments")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}