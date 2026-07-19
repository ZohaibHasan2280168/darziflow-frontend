import { useState, useEffect } from "react";
import {
  FiX, FiDollarSign, FiCalendar, FiUpload, FiLoader,
  FiTrash2, FiPaperclip, FiMessageSquare, FiFileText, FiLayers, FiUser
} from "react-icons/fi";
import api from '../../services/reqInterceptor';
import uploadToCloudinary from '../../utils/uploadToCloudinary';
import { useAlert } from "../../components/ui/AlertProvider";
import './CreateOrderModal.css';

const AddProposalModal = ({ isOpen, onClose, requestId, userRole, onProposalAdded }) => {
  const { showAlert } = useAlert();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';

  // Department & QC member lists (admin only)
  const [departments, setDepartments] = useState([]);
  const [qcMembers, setQcMembers] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingQC, setLoadingQC] = useState(false);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    amount: "",
    dueDate: getTomorrowDate(),
    requiredDocs: [],
    departmentSequenceIds: [],
    qcMemberId: "",
    referenceFiles: [],
    remarks: ""
  });

  const [docInput, setDocInput] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Fetch departments and QC members when modal opens (admin only)
  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchDepartments();
      fetchQCMembers();
    }
    if (isOpen) {
      setForm({
        amount: "",
        dueDate: getTomorrowDate(),
        requiredDocs: [],
        departmentSequenceIds: [],
        qcMemberId: "",
        referenceFiles: [],
        remarks: ""
      });
      setDocInput("");
      setFormErrors({});
      setSubmitting(false);
      setUploadingFiles({});
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepts(true);
      const res = await api.get('/department');
      setDepartments(res.data.departments || res.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setLoadingDepts(false);
    }
  };

  const fetchQCMembers = async () => {
    try {
      setLoadingQC(true);
      const res = await api.get('/users?role=QC');
      setQcMembers(res.data.users || res.data || []);
    } catch (err) {
      console.error("Error fetching QC members:", err);
    } finally {
      setLoadingQC(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addDocType = () => {
    const trimmed = docInput.trim();
    if (!trimmed) return;
    if (form.requiredDocs.includes(trimmed)) return;
    setForm(prev => ({ ...prev, requiredDocs: [...prev.requiredDocs, trimmed] }));
    setDocInput("");
  };

  const removeDocType = (index) => {
    setForm(prev => ({
      ...prev,
      requiredDocs: prev.requiredDocs.filter((_, i) => i !== index)
    }));
  };

  const toggleDepartment = (deptId) => {
    setForm(prev => {
      const ids = [...prev.departmentSequenceIds];
      const idx = ids.indexOf(deptId);
      if (idx > -1) {
        ids.splice(idx, 1);
      } else {
        ids.push(deptId);
      }
      return { ...prev, departmentSequenceIds: ids };
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const tempId = `${file.name}_${Date.now()}`;
      setUploadingFiles(prev => ({ ...prev, [tempId]: true }));

      try {
        const result = await uploadToCloudinary(file, null, 'order-request');
        setForm(prev => ({
          ...prev,
          referenceFiles: [
            ...prev.referenceFiles,
            {
              fileName: file.name,
              fileUrl: result.url,
              publicId: result.publicId,
              resourceType: result.resourceType || 'auto'
            }
          ]
        }));
      } catch (err) {
        console.error("Upload failed:", err);
        showAlert({ title: "Upload Error", message: `Failed to upload ${file.name}`, type: "error" });
      } finally {
        setUploadingFiles(prev => {
          const copy = { ...prev };
          delete copy[tempId];
          return copy;
        });
      }
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    setForm(prev => ({
      ...prev,
      referenceFiles: prev.referenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        remarks: form.remarks.trim() || undefined
      };

      if (form.amount) payload.amount = Number(form.amount);
      if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString();
      if (form.requiredDocs.length > 0) payload.requiredDocs = form.requiredDocs;
      if (form.referenceFiles.length > 0) payload.referenceFiles = form.referenceFiles;

      // Admin-only fields
      if (isAdmin) {
        if (form.departmentSequenceIds.length > 0) payload.departmentSequenceIds = form.departmentSequenceIds;
        if (form.qcMemberId) payload.qcMemberId = form.qcMemberId;
      }

      await api.post(`/requests/${requestId}/proposals`, payload);
      onProposalAdded?.();
      onClose();
    } catch (err) {
      console.error("Error adding proposal:", err);
      showAlert({
        title: "Error",
        message: err.response?.data?.message || "Failed to submit proposal",
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isUploading = Object.keys(uploadingFiles).length > 0;

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{isAdmin ? 'Submit Proposal' : 'Counter Offer'}</h2>
            <p className="modal-subtitle">
              {isAdmin
                ? 'Define pricing, timeline, and workflow for this request'
                : 'Submit your counter-offer with preferred terms'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">
              <FiDollarSign size={14} style={{ marginRight: '6px' }} />
              Amount (PKR)
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 50000"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              min="0"
            />
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label">
              <FiCalendar size={14} style={{ marginRight: '6px' }} />
              Proposed Due Date
            </label>
            <input
              type="date"
              className="form-input"
              value={form.dueDate}
              min={getTomorrowDate()}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </div>

          {/* Required Docs (Admin) */}
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">
                <FiFileText size={14} style={{ marginRight: '6px' }} />
                Required Documents
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Invoice, QC Report"
                  value={docInput}
                  onChange={(e) => setDocInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDocType(); } }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addDocType}
                  style={{
                    padding: '10px 16px', borderRadius: '10px', border: 'none',
                    background: 'rgba(59, 130, 246, 0.12)', color: 'rgb(var(--color-primary))',
                    cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Add
                </button>
              </div>
              {form.requiredDocs.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {form.requiredDocs.map((doc, idx) => (
                    <span key={idx} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '5px 12px', background: 'rgba(59, 130, 246, 0.1)',
                      color: 'rgb(var(--color-primary))', borderRadius: '6px',
                      fontSize: '12px', fontWeight: '500'
                    }}>
                      {doc}
                      <button
                        type="button"
                        onClick={() => removeDocType(idx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Department Sequence (Admin) */}
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">
                <FiLayers size={14} style={{ marginRight: '6px' }} />
                Department Sequence
              </label>
              {loadingDepts ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <FiLoader size={14} className="spin-animation" /> Loading departments...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {departments.map(dept => {
                    const deptId = dept._id?.$oid || dept._id || dept.id;
                    const isSelected = form.departmentSequenceIds.includes(deptId);
                    return (
                      <label
                        key={deptId}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 14px', borderRadius: '8px',
                          border: `1px solid ${isSelected ? 'rgb(var(--color-primary))' : 'var(--border-light)'}`,
                          background: isSelected ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                          cursor: 'pointer', transition: 'all 0.15s ease', fontSize: '13px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDepartment(deptId)}
                          style={{ accentColor: 'rgb(var(--color-primary))' }}
                        />
                        <span style={{ color: 'var(--text-primary)', fontWeight: isSelected ? '600' : '400' }}>
                          {dept.name}
                        </span>
                      </label>
                    );
                  })}
                  {departments.length === 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No departments available</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* QC Member (Admin) */}
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">
                <FiUser size={14} style={{ marginRight: '6px' }} />
                QC Member
              </label>
              {loadingQC ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <FiLoader size={14} className="spin-animation" /> Loading QC members...
                </div>
              ) : (
                <select
                  className="form-input"
                  value={form.qcMemberId}
                  onChange={(e) => handleChange('qcMemberId', e.target.value)}
                >
                  <option value="">Select QC Member (optional)</option>
                  {qcMembers.map(member => {
                    const memberId = member._id?.$oid || member._id || member.id;
                    return (
                      <option key={memberId} value={memberId}>{member.name} ({member.email})</option>
                    );
                  })}
                </select>
              )}
            </div>
          )}

          {/* Reference Files */}
          <div className="form-group">
            <label className="form-label">
              <FiPaperclip size={14} style={{ marginRight: '6px' }} />
              Reference Files
            </label>
            <label
              className="form-input"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', justifyContent: 'center', padding: '14px',
                border: '2px dashed var(--border-light)', borderRadius: '10px',
                color: 'var(--text-muted)', transition: 'all 0.2s ease'
              }}
            >
              <FiUpload size={18} />
              <span style={{ fontSize: '13px' }}>Click to upload files</span>
              <input
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
              />
            </label>

            {isUploading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                <FiLoader size={14} className="spin-animation" />
                Uploading files...
              </div>
            )}

            {form.referenceFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {form.referenceFiles.map((file, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', background: 'var(--card-hover-bg)',
                    borderRadius: '8px', fontSize: '13px'
                  }}>
                    <FiPaperclip size={14} style={{ color: 'rgb(var(--color-primary))', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{file.fileName}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                        borderRadius: '6px', padding: '6px', cursor: 'pointer',
                        color: 'rgb(var(--color-accent-red))', display: 'flex'
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="form-group">
            <label className="form-label">
              <FiMessageSquare size={14} style={{ marginRight: '6px' }} />
              Remarks
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Add any notes or comments about this proposal..."
              value={form.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              style={{ resize: 'vertical', minHeight: '70px' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border-light)',
          display: 'flex', justifyContent: 'flex-end', gap: '12px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: '10px',
              border: '1px solid var(--border-light)', background: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px',
              fontWeight: '500', transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || isUploading}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-primary-hover)))',
              color: 'white', cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600', opacity: (submitting || isUploading) ? 0.6 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)'
            }}
          >
            {submitting ? 'Submitting...' : (isAdmin ? 'Submit Proposal' : 'Submit Counter Offer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProposalModal;
