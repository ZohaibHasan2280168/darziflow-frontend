import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from '../../../../components/ui/AlertProvider';
import { FiPlusCircle, FiArrowLeft, FiLayers } from "react-icons/fi";
import api from '../../../../services/reqInterceptor';

export default function OperationAdd() {
  const { deptId: paramDeptId } = useParams();
  const deptId = paramDeptId || localStorage.getItem('currentDeptId');
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (!deptId) {
        showAlert({ title: 'Missing Context', message: 'Missing department context. Please open the department first.', type: 'error' });
        setLoading(false);
        return;
      }

      const url = `/departments/${deptId}/operations`;
      await api.post(url, form);
      showAlert({ title: 'Success', message: 'Operation created successfully!', type: 'success' });
      navigate(-1);
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || "Creation failed", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <button onClick={() => navigate(-1)} className="btn-back"><FiArrowLeft /> Back</button>
        <div className="form-header">
          <div className="icon-box blue"><FiLayers /></div>
          <h1>Add Operation</h1>
          <p>Define a new workflow step for this department</p>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-group">
            <label>Operation Name</label>
            <input 
              type="text" 
              placeholder="e.g. Quality Check"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              placeholder="What happens in this operation?"
              rows="4"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating..." : <><FiPlusCircle /> Create Operation</>}
          </button>
        </form>
      </div>
      
      <style jsx>{`
        /* Ensure inputs remain readable while typing */
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
          background: #0f172a; /* keep dark */
          color: #f8fafc;      /* keep text white */
          caret-color: #ffffff;
          border-color: #3b82f6;
          outline: none;
        }
      `}</style>
    </div>
  );
}