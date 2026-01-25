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
    <div className="form-container operation-add-page">
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
              className="operation-add-input"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              placeholder="What happens in this operation?"
              rows="4"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="operation-add-textarea"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating..." : <><FiPlusCircle /> Create Operation</>}
          </button>
        </form>
      </div>
      
      <style jsx>{`
        /* Add a unique class to the page container for scoping */
        .operation-add-page .modern-form input.operation-add-input,
        .operation-add-page .modern-form textarea.operation-add-textarea {
          background: #0f172a !important;
          border: 1px solid #334155 !important;
          color: #f8fafc !important;
          caret-color: #ffffff !important;
        }

        .operation-add-page .modern-form input.operation-add-input::placeholder,
        .operation-add-page .modern-form textarea.operation-add-textarea::placeholder {
          color: #94a3b8 !important;
        }

        .operation-add-page .modern-form input.operation-add-input:focus,
        .operation-add-page .modern-form textarea.operation-add-textarea:focus {
          background: #0f172a !important;
          color: #f8fafc !important;
          caret-color: #ffffff !important;
          border-color: #3b82f6 !important;
          outline: none !important;
        }

        /* More specific selector that will override :root.light */
        :global(:root.light) .operation-add-page .modern-form input.operation-add-input,
        :global(:root.light) .operation-add-page .modern-form textarea.operation-add-textarea {
          color: #f8fafc !important;
        }

        :global(:root.light) .operation-add-page .modern-form input.operation-add-input:focus,
        :global(:root.light) .operation-add-page .modern-form textarea.operation-add-textarea:focus {
          color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}