// CheckpointItem.jsx
import { useState } from 'react';
import { useEffect } from 'react';
import { FiCheckCircle, FiChevronDown, FiChevronUp, FiClock, FiUser, FiMessageSquare } from 'react-icons/fi';
// toast removed; parent handles toasts

// Helper: simple history timeline stays

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
  onFinalApprove,
  onPreviewFile,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent background scroll and layout shift when modal is open
  useEffect(() => {
    if (showConfirm) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      // lock body scroll and preserve scrollbar space to avoid layout shift
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
      // add modal-open class to root to disable background hover/interaction
      document.documentElement.classList.add('modal-open');
    } else {
      // restore
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.classList.remove('modal-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.classList.remove('modal-open');
    };
  }, [showConfirm]);

  const getCheckpointStatusColor = (status) => {
    return status === 'COMPLETED' ? 'status-completed' : 'status-pending';
  };

  const getStatusBadgeVariant = (status) => {
    return status === 'COMPLETED' ? 'badge-green' : 'badge-gray';
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
            {checkpoint.status === 'COMPLETED' ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>


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