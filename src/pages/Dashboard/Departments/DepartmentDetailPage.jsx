import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from '../../../components/ui/AlertProvider';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { 
  FiEdit, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, 
  FiCheckCircle, FiUser, FiActivity, FiArrowLeft } from "react-icons/fi";
import api from '../../../services/reqInterceptor';
import Loader from '../../../components/ui/Loader';


export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // States
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOps, setExpandedOps] = useState({});


  const fetchDeptDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/departments/${id}`);
      setDept(res.data.data || res.data);
    } catch (err) {
      setError("Failed to load department details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeptDetails();
  }, [fetchDeptDetails]);

  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

  const _sanitizeMessage = (raw) => {
    if (raw === undefined || raw === null) return '';
    let s = raw;
    if (typeof s === 'object') {
      try { s = JSON.stringify(s); } catch(e) { s = String(s); }
    }
    s = String(s);
    s = s.replace(/https?:\/\/[^\s)]+/g, '');
    s = s.replace(/localhost(?::\d+)?/g, '');
    s = s.replace(/http:\/\//g, '').replace(/https:\/\//g, '');
    s = s.replace(/\s+/g, ' ').trim();
    if (!s) return 'Are you sure?';
    if (s.length > 300) s = s.slice(0, 300) + '...';
    return s;
  };  

  const showConfirm = (title, message, onConfirm) => {
    setConfirmState({ open: true, title, message: _sanitizeMessage(message), onConfirm });
  };

  const closeConfirm = () => setConfirmState({ open: false, title: '', message: '', onConfirm: null });

  const handleDeleteDept = () => {
    showConfirm('Delete Department', 'Are you sure? This will delete the entire department!', async () => {
      try {
        await api.delete(`/departments/${id}`);

        showAlert({ title: 'Deleted', message: 'Department deleted successfully', type: 'success' });
        closeConfirm();
        navigate("/departments");
      } catch (err) {
        closeConfirm();
        showAlert({ title: 'Error', message: 'Error deleting department', type: 'error' });
      }
    });
  };

  const handleDeleteOperation = (opId) => {
    showConfirm('Delete Operation', 'Are you sure you want to delete this operation?', async () => {
      try {
        await api.delete(`/departments/${id}/operations/${opId}`);

        closeConfirm();
        showAlert({ title: 'Deleted', message: 'Operation removed', type: 'success' });
        fetchDeptDetails();
      } catch (err) {
        closeConfirm();
        showAlert({ title: 'Error', message: 'Error deleting operation', type: 'error' });
      }
    });
  };

  const handleDeleteCheckpoint = (opId, chkId) => {
    showConfirm('Delete Checkpoint', 'Are you sure you want to delete this checkpoint?', async () => {
      try {
        await api.delete(`/departments/${id}/operations/${opId}/checkpoints/${chkId}`);
        closeConfirm();
        showAlert({ title: 'Deleted', message: 'Checkpoint removed', type: 'success' });
        fetchDeptDetails();
      } catch (err) {
        closeConfirm();
        showAlert({ title: 'Error', message: 'Error deleting checkpoint', type: 'error' });
      }
    });
  };

  const saveContextInStorage = (deptId, opId) => {
    try {
      localStorage.setItem('currentDeptId', deptId);
      localStorage.setItem('currentOpId', opId);
    } catch (e) { /* ignore write errors */ }
  };

  const toggleExpand = (opId) => {
    setExpandedOps(prev => {
      const next = !prev[opId];
      if (next) saveContextInStorage(id, opId);
      return { ...prev, [opId]: next };
    });
  };

if (loading) return <Loader label="Loading Department Details..." />;
  if (error) return <div className="error-screen">{error}</div>;
  if (!dept) return null;

  return (
    <div className="detail-container">
      {/* --- SEGMENT 1: DEPARTMENT --- */}
      <section className="segment-card dept-main">
        <button onClick={() => navigate(-1)} className="btn-back"><FiArrowLeft /> Back</button>
        <div className="segment-header">
          <div>
            <h1 className="title">{dept.name}</h1>
            <p className="description">{dept.description || "No description provided."}</p>
          </div>
          <div className="action-btns">
            <button onClick={() => navigate(`/update-department/${id}`)} className="btn-edit">
              <FiEdit /> Edit Department
            </button>
            <button onClick={handleDeleteDept} className="btn-delete">
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>

        <div className="meta-grid">
          <div className="meta-item">
            <FiUser className="icon" />
            <div>
              <label>Department Head</label>
              {/* FIX: Object rendering error solution */}
              <span>{typeof dept.departmentHead === 'object' ? dept.departmentHead.name : (dept.departmentHead || "Not Assigned")}</span>
            </div>
          </div>
          <div className="meta-item">
            <FiActivity className="icon" />
            <div>
              <label>Status</label>
              <span className={`status-badge ${dept.status}`}>{dept.status}</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEGMENT 2: OPERATIONS --- */}
      <section className="segment-container">
        <div className="section-title-bar">
          <h2> Workflow Operations</h2>
          <button className="btn-add-sm" onClick={() => navigate(`/departments/${id}/add-operation`)}>
            <FiPlus /> Add Operation
          </button>
        </div>

        <div className="ops-list">
          {dept.operations?.length === 0 && <p className="empty-text">No operations found in this department.</p>}
          
          {dept.operations?.map((op) => (
            <div key={op._id} className="op-card">
              <div className="op-header">
                <div className="op-info" onClick={() => toggleExpand(op._id)}>
                  {expandedOps[op._id] ? <FiChevronUp /> : <FiChevronDown />}
                  <h3>{op.name}</h3>
                </div>
                <div className="op-actions">
                  <button className="btn-icon" title="Edit Operation" onClick={() => { saveContextInStorage(id, op._id); navigate(`/edit-operation/${op._id}`); }}><FiEdit /></button>
                  <button className="btn-icon delete" title="Delete Operation" onClick={() => handleDeleteOperation(op._id)}><FiTrash2 /></button>
                </div>
              </div>

              {/* --- SEGMENT 3: CHECKPOINTS (Nested) --- */}
              {expandedOps[op._id] && (
                <div className="checkpoint-segment">
                  <div className="chk-header">
                    <h4>Checkpoints</h4>
                    <button className="btn-add-xs" onClick={() => { saveContextInStorage(id, op._id); navigate(`/departments/${id}/operations/${op._id}/add-checkpoint`); }}>
                      <FiPlus /> New Checkpoint
                    </button>
                  </div>
                  
                  <div className="chk-grid">
                    {op.checkpoints?.length === 0 ? (
                      <p className="empty-text-sm">No checkpoints added yet.</p>
                    ) : (
                      op.checkpoints?.map((chk) => (
                        <div key={chk._id} className="chk-item">
                          <div className="chk-info">
                            <FiCheckCircle className="chk-icon" />
                            <div>
                              <p className="chk-name">{chk.name}</p>
                              <p className="chk-types">{chk.allowedSubmissionTypes?.join(", ")}</p>
                            </div>
                          </div>
                          <div className="chk-actions">
                            <button className="btn-icon-xs" onClick={() => { saveContextInStorage(id, op._id); navigate(`/departments/${id}/operations/${op._id}/edit-checkpoint/${chk._id}`); }}><FiEdit /></button>
                            <button className="btn-icon-xs delete" onClick={() => handleDeleteCheckpoint(op._id, chk._id)}><FiTrash2 /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .detail-container { padding: 30px; background: #0f172a; min-height: 100vh; color: #f8fafc; font-family: 'Inter', sans-serif; }
        
        /* Segment 1: Dept Card */
        .segment-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 30px; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .segment-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
        .title { font-size: 32px; font-weight: 700; color: #60a5fa; margin: 0; }
        .description { color: #94a3b8; margin-top: 6px; margin-bottom: 12px; font-size: 16px; max-width: 800px; }
        
        .action-btns { display: flex; gap: 12px; }
        .btn-edit, .btn-delete { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; }
        .btn-edit { background: #3b82f6; color: white; }
        .btn-edit:hover { background: #2563eb; }
        .btn-delete { background: #ef44441a; color: #f87171; border: 1px solid #ef44444d; }
        .btn-delete:hover { background: #ef4444; color: white; }

        /* Back button (top-left) */
        .btn-back { background: transparent; color: #60a5fa; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 12px; }

        .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; border-top: 1px solid #334155; padding-top: 16px; margin-top: 16px; margin-bottom: 24px; }
        .meta-item { display: flex; align-items: center; gap: 12px; }
        .meta-item label { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .meta-item span { font-weight: 600; color: #cbd5e1; }
        .icon { font-size: 20px; color: #60a5fa; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-badge.ACTIVE { background: #10b9811a; color: #34d399; }
        .status-badge.INACTIVE { background: #f59e0b1a; color: #fbbf24; }

        /* Segment 2: Operations */
        .section-title-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; margin-bottom: 20px; }
        .btn-add-sm { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; }
        
        .op-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; margin-bottom: 15px; overflow: hidden; }
        .op-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: #243146; }
        .op-info { display: flex; align-items: center; gap: 15px; cursor: pointer; flex: 1; }
        .op-info h3 { margin: 0; font-size: 18px; color: #e2e8f0; }
        .op-actions { display: flex; gap: 8px; }

        /* Segment 3: Checkpoints */
        .checkpoint-segment { background: #0f172a; padding: 20px; border-top: 1px solid #334155; }
        .chk-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .chk-header h4 { margin: 0; font-size: 14px; color: #94a3b8; text-transform: uppercase; }
        .btn-add-xs { background: transparent; color: #60a5fa; border: 1px dashed #60a5fa; padding: 4px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; }

        .chk-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .chk-item { display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 12px 16px; border-radius: 8px; border: 1px solid #334155; }
        .chk-info { display: flex; align-items: center; gap: 12px; }
        .chk-icon { color: #10b981; }
        .chk-name { margin: 0; font-weight: 500; font-size: 14px; }
        .chk-types { margin: 0; font-size: 11px; color: #64748b; }
        .chk-actions { display: flex; gap: 8px; }

        /* Buttons & Extras */
        .btn-icon, .btn-icon-xs { background: #334155; color: #cbd5e1; border: none; padding: 8px; border-radius: 6px; cursor: pointer; }
        .btn-icon.delete:hover { background: #ef4444; color: white; }
        .btn-icon-xs { padding: 4px; font-size: 14px; }
        .empty-text { color: #64748b; text-align: center; padding: 40px; }
        .empty-text-sm { color: #475569; font-size: 13px; font-style: italic; }
      `}</style>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={closeConfirm}
        onConfirm={() => { if (typeof confirmState.onConfirm === 'function') confirmState.onConfirm(); }}
      />
    </div>
  );
}