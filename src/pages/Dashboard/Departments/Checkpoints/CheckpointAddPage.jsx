import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from '../../../../components/ui/AlertProvider';
import { FiCheckCircle, FiArrowLeft, FiPlus } from "react-icons/fi";
import api from '../../../../services/reqInterceptor';

export default function CheckpointAdd() {
  const { deptId: paramDeptId, opId: paramOpId } = useParams();
  const deptId = paramDeptId || localStorage.getItem('currentDeptId');
  const opId = paramOpId || localStorage.getItem('currentOpId');
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    allowedSubmissionTypes: ["TEXT"],
    minRequiredUploads: 1,
    isOptional: false,
    qcRequired: false
  });

  const subTypes = ["TEXT", "IMAGE", "VIDEO", "DOCUMENT"];

  const toggleType = (type) => {
    setForm(prev => ({
      ...prev,
      allowedSubmissionTypes: prev.allowedSubmissionTypes.includes(type)
        ? prev.allowedSubmissionTypes.filter(t => t !== type)
        : [...prev.allowedSubmissionTypes, type]
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (!deptId || !opId) {
    showAlert({ title: 'Missing Context', message: 'Missing department or operation context. Please open the department and select an operation first.', type: 'error' });
    setLoading(false);
    return;
  }


  try {
    const payload = { ...form, minRequiredUploads: Number(form.minRequiredUploads) };

    // Client-side validation
    if (!payload.name || payload.name.trim() === "") {
      showAlert({ title: 'Validation', message: 'Checkpoint name is required.', type: 'error' });
      setLoading(false);
      return;
    }
    if (!Array.isArray(payload.allowedSubmissionTypes) || payload.allowedSubmissionTypes.length === 0) {
      showAlert({ title: 'Validation', message: 'Select at least one submission type.', type: 'error' });
      setLoading(false);
      return;
    }
    if (Number.isNaN(payload.minRequiredUploads) || payload.minRequiredUploads < 0) {
      showAlert({ title: 'Validation', message: 'Min uploads must be a non-negative number.', type: 'error' });
      setLoading(false);
      return;
    }

  const url = `/departments/${deptId}/operations/${opId}/checkpoints`;
     const res = await api.post(url, payload);

    console.log('Create response', res.data);
    showAlert({ title: 'Success', message: 'Checkpoint created!', type: 'success' });
    navigate(-1);
  } catch (err) {
    console.error('Error creating checkpoint', err);
    const status = err.response?.status;
    let serverMessage = err.response?.data?.message || err.response?.data || err.message || 'Creation failed';
    if (typeof serverMessage === 'object') {
      try { serverMessage = JSON.stringify(serverMessage); } catch(e) { serverMessage = String(serverMessage); }
    }
    showAlert({ title: 'Error', message: `Error creating checkpoint${status ? ` (HTTP ${status})` : ''}: ${serverMessage}`, type: 'error' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="form-container">
      <div className="form-card wide">
        <button onClick={() => navigate(-1)} className="btn-back"><FiArrowLeft /> Back</button>
        <div className="form-header">
          <div className="icon-box green"><FiCheckCircle /></div>
          <h1>New Checkpoint</h1>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-group full">
            <label>Checkpoint Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div className="form-group full">
            <label>Description</label>
            <textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Submission Types</label>
            <div className="chip-group">
              {subTypes.map(t => (
                <div key={t} className={`chip ${form.allowedSubmissionTypes.includes(t) ? 'active' : ''}`} onClick={() => toggleType(t)}>{t}</div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Min Uploads</label>
            <input type="number" value={form.minRequiredUploads} onChange={e => setForm({...form, minRequiredUploads: parseInt(e.target.value)})} />
          </div>

          <div className="form-group checkbox-group full">
            <label className="switch">
              <input type="checkbox" checked={form.isOptional} onChange={e => setForm({...form, isOptional: e.target.checked})} />
              <span className="switch-slider" aria-hidden="true"></span>
              <span className="switch-label">Is Optional</span>
            </label>
            <label className="switch">
              <input type="checkbox" checked={form.qcRequired} onChange={e => setForm({...form, qcRequired: e.target.checked})} />
              <span className="switch-slider" aria-hidden="true"></span>
              <span className="switch-label">QC Required</span>
            </label>
          </div>

          <button type="submit" className="btn-submit green-btn full" disabled={loading}>
            {loading ? "Adding..." : <><FiPlus /> Add Checkpoint</>}
          </button>
        </form>
      </div>
      
      <style jsx>{`
        /* Checkpoint form visuals: keep dark bg + white text while typing */
        .modern-form { display: flex; flex-direction: column; gap: 12px; }
        .modern-form .form-group { display: flex; flex-direction: column; gap: 8px; }
        .modern-form .form-group.full { width: 100%; }

        .modern-form input,
        .modern-form textarea {
          background: #0f172a;
          border: 1px solid #334155;
          color: #f8fafc;
          caret-color: #ffffff;
          padding: 10px 14px;
          border-radius: 10px;
        }

        .modern-form input::placeholder,
        .modern-form textarea::placeholder { color: #94a3b8; }

        .modern-form input:focus,
        .modern-form textarea:focus {
          background: #0f172a;
          color: #f8fafc;
          caret-color: #ffffff;
          border-color: #3b82f6;
          outline: none;
        }

        .modern-form .chip { min-width: 54px; text-align: center; }

        /* checkbox alignment: keep switches in a single row with equal halves (use flex-basis to prevent wrapping) */
        .modern-form .checkbox-group { display:flex; flex-direction:row; gap:24px; align-items:center; justify-content:flex-start; flex-wrap:nowrap; width:100%; min-width:0; }
        .modern-form .checkbox-group.full { display:flex; flex-direction:row; gap:24px; align-items:center; justify-content:flex-start; flex-wrap:nowrap; width:100%; min-width:0; }

        /* Styled toggle switch - use flex to force exact halves and prevent wrapping */
        .modern-form .switch { flex: 0 0 50%; min-width:0; display:flex; align-items:center; gap:12px; justify-content:flex-start; cursor:pointer; padding:6px 8px; box-sizing:border-box; margin:0; }
        .modern-form .switch input { display:none; }
        .modern-form .switch .switch-slider { width:44px; height:24px; background:#334155; border-radius:999px; position:relative; transition:0.18s ease; flex-shrink:0; }
        .modern-form .switch .switch-slider::after { content:''; position:absolute; width:18px; height:18px; background:#fff; border-radius:50%; top:3px; left:3px; transition:0.18s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
        .modern-form .switch input:checked + .switch-slider { background:#10b981; }
        .modern-form .switch input:checked + .switch-slider::after { transform: translateX(20px); }
        .modern-form .switch .switch-label { color:#cbd5e1; font-weight:600; margin-left:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        /* Responsive: stack on small screens */
        @media (max-width: 640px) {
          .modern-form .checkbox-group.full { flex-direction: column; gap:12px; }
          .modern-form .switch { flex: 0 0 100%; justify-content:flex-start; }
        }
      `}</style>
    </div>
  );
}