import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from '../../../../components/ui/AlertProvider';
import { FiEdit3, FiArrowLeft, FiSave } from "react-icons/fi";
import api from '../../../../services/reqInterceptor';


export default function OperationEdit() {
  const params = useParams();
  const { opId } = params;
  const deptId = params.deptId || localStorage.getItem('currentDeptId');
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    
    const loadOperation = async () => {
      const dept = deptId || localStorage.getItem('currentDeptId');
      if (!dept) return; // rely on localStorage fallback
      try {
        const res = await api.get(`/departments/${dept}`);
        const department = res.data.data || res.data;
        const op = department.operations.find(o => o._id.toString() === opId);
        if (!op) return;
        setForm({ name: op.name || "", description: op.description || "" });
      } catch (err) {
        console.error('Failed to load operation data', err);
      }
    };

    loadOperation();
  }, [opId, deptId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!deptId) {
        showAlert({ title: 'Missing Context', message: 'Missing department context. Please open the department first.', type: 'error' });
        setLoading(false);
        return;
      }

      const url = `/departments/${deptId}/operations/${opId}`;
      await api.put(url, form);
      showAlert({ title: 'Success', message: 'Operation updated!', type: 'success' });
      navigate(-1);
    } catch (err) {
      console.error('OperationEdit error', err);
      const status = err.response?.status;
      let serverMessage = err.response?.data?.message || err.response?.data || err.message || 'Update failed';
      if (typeof serverMessage === 'object') {
        try { serverMessage = JSON.stringify(serverMessage); } catch(e) { serverMessage = String(serverMessage); }
      }
      showAlert({ title: 'Error', message: `Update failed${status ? ` (HTTP ${status})` : ''}: ${serverMessage}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <button onClick={() => navigate(-1)} className="btn-back"><FiArrowLeft /> Back</button>
        <div className="form-header">
          <div className="icon-box orange"><FiEdit3 /></div>
          <h1>Edit Operation</h1>
          <p>Modify operation details and workflow name</p>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-group">
            <label>Operation Name</label>
            <input 
              type="text" 
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows="4"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-submit orange-btn" disabled={loading}>
            {loading ? "Saving..." : <><FiSave /> Save Changes</>}
          </button>
        </form>
      </div>

      <style jsx>{`
        /* Make sure operation edit inputs keep dark bg and white text while typing */
        .modern-form input,
        .modern-form textarea {
          background: #0f172a;
          border: 1px solid #334155;
          color: #f8fafc;
          caret-color: #ffffff;
        }

        .modern-form input::placeholder,
        .modern-form textarea::placeholder {
          color: #94a3b8;
        }

        .modern-form input:focus,
        .modern-form textarea:focus {
          background: #0f172a;
          color: #f8fafc;
          caret-color: #ffffff;
          border-color: #3b82f6;
          outline: none;
        }
      `}</style>
    </div>
  );
}