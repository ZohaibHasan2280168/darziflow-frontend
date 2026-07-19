import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiPlus, FiCheckCircle, FiClock,
  FiFileText, FiCalendar, FiDollarSign, FiMessageSquare,
  FiPaperclip, FiExternalLink, FiXCircle, FiRepeat,
  FiUser, FiUsers
} from "react-icons/fi";
import api from '../../../services/reqInterceptor';
import { useAlert } from "../../../components/ui/AlertProvider";
import { useAuth } from "../../../components/context/AuthContext";
import AddProposalModal from "../../../components/modals/AddProposalModal";
import './OrderRequestDetailPage.css';

const OrderRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { showAlert } = useAlert();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

  const isAdmin = authUser?.role === 'ADMIN' || authUser?.role === 'MODERATOR';
  const isClient = authUser?.role === 'CLIENT';

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data.request || res.data);
    } catch (err) {
      console.error("Error fetching order request:", err);
      showAlert({ title: "Error", message: "Failed to load order request", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleConvert = async () => {
    if (!window.confirm("Are you sure you want to convert this request into an Order? This will use the latest proposal details.")) return;

    try {
      setConverting(true);
      await api.post(`/requests/${id}/convert`);
      showAlert({ title: "Success", message: "Request converted to Order successfully!", type: "success" });
      fetchRequest();
    } catch (err) {
      console.error("Error converting request:", err);
      showAlert({
        title: "Error",
        message: err.response?.data?.message || "Failed to convert request",
        type: "error"
      });
    } finally {
      setConverting(false);
    }
  };

  const handleProposalAdded = () => {
    fetchRequest();
    showAlert({ title: "Success", message: "Proposal submitted successfully!", type: "success" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING_ADMIN': return 'oreq-status-pending-admin';
      case 'PENDING_CLIENT': return 'oreq-status-pending-client';
      case 'CONVERTED': return 'oreq-status-converted';
      case 'CANCELED': return 'oreq-status-canceled';
      default: return 'oreq-status-default';
    }
  };

  // Determine who should act next
  const canAddProposal = () => {
    if (!request) return false;
    if (request.status === 'CONVERTED' || request.status === 'CANCELED') return false;
    if (isAdmin && request.status === 'PENDING_ADMIN') return true;
    if (isClient && request.status === 'PENDING_CLIENT') return true;
    return false;
  };

  const canConvert = () => {
    if (!request) return false;
    if (!isAdmin) return false;
    if (request.status === 'CONVERTED' || request.status === 'CANCELED') return false;
    return request.proposals && request.proposals.length > 0;
  };

  const statusSteps = [
    { key: 'PENDING_ADMIN', label: 'Pending Admin Review', icon: <FiClock size={14} /> },
    { key: 'PENDING_CLIENT', label: 'Pending Client Review', icon: <FiUser size={14} /> },
    { key: 'CONVERTED', label: 'Converted to Order', icon: <FiCheckCircle size={14} /> },
  ];

  if (loading) {
    return (
      <div className="oreq-detail-page">
        <div className="oreq-detail-loader">
          <div className="oreq-loader" />
          <span>Loading request details...</span>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="oreq-detail-page">
        <div className="oreq-detail-loader">
          <FiXCircle size={40} />
          <span>Request not found</span>
          <button className="oreq-back-button" onClick={() => navigate('/order-requests')}>
            <FiArrowLeft size={18} /> Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="oreq-detail-page">
      {/* Header */}
      <div className="oreq-detail-header">
        <div className="oreq-detail-header-left">
          <button className="oreq-back-button" onClick={() => navigate('/order-requests')}>
            <FiArrowLeft size={20} />
            <span style={{ fontSize: '14px', marginLeft: '4px' }}>Back</span>
          </button>
          <div>
            <h1 className="oreq-detail-title">{request.name}</h1>
            <div className="oreq-detail-meta">
              <span className={`oreq-status-badge ${getStatusClass(request.status)}`}>
                {request.status?.replace(/_/g, ' ')}
              </span>
              <span className="oreq-detail-meta-item">
                <FiCalendar size={14} />
                Created {formatDate(request.createdAt)}
              </span>
              {request.type && (
                <span className="oreq-type-badge">{request.type}</span>
              )}
            </div>
          </div>
        </div>
        <div className="oreq-detail-header-actions">
          {canAddProposal() && (
            <button className="oreq-proposal-btn" onClick={() => setShowProposalModal(true)}>
              <FiPlus size={16} />
              Add Proposal
            </button>
          )}
          {canConvert() && (
            <button
              className="oreq-convert-btn"
              onClick={handleConvert}
              disabled={converting}
            >
              <FiRepeat size={16} />
              {converting ? 'Converting...' : 'Convert to Order'}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="oreq-detail-grid">
        {/* Left: Request details + Proposals timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Original Request Info */}
          <div className="oreq-card">
            <div className="oreq-card-header">
              <h3 className="oreq-card-title">
                <FiFileText size={18} />
                Request Details
              </h3>
            </div>
            <div className="oreq-card-body">
              <div className="oreq-info-grid">
                <div className="oreq-info-item">
                  <span className="oreq-info-label">Name</span>
                  <span className="oreq-info-value">{request.name}</span>
                </div>
                <div className="oreq-info-item">
                  <span className="oreq-info-label">Type</span>
                  <span className="oreq-info-value">{request.type || '—'}</span>
                </div>
                <div className="oreq-info-item">
                  <span className="oreq-info-label">Target Due Date</span>
                  <span className="oreq-info-value">{formatDate(request.targetDueDate)}</span>
                </div>
                <div className="oreq-info-item">
                  <span className="oreq-info-label">Created By</span>
                  <span className="oreq-info-value">{request.createdBy?.name || request.clientName || '—'}</span>
                </div>
                <div className="oreq-info-item full-width">
                  <span className="oreq-info-label">Description</span>
                  <span className="oreq-info-value description-text">
                    {request.description || 'No description provided.'}
                  </span>
                </div>
              </div>

              {/* Reference Files */}
              {request.originalReferenceFiles && request.originalReferenceFiles.length > 0 && (
                <div className="oreq-files-list">
                  <span className="oreq-info-label" style={{ marginBottom: '4px' }}>Reference Files</span>
                  {request.originalReferenceFiles.map((file, idx) => (
                    <div key={idx} className="oreq-file-item">
                      <div className="oreq-file-icon">
                        <FiPaperclip size={16} />
                      </div>
                      <span className="oreq-file-name">{file.fileName || `File ${idx + 1}`}</span>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="oreq-file-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiExternalLink size={14} /> View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Proposals Timeline */}
          <div className="oreq-card">
            <div className="oreq-card-header">
              <h3 className="oreq-card-title">
                <FiMessageSquare size={18} />
                Proposals &amp; Negotiation
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {request.proposals?.length || 0} proposal(s)
              </span>
            </div>
            <div className="oreq-card-body">
              {(!request.proposals || request.proposals.length === 0) ? (
                <div className="oreq-timeline-empty">
                  <FiMessageSquare size={36} />
                  <span>No proposals yet. {isAdmin ? 'Submit the first proposal.' : 'Waiting for admin proposal.'}</span>
                </div>
              ) : (
                <div className="oreq-timeline">
                  {request.proposals.map((proposal, idx) => {
                    const isAdminProposal = proposal.proposedBy?.role === 'ADMIN' || proposal.proposedBy?.role === 'MODERATOR';
                    const roleClass = isAdminProposal ? 'admin' : 'client';

                    return (
                      <div key={proposal._id || idx} className="oreq-timeline-item">
                        <div className={`oreq-timeline-dot ${roleClass}`}>
                          <div className="oreq-timeline-dot-inner" />
                        </div>
                        <div className="oreq-timeline-card">
                          <div className="oreq-timeline-card-header">
                            <div className="oreq-timeline-author">
                              {proposal.proposedBy?.name || 'Unknown'}
                              <span>{isAdminProposal ? 'Admin' : 'Client'}</span>
                            </div>
                            <span className="oreq-timeline-date">
                              {formatDate(proposal.createdAt)}
                            </span>
                          </div>

                          <div className="oreq-timeline-details">
                            {proposal.amount !== undefined && proposal.amount !== null && (
                              <div className="oreq-timeline-detail">
                                <span className="oreq-timeline-detail-label">Amount</span>
                                <span className="oreq-timeline-detail-value">
                                  {formatCurrency(proposal.amount)}
                                </span>
                              </div>
                            )}
                            {proposal.dueDate && (
                              <div className="oreq-timeline-detail">
                                <span className="oreq-timeline-detail-label">Due Date</span>
                                <span className="oreq-timeline-detail-value">
                                  {formatDate(proposal.dueDate)}
                                </span>
                              </div>
                            )}
                          </div>

                          {proposal.requiredDocs && proposal.requiredDocs.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <span className="oreq-timeline-detail-label">Required Docs</span>
                              <div className="oreq-docs-tags">
                                {proposal.requiredDocs.map((doc, i) => (
                                  <span key={i} className="oreq-doc-tag">{doc}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {proposal.remarks && (
                            <div className="oreq-timeline-remarks">
                              <p>"{proposal.remarks}"</p>
                            </div>
                          )}

                          {proposal.referenceFiles && proposal.referenceFiles.length > 0 && (
                            <div className="oreq-timeline-files">
                              <span className="oreq-timeline-files-title">Attached Files</span>
                              {proposal.referenceFiles.map((file, i) => (
                                <div key={i} className="oreq-file-item" style={{ marginTop: '6px' }}>
                                  <div className="oreq-file-icon" style={{ width: '30px', height: '30px' }}>
                                    <FiPaperclip size={13} />
                                  </div>
                                  <span className="oreq-file-name" style={{ fontSize: '12px' }}>{file.fileName}</span>
                                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="oreq-file-link">
                                    <FiExternalLink size={12} />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status Flow Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="oreq-card">
            <div className="oreq-card-header">
              <h3 className="oreq-card-title">
                <FiRepeat size={18} />
                Status Flow
              </h3>
            </div>
            <div className="oreq-card-body">
              <div className="oreq-status-flow">
                {statusSteps.map((step) => {
                  const isCurrent = request.status === step.key;
                  const isCompleted = (
                    step.key === 'PENDING_ADMIN' && ['PENDING_CLIENT', 'CONVERTED'].includes(request.status)
                  ) || (
                    step.key === 'PENDING_CLIENT' && request.status === 'CONVERTED'
                  );

                  return (
                    <div
                      key={step.key}
                      className={`oreq-status-step ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    >
                      <div className="oreq-status-step-icon">
                        {isCompleted ? <FiCheckCircle size={16} /> : step.icon}
                      </div>
                      <span className="oreq-status-step-text">{step.label}</span>
                    </div>
                  );
                })}

                {request.status === 'CANCELED' && (
                  <div className="oreq-status-step active" style={{ borderColor: 'rgb(var(--color-accent-red))' }}>
                    <div className="oreq-status-step-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'rgb(var(--color-accent-red))' }}>
                      <FiXCircle size={16} />
                    </div>
                    <span className="oreq-status-step-text" style={{ color: 'rgb(var(--color-accent-red))' }}>Canceled</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="oreq-card">
            <div className="oreq-card-header">
              <h3 className="oreq-card-title">
                <FiUsers size={18} />
                Quick Info
              </h3>
            </div>
            <div className="oreq-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="oreq-info-item">
                  <span className="oreq-info-label">Total Proposals</span>
                  <span className="oreq-info-value">{request.proposals?.length || 0}</span>
                </div>
                {request.proposals && request.proposals.length > 0 && (
                  <>
                    <div className="oreq-info-item">
                      <span className="oreq-info-label">Latest Amount</span>
                      <span className="oreq-info-value">
                        {formatCurrency(request.proposals[request.proposals.length - 1]?.amount)}
                      </span>
                    </div>
                    <div className="oreq-info-item">
                      <span className="oreq-info-label">Latest Due Date</span>
                      <span className="oreq-info-value">
                        {formatDate(request.proposals[request.proposals.length - 1]?.dueDate)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Proposal Modal */}
      <AddProposalModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        requestId={id}
        userRole={authUser?.role}
        onProposalAdded={handleProposalAdded}
      />
    </div>
  );
};

export default OrderRequestDetailPage;
