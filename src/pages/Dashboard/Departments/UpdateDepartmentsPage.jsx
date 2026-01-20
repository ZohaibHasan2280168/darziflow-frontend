import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/reqInterceptor";
import { useAlert } from '../../../components/ui/AlertProvider';
import Loader from '../../../components/ui/Loader';


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
        const headsRes = await api.get(`/users/available-department-heads`);
        setAvailableHeads(headsRes.data.data || []);

        const deptRes = await api.get(`/departments/${id}`);

        const d = deptRes.data.data || deptRes.data;

        setForm({
          name: d.name || "",
          description: d.description || "",
          // FIX: Agar departmentHead ek object hai, to uski ID nikalein, warna direct use karein
          departmentHead: (d.departmentHead && typeof d.departmentHead === 'object') 
            ? d.departmentHead._id 
            : (d.departmentHead || ""),
          status: d.status || "ACTIVE",
          operations: d.operations || [],
        });
      } catch (err) {
        // Safety: Error ko string mein convert karein
        const msg = err.response?.data?.message || "Data fetch fail ho gaya.";
        setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
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

    const requestBody = {
      name: form.name,
      description: form.description,
      status: form.status,
      departmentHead: form.departmentHead // Yeh sirf string ID bhej raha hai
    };

    try {
      await api.put(`/departments/${id}`, requestBody);
      showAlert({ title: 'Success', message: 'Department successfully updated!', type: 'success' });
      navigate("/departments");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader label="Loading Department Details..." />;

  return (
    <div className="update-container">
      <div className="update-card">
        <h1 className="update-title">Edit Department</h1>
        
        {/* Safety: Error display mein kabhi object render nahi hoga */}
        {error && <p className="error-box">{String(error)}</p>}

        <form onSubmit={handleSubmit} className="update-form">
          <div className="input-group">
            <label>Department Name</label>
            <input type="text" name="name" value={form.name} onChange={handleRootChange} required />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleRootChange} rows="3" />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Department Head</label>
              <select 
                name="departmentHead" 
                value={form.departmentHead} 
                onChange={handleRootChange}
                className="custom-select"
              >
                <option value="">-- Select Available Head --</option>
                {availableHeads.map((head) => (
                  <option key={head._id} value={head._id}>
                    {head.name} {/* Yahan name print ho raha hai jo ke string hai */}
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

          {/* <div className="info-section">
             <p>ℹ️ <strong>Backend Info:</strong> Operations cannot be edited directly here due to schema constraints.</p>
          </div> */}

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Update Department"}
            </button>
            <button type="button" className="back-btn" onClick={() => navigate("/departments")}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .update-container { min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #0f172a; padding: 20px; font-family: sans-serif; }
        .update-card { background: #1e293b; border: 1px solid #334155; padding: 40px; border-radius: 16px; width: 100%; max-width: 650px; }
        .update-title { color: #60a5fa; margin-bottom: 30px; text-align: center; }
        .update-form { display: flex; flex-direction: column; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        label { color: #94a3b8; font-size: 14px; }
        input, textarea, select { background: #0f172a; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; }
        .save-btn { background: #3b82f6; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .back-btn { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 14px; border-radius: 8px; cursor: pointer; }
        .error-box { background: rgba(239, 68, 68, 0.1); color: #f87171; padding: 15px; border-radius: 8px; border: 1px solid #ef4444; margin-bottom: 20px; }
        .info-section { background: rgba(96, 165, 250, 0.1); padding: 10px; border-radius: 8px; color: #cbd5e1; font-size: 13px; }
        .form-actions { display: grid; grid-template-columns: 2fr 1fr; gap: 15px; }
      `}</style>
    </div>
  );
}