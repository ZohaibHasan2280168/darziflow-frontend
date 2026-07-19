import { useState, useEffect } from "react";
import {
  FiX, FiFileText, FiCalendar, FiUpload, FiLoader, FiTrash2, FiPaperclip
} from "react-icons/fi";
import api from '../../services/reqInterceptor';
import uploadToCloudinary from '../../utils/uploadToCloudinary';
import { useAlert } from "../../components/ui/AlertProvider";
import './CreateOrderModal.css';

const garmentTypes = [
  { value: 'PANT', label: 'Pants' },
  { value: 'JACKET', label: 'Jacket' },
  { value: 'SHORTS', label: 'Shorts' },
  { value: 'OTHER', label: 'Other' }
];

const CreateOrderRequestModal = ({ isOpen, onClose, onRequestCreated }) => {
  const { showAlert } = useAlert();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    name: "",
    type: "PANT",
    description: "",
    targetDueDate: getTomorrowDate(),
    originalReferenceFiles: []
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        type: "PANT",
        description: "",
        targetDueDate: getTomorrowDate(),
        originalReferenceFiles: []
      });
      setFormErrors({});
      setSubmitting(false);
      setUploadingFiles({});
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
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
          originalReferenceFiles: [
            ...prev.originalReferenceFiles,
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
    // Reset file input
    e.target.value = '';
  };

  const removeFile = (index) => {
    setForm(prev => ({
      ...prev,
      originalReferenceFiles: prev.originalReferenceFiles.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.targetDueDate) errors.targetDueDate = "Target due date is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.post('/requests', {
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        targetDueDate: new Date(form.targetDueDate).toISOString(),
        originalReferenceFiles: form.originalReferenceFiles
      });
      onRequestCreated?.();
      onClose();
    } catch (err) {
      console.error("Error creating request:", err);
      showAlert({
        title: "Error",
        message: err.response?.data?.message || "Failed to create order request",
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
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New Order Request</h2>
            <p className="modal-subtitle">Submit a quote request for a new order</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              <FiFileText size={14} style={{ marginRight: '6px' }} />
              Request Name *
            </label>
            <input
              type="text"
              className={`form-input ${formErrors.name ? 'input-error' : ''}`}
              placeholder="e.g. Winter Jacket Collection"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {formErrors.name && <span className="error-text">{formErrors.name}</span>}
          </div>

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Garment Type</label>
            <select
              className="form-input"
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              {garmentTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe your requirements, quantity, specifications..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          {/* Target Due Date */}
          <div className="form-group">
            <label className="form-label">
              <FiCalendar size={14} style={{ marginRight: '6px' }} />
              Target Due Date *
            </label>
            <input
              type="date"
              className={`form-input ${formErrors.targetDueDate ? 'input-error' : ''}`}
              value={form.targetDueDate}
              min={getTomorrowDate()}
              onChange={(e) => handleChange('targetDueDate', e.target.value)}
            />
            {formErrors.targetDueDate && <span className="error-text">{formErrors.targetDueDate}</span>}
          </div>

          {/* Reference Files */}
          <div className="form-group">
            <label className="form-label">
              <FiPaperclip size={14} style={{ marginRight: '6px' }} />
              Reference Files (Tech Packs, Blueprints, etc.)
            </label>
            <label
              className="form-input"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                justifyContent: 'center',
                padding: '14px',
                border: '2px dashed var(--border-light)',
                borderRadius: '10px',
                color: 'var(--text-muted)',
                transition: 'all 0.2s ease'
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

            {/* Uploading indicator */}
            {isUploading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                <FiLoader size={14} className="spin-animation" />
                Uploading files...
              </div>
            )}

            {/* Uploaded files list */}
            {form.originalReferenceFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {form.originalReferenceFiles.map((file, idx) => (
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
            {submitting ? 'Creating...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderRequestModal;
