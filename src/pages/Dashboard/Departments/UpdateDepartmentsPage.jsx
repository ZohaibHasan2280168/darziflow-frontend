import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import api from "../../../services/reqInterceptor";
import { useAlert } from '../../../components/ui/AlertProvider';
import Loader from '../../../components/ui/Loader';
import './UpdateDepartment.css';

export default function UpdateDepartments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    name: "",
    description: "",
    departmentHead: "", 
    status: "ACTIVE",
    operations: [],
  });

  const [availableHeads, setAvailableHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      setFetching(true);
      try {
        // Fetch available department heads
        const headsRes = await api.get(`/users/available-department-heads`);
        setAvailableHeads(headsRes.data.data || []);

        // Fetch department details
        const deptRes = await api.get(`/departments/${id}`);
        const d = deptRes.data.data || deptRes.data;

        setForm({
          name: d.name || "",
          description: d.description || "",
          departmentHead: (d.departmentHead && typeof d.departmentHead === 'object') 
            ? d.departmentHead._id 
            : (d.departmentHead || ""),
          status: d.status || "ACTIVE",
          operations: d.operations || [],
        });
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load department data. Please try again.";
        setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        showAlert({ 
          title: 'Error', 
          message: 'Failed to load department details', 
          type: 'error' 
        });
      } finally {
        setFetching(false);
      }
    };
    loadInitialData();
  }, [id]);

  const handleRootChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.name.trim()) {
      setError("Department name is required");
      setLoading(false);
      return;
    }

    if (!form.departmentHead) {
      setError("Please select a department head");
      setLoading(false);
      return;
    }

    const requestBody = {
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      departmentHead: form.departmentHead
    };

    try {
      await api.put(`/departments/${id}`, requestBody);
      showAlert({ 
        title: 'Success', 
        message: `Department "${form.name}" updated successfully!`, 
        type: 'success' 
      });
      navigate("/departments");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update department";
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
      showAlert({ 
        title: 'Error', 
        message: 'Failed to update department', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader label="Loading Department Details..." />;

  return (
    <div className="update-departments-container-wrapper">
      <div className="update-departments-card">
        <div className="update-departments-header-container">
          <button 
            className="update-departments-back-btn"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <FiArrowLeft size={20} />
            <span>Back to Departments</span>
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="update-departments-title">Edit Department</h1>
          <p className="update-departments-title-subtext">
            Update department details and settings
          </p>
        </div>
        
        {error && <div className="update-departments-error-text">{error}</div>}

        <form onSubmit={handleSubmit} className="update-departments-form">
          <div className="update-departments-form-section">
            <h3>Basic Information</h3>
            
            <div className="update-departments-input-group">
              <label>Department Name</label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleRootChange} 
                required 
                placeholder="Enter department name"
              />
            </div>

            <div className="update-departments-input-group">
              <label>Description</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleRootChange} 
                rows="3" 
                placeholder="Describe the department's purpose and responsibilities"
              />
            </div>
          </div>

          <div className="update-departments-form-section">
            <h3>Settings</h3>
            
            <div className="update-departments-input-row">
              <div className="update-departments-input-group">
                <label>Department Head</label>
                <select 
                  name="departmentHead" 
                  value={form.departmentHead} 
                  onChange={handleRootChange}
                  className="update-departments-custom-select"
                >
                  <option value="">-- Select Department Head --</option>
                  {availableHeads.map((head) => (
                    <option key={head._id} value={head._id}>
                      {head.name} {head.email ? `(${head.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="update-departments-input-group">
                <label>
                  Status
                  <span className={`update-departments-status-indicator ${form.status.toLowerCase()}`}>
                    {form.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </label>
                <select name="status" value={form.status} onChange={handleRootChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {form.operations && form.operations.length > 0 && (
            <div className="update-departments-info-section">
              <div>
                <p>
                  <strong>Note:</strong> This department has {form.operations.length} workflow 
                  {form.operations.length === 1 ? ' operation' : ' operations'} configured.
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                  Operations can only be edited through the department template interface.
                </p>
              </div>
            </div>
          )}

          <div className="update-departments-form-actions">
            <button 
              type="submit" 
              className="update-departments-save-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="update-departments-spinning">⏳</span> Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button 
              type="button" 
              className="update-departments-cancel-btn"
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