// CheckpointItem.jsx
import { useState } from 'react';
import { FiCheckCircle, FiPlus, FiEye, FiDownload, FiImage, FiVideo, FiFileText, FiUpload, FiSend, FiClock, FiChevronDown, FiChevronUp, FiUser, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CheckpointReview from './CheckpointReview';

const AdminSubmissionForm = ({ 
  checkpoint, 
  operationId, 
  orderId, 
  onSubmit,
  onCancel 
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmissionFiles(files);
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && submissionFiles.length === 0) {
      toast.error('Please provide submission notes or files');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(checkpoint._id, operationId, submissionText, submissionFiles);
      setSubmissionText('');
      setSubmissionFiles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-submission-form">
      <div className="form-header">
        <h4>Admin Submission</h4>
        <p className="form-subtitle">Upload files/text for this checkpoint</p>
      </div>
      
      <div className="form-group">
        <label className="form-label">Submission Notes:</label>
        <textarea
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          placeholder="Enter submission notes..."
          className="form-textarea"
          rows={4}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Upload Files (Multiple allowed):</label>
        <div className="file-upload-area">
          <label className="file-upload-label">
            <FiUpload size={20} />
            <span>Choose Files</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="file-input"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.mov,.webm"
            />
          </label>
          {submissionFiles.length > 0 && (
            <div className="selected-files">
              <p className="files-count">{submissionFiles.length} file(s) selected</p>
              <ul className="files-list">
                {submissionFiles.map((file, index) => (
                  <li key={index} className="file-item">
                    <FiFileText size={14} />
                    <span>{file.name}</span>
                    <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          className="action-btn submit-btn"
          onClick={handleSubmit}
          disabled={loading || (!submissionText.trim() && submissionFiles.length === 0)}
        >
          <FiSend size={16} />
          <span>{loading ? 'Submitting...' : 'Submit as Admin'}</span>
        </button>
        <button
          className="action-btn cancel-btn"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Helper function for file icons
const getFileIcon = (fileUrl) => {
  if (!fileUrl) return <FiFileText size={20} />;
  if (fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return <FiImage size={20} />;
  if (fileUrl.match(/\.(mp4|webm|mov)$/i)) return <FiVideo size={20} />;
  return <FiFileText size={20} />;
};

// Helper function for downloads
const handleDownload = async (url, fileName) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    toast.success('Download started');
  } catch (error) {
    toast.error('Download failed');
  }
};

// History Timeline Component
const HistoryTimeline = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="no-history">
        <FiClock size={16} />
        <span>No history available</span>
      </div>
    );
  }

  // Sort history by timestamp (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'SUBMIT': return 'badge-blue';
      case 'APPROVE': return 'badge-green';
      case 'REJECT': return 'badge-red';
      case 'FINAL_APPROVE': return 'badge-purple';
      default: return 'badge-gray';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="history-timeline">
      <div className="timeline-line" />
      {sortedHistory.map((entry, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-dot" />
          <div className="timeline-content">
            <div className="timeline-header">
              <div className="timeline-badges">
                <span className={`action-badge ${getActionBadgeColor(entry.action)}`}>
                  {entry.action.replace(/_/g, ' ')}
                </span>
                <span className="user-badge">
                  <FiUser size={12} />
                  <span>{entry.actedBy || 'System'}</span>
                </span>
              </div>
              <span className="timeline-time">
                <FiClock size={12} />
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>
            {entry.comment && (
              <div className="timeline-comment">
                <FiMessageSquare size={14} />
                <p>{entry.comment}</p>
              </div>
            )}
            {entry.files && entry.files.length > 0 && (
              <div className="timeline-files">
                <span className="files-label">Files: {entry.files.length}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const CheckpointItem = ({
  checkpoint,
  operationId,
  orderId,
  onApprove,
  onReject,
  onFinalApprove,
  onAdminSubmit,
  onPreviewFile,
  isAdminSubmitting,
  onAdminSubmittingToggle
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const getCheckpointStatusColor = (status) => {
    const colors = {
      SUBMITTED: 'status-submitted',
      QC_APPROVED: 'status-qc-approved',
      COMPLETED: 'status-completed',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
      PENDING: 'status-pending',
      QC_REJECTED: 'status-rejected',
    };
    return colors[status] || 'status-pending';
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      SUBMITTED: 'badge-yellow',
      QC_APPROVED: 'badge-blue',
      COMPLETED: 'badge-green',
      QC_REJECTED: 'badge-red',
      REJECTED: 'badge-red',
      PENDING: 'badge-gray',
    };
    return variants[status] || 'badge-gray';
  };

  return (
    <div className="checkpoint-item">
      <div className="checkpoint-main">
        <div className="checkpoint-info">
          <div className={`checkpoint-indicator ${getCheckpointStatusColor(checkpoint.status)}`} />
          <span className="checkpoint-name">{checkpoint.name}</span>
          {checkpoint.status === 'COMPLETED' && (
            <FiCheckCircle className="completed-icon" size={16} />
          )}
        </div>
        <div className="checkpoint-meta">
          <span className={`status-badge ${getStatusBadgeVariant(checkpoint.status)}`}>
            {checkpoint.status}
          </span>
          {checkpoint.qcRequired && (
            <span className="qc-badge">QC Required</span>
          )}
        </div>
      </div>
      
      {/* Submission Display Section */}
      {(checkpoint.status === 'SUBMITTED' || checkpoint.status === 'QC_APPROVED' || checkpoint.status === 'COMPLETED') && (
        <div className="submission-display">
          {checkpoint.submissionText && (
            <div className="submission-text-content">
              <h4 className="submission-text-label">Submission Notes</h4>
              <p className="submission-text">
                {checkpoint.submissionText}
              </p>
            </div>
          )}
          
          {checkpoint.submissionFiles && checkpoint.submissionFiles.length > 0 && (
            <div className="submission-files-display">
              <h4 className="submission-files-label">Submitted Files</h4>
              <div className="files-grid">
                {checkpoint.submissionFiles.map((file, index) => (
                  <div key={index} className="file-card">
                    <div className="file-icon">
                      {getFileIcon(file)}
                    </div>
                    <div className="file-info">
                      <p className="file-name">{file.split('/').pop()}</p>
                      <div className="file-actions">
                        <button
                          className="file-action-btn view-btn"
                          onClick={() => onPreviewFile(file)}
                        >
                          <FiEye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          className="file-action-btn download-btn"
                          onClick={() => handleDownload(file, `checkpoint-${checkpoint.name}-${index}`)}
                        >
                          <FiDownload size={14} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Submission Button for PENDING/REJECTED status */}
      {(checkpoint.status === 'PENDING' || checkpoint.status === 'REJECTED' || checkpoint.status === 'QC_REJECTED') && (
        <div className="admin-submission-section">
          {isAdminSubmitting ? (
            <AdminSubmissionForm
              checkpoint={checkpoint}
              operationId={operationId}
              orderId={orderId}
              onSubmit={onAdminSubmit}
              onCancel={onAdminSubmittingToggle}
            />
          ) : (
            <button
              className="admin-submit-btn"
              onClick={onAdminSubmittingToggle}
            >
              <FiPlus size={14} />
              <span>Admin: Upload Submission</span>
            </button>
          )}
        </div>
      )}

      {/* Checkpoint Review Section */}
      <CheckpointReview
        checkpoint={checkpoint}
        operationId={operationId}
        orderId={orderId}
        onApprove={onApprove}
        onReject={onReject}
        onFinalApprove={onFinalApprove}
        onPreview={onPreviewFile}
      />

      {/* History Audit Trail Section */}
      {checkpoint.history && checkpoint.history.length > 0 && (
        <div className="history-section">
          <button 
            className="history-toggle-btn"
            onClick={() => setShowHistory(!showHistory)}
          >
            <span>View History ({checkpoint.history.length})</span>
            {showHistory ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
          
          {showHistory && (
            <div className="history-content">
              <HistoryTimeline history={checkpoint.history} />
            </div>
          )}
        </div>
      )}

      {/* Allowed Submission Types */}
      {checkpoint.allowedSubmissionTypes && checkpoint.allowedSubmissionTypes.length > 0 && (
        <div className="submission-types">
          <span className="types-label">Allowed Types:</span>
          {checkpoint.allowedSubmissionTypes.map((type, typeIndex) => (
            <span key={typeIndex} className="submission-type-badge">
              {type}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckpointItem;