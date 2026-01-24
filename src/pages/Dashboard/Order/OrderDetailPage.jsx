import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft as ChevronLeft,
  FiDownload as Download,
  FiEye as Eye,
  FiUpload as Upload,
  FiCheck as CheckCircle2,
  FiAlertCircle as AlertCircle,
  FiFileText as FileText,
  FiX as X,
  FiPlay as Zap,
  FiTag,
  FiDollarSign,
  FiInfo,
  FiImage,
  FiVideo,
  FiExternalLink,
  FiFile,
  FiArrowLeft,
  FiPlay as FiCheck,
  FiUser,
  FiMail,
  FiHash,
  FiCalendar,
  FiClock,
  FiAlignLeft,
  FiLayers,
  FiGrid,
  FiCheckSquare,
  FiActivity,
  FiCheckCircle,
  FiPlus,
  FiSend
} from 'react-icons/fi';
import api from '../../../services/reqInterceptor';
import Loader from '../../../components/ui/Loader';
import { toast } from 'react-hot-toast';
import './Order.css';
import WorkflowSection from './components/WorkflowSection';
import FilePreviewModal from './components/FilePreviewModal';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [activeDeptIndex, setActiveDeptIndex] = useState(0);
  const [checkpointPreview, setCheckpointPreview] = useState(null);
  const [adminSubmittingCheckpoint, setAdminSubmittingCheckpoint] = useState(null);

  const statusColor = {
    UPLOADED: 'status-uploaded',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
    PENDING: 'status-pending',
  };

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      const orderData = res.data.order || res.data;
      setOrder(orderData);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load order details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // API Functions for Checkpoint Management
  const handleApproveCheckpoint = async (checkpointId, operationId) => {
    try {
      await api.patch(
        `/orders/${orderId}/workflow/${operationId}/checkpoints/${checkpointId}/approve`
      );
      toast.success('Checkpoint QC approved successfully');
      fetchOrderDetails();
    } catch (err) {
      toast.error('Failed to approve checkpoint');
      throw err;
    }
  };

  const handleRejectCheckpoint = async (checkpointId, operationId, comment) => {
    try {
      await api.patch(
        `/orders/${orderId}/workflow/${operationId}/checkpoints/${checkpointId}/reject`,
        { comment }
      );
      toast.success('Checkpoint rejected');
      fetchOrderDetails();
    } catch (err) {
      toast.error('Failed to reject checkpoint');
      throw err;
    }
  };

  const handleFinalApproveCheckpoint = async (checkpointId, operationId) => {
    try {
      await api.patch(
        `/orders/${orderId}/workflow/${operationId}/checkpoints/${checkpointId}/final-approve`
      );
      toast.success('Checkpoint marked as COMPLETED');
      fetchOrderDetails();
    } catch (err) {
      toast.error('Failed to finalize checkpoint');
      throw err;
    }
  };

  const handleAdminSubmitCheckpoint = async (checkpointId, operationId, submissionText, files) => {
    try {
      const formData = new FormData();
      
      if (submissionText.trim()) {
        formData.append('submissionText', submissionText);
      }
      console.log('text:',submissionText);
      files.forEach(file => {
        formData.append('submissionFiles', file);
      });

      await api.post(
        `/orders/${orderId}/workflow/${operationId}/checkpoints/${checkpointId}/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Admin submission successful');
      setAdminSubmittingCheckpoint(null);
      fetchOrderDetails();
    } catch (err) {
      toast.error('Failed to submit checkpoint');
      throw err;
    }
  };

  const handleDownload = async (url, fileName) => {
    try {
      setDocumentLoading(true);
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
      toast.success('Document downloaded');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('prerequisiteFile', file);
    setUploadingDoc(docType);

    try {
      await api.post(`/orders/${orderId}/prerequisites/${docType}`, formData);
      toast.success(`${docType.replace(/_/g, ' ')} uploaded successfully`);
      await fetchOrderDetails();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDocAction = async (docType, action) => {
    setActionLoading(true);
    try {
      await api.patch(
        `/orders/${orderId}/prerequisite/${docType}/${action}`
      );
      toast.success(`Document ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchOrderDetails();
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <FiFile size={20} />;
    if (fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return <FiImage size={20} />;
    if (fileUrl.match(/\.(mp4|webm|mov)$/i)) return <FiVideo size={20} />;
    return <FileText size={20} />;
  };

  const getStatusStyle = (status) => {
    return statusColor[status] || 'status-pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateId = (id) => {
    if (!id) return 'N/A';
    if (id.length <= 12) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  if (loading) return <Loader />;

  return (
    <div className="order-detail-wrapper">
      {/* File Preview Modals */}
      <FilePreviewModal
        previewDoc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />
      
      <FilePreviewModal
        previewDoc={checkpointPreview ? { fileUrl: checkpointPreview, docType: 'Checkpoint Submission' } : null}
        onClose={() => setCheckpointPreview(null)}
        onDownload={handleDownload}
      />

      {/* HEADER SECTION */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>
        <div className="header-content">
          <div className="order-id-section">
            <span className="id-badge" title={order?.uniqueId}>
              {truncateId(order?.uniqueId)}
            </span>
          </div>
          <h1 className="order-title">{order?.name}</h1>
        </div>
        {order?.overallStatus === 'READY_TO_START' && (
          <button
            className="start-btn"
            onClick={() =>
              api.put(`/orders/${orderId}/start-workflow`).then(fetchOrderDetails)
            }
          >
            <Zap size={16} />
            <span>Start Production</span>
          </button>
        )}
      </div>

      {/* ORDER STATS SECTION */}
      <div className="segment-section">
        <div className="segment-header">
          <div className="segment-title-wrapper">
            <FiActivity size={20} />
            <h2 className="segment-title">Order Stats</h2>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon category-icon">
              <FiTag size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Category</span>
              <span className="stat-value">{order?.type || 'N/A'}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon price-icon">
              <FiDollarSign size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Quote</span>
              <span className="stat-value">
                {order?.currency && order?.amount 
                  ? `${order.currency} ${order.amount}` 
                  : 'Not set'}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon status-icon">
              <FiInfo size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Status</span>
              <span className={`stat-value ${getStatusStyle(order?.overallStatus)}`}>
                {order?.overallStatus?.replace(/_/g, ' ') || 'N/A'}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon date-icon">
              <FiCalendar size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Created At</span>
              <span className="stat-value stat-date">{formatDate(order?.createdAt)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon update-icon">
              <FiClock size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Due Date</span>
              <span className="stat-value stat-date">{formatDate(order?.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CLIENT DETAILS SECTION */}
      <div className="segment-section">
        <div className="segment-header">
          <div className="segment-title-wrapper">
            <FiUser size={20} />
            <h2 className="segment-title">Client Details</h2>
          </div>
        </div>
        <div className="client-details-grid">
          <div className="stat-card">
            <div className="stat-icon client-icon">
              <FiUser size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Client Name</span>
              <span className="stat-value">{order?.clientName || 'N/A'}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon email-icon">
              <FiMail size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Client Email</span>
              <span className="stat-value stat-email">{order?.clientEmail || 'N/A'}</span>
            </div>
          </div>

          {order?.description && (
            <div className="description-card full-width">
              <div className="description-header">
                <FiAlignLeft size={18} />
                <span>Description</span>
              </div>
              <p className="description-text">{order.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* PREREQUISITE DOCUMENTS SECTION */}
      {/* PREREQUISITE DOCUMENTS SECTION */}
<div className="prereq-section">
  <div className="section-header">
    <h2 className="section-title">
      <FileText size={24} />
      Required Documents
    </h2>
    <p className="section-subtitle">
      {order?.requiredDocuments?.filter((d) => d.status === 'APPROVED').length || 0} of{' '}
      {order?.requiredDocuments?.length || 0} documents approved
    </p>
  </div>

  {order?.requiredDocuments && order?.requiredDocuments.length > 0 ? (
    <div className="doc-grid">
      {order?.requiredDocuments.map((doc) => (
        <div key={doc.docType} className="document-card">
          <div className="doc-header">
            <div className="doc-icon-wrapper">
              <div className="doc-icon">{getFileIcon(doc.fileUrl)}</div>
            </div>
            <div className="doc-info">
              <h3 className="doc-name">{doc.docType.replace(/_/g, ' ')}</h3>
              <span className={`doc-status ${getStatusStyle(doc.status)}`}>
                {doc.status}
              </span>
            </div>
          </div>

          <div className="doc-actions">
            {doc.fileUrl ? (
              <>
                {/* FIXED: Pass correct data structure to setPreviewDoc */}
                <button
                  className="action-btn view-btn"
                  onClick={() => setPreviewDoc({
                    fileUrl: doc.fileUrl,
                    docType: doc.docType,
                    fileName: doc.docType.replace(/_/g, ' ')
                  })}
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                
                {/* FIXED: Pass correct parameters to handleDownload */}
                <button
                  className="action-btn download-btn"
                  onClick={() => handleDownload(
                    doc.fileUrl, 
                    `${doc.docType.replace(/_/g, '_')}_${new Date().getTime()}`
                  )}
                  disabled={documentLoading}
                >
                  <Download size={16} />
                  <span>{documentLoading ? 'Downloading...' : 'Download'}</span>
                </button>
              </>
            ) : doc.status === 'REJECTED' ? (
              <label className="action-btn upload-btn">
                <Upload size={16} />
                <span>{uploadingDoc === doc.docType ? 'Uploading...' : 'Re-upload'}</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, doc.docType)}
                  disabled={uploadingDoc === doc.docType}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <label className="action-btn upload-btn">
                <Upload size={16} />
                <span>{uploadingDoc === doc.docType ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, doc.docType)}
                  disabled={uploadingDoc === doc.docType}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {doc.status === 'UPLOADED' && (
            <div className="admin-actions">
              <button
                className="admin-btn approve-btn"
                onClick={() => handleDocAction(doc.docType, 'approve')}
                disabled={actionLoading}
              >
                <CheckCircle2 size={16} />
                <span>Approve</span>
              </button>
              <button
                className="admin-btn reject-btn"
                onClick={() => handleDocAction(doc.docType, 'reject')}
                disabled={actionLoading}
              >
                <X size={16} />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="no-documents">
      <FileText size={40} />
      <p>No documents required for this order</p>
    </div>
  )}
</div>

      {/* WORKFLOW SECTION */}
      {order?.workflow && order.workflow.length > 0 && (
        <WorkflowSection
          workflow={order.workflow}
          activeDeptIndex={activeDeptIndex}
          onDeptTabChange={setActiveDeptIndex}
          orderId={orderId}
          onApproveCheckpoint={handleApproveCheckpoint}
          onRejectCheckpoint={handleRejectCheckpoint}
          onFinalApproveCheckpoint={handleFinalApproveCheckpoint}
          onAdminSubmitCheckpoint={handleAdminSubmitCheckpoint}
          onPreviewFile={setCheckpointPreview}
          adminSubmittingCheckpoint={adminSubmittingCheckpoint}
          onAdminSubmittingChange={setAdminSubmittingCheckpoint}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;