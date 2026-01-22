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
  FiActivity
} from 'react-icons/fi';
import api from '../../../services/reqInterceptor';
import Loader from '../../../components/ui/Loader';
import { toast } from 'react-hot-toast';
import './Order.css';

const Order = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

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
      //console.log('Fetched order:', orderData);
      //console.log('Required documents:', orderData?.requiredDocuments);
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

    //console.log('Starting upload:', docType);
    const formData = new FormData();
    formData.append('prerequisiteFile', file);
    setUploadingDoc(docType);

    try {
      const uploadRes = await api.post(`/orders/${orderId}/prerequisites/${docType}`, formData);
     // console.log('Upload response:', uploadRes.data);
      toast.success(`${docType.replace(/_/g, ' ')} uploaded successfully`);
      //console.log('Fetching updated order details...');
      await fetchOrderDetails();
    } catch (err) {
     // console.log('[v0] Upload error:', err);
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

  const getDocumentPreview = () => {
    if (!previewDoc) return null;

    const { fileUrl, docType } = previewDoc;

    if (!fileUrl) {
      return (
        <div className="preview-empty">
          <FileText size={48} />
          <p>No document uploaded</p>
        </div>
      );
    }

    if (fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return <img src={fileUrl || "/placeholder.svg"} alt="Document preview" className="preview-image" />;
    }

    if (fileUrl.match(/\.(mp4|webm|mov)$/i)) {
      return (
        <video controls className="preview-video">
          <source src={fileUrl} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (fileUrl.match(/\.pdf$/i)) {
      return (
        <iframe
          src={`https://docs.google.com/gvjs?url=${encodeURIComponent(fileUrl)}`}
          title="PDF preview"
          className="preview-iframe"
        />
      );
    }

    return (
      <div className="preview-empty">
        <FiExternalLink size={48} />
        <p>Preview not available</p>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
          Open document in new tab
        </a>
      </div>
    );
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
      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="preview-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{previewDoc.docType.replace(/_/g, ' ')}</h3>
                <p className="modal-subtitle">Document Preview</p>
              </div>
              <div className="modal-controls">
                <button
                  onClick={() =>
                    handleDownload(previewDoc.fileUrl, previewDoc.docType)
                  }
                  className="control-btn download-btn"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="control-btn close-btn"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="modal-body">{getDocumentPreview()}</div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Go back">
          <ChevronLeft size={24} />
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
                  {doc.fileUrl || (doc.status === 'UPLOADED' || doc.status === 'APPROVED' || doc.status === 'REJECTED') ? (
                    doc.fileUrl ? (
                      <>
                        <button
                          className="action-btn view-btn"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button
                          className="action-btn download-btn"
                          onClick={() => handleDownload(doc.fileUrl, doc.docType)}
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
                      <label className="action-btn upload-btn disabled-upload">
                        <Upload size={16} />
                        <span>No Document</span>
                      </label>
                    )
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

                {doc.status === 'APPROVED' && (
                  <div className="approval-badge">
                    <FiCheck size={16} />
                    <span>Approved</span>
                  </div>
                )}

                {doc.status === 'REJECTED' && (
                  <div className="rejection-badge">
                    <X size={16} />
                    <span>Rejected - Re-upload required</span>
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
        <div className="segment-section workflow-section">
          <div className="segment-header">
            <div className="segment-title-wrapper">
              <FiLayers size={20} />
              <h2 className="segment-title">Workflow</h2>
            </div>
            <p className="segment-subtitle">
              {order.workflow.length} department{order.workflow.length > 1 ? 's' : ''} in pipeline
            </p>
          </div>

          <div className="workflow-container">
            {order.workflow.map((dept, deptIndex) => (
              <div key={dept._id?.$oid || deptIndex} className="department-card">
                {/* Department Header */}
                <div className="department-header">
                  <div className="department-info">
                    <div className="department-icon-wrapper">
                      <FiGrid size={20} />
                    </div>
                    <div className="department-details">
                      <h3 className="department-name">{dept.departmentName}</h3>
                      <span className="department-id" title={dept.departmentId?.$oid}>
                        ID: {truncateId(dept.departmentId?.$oid)}
                      </span>
                    </div>
                  </div>
                  <span className={`department-status ${getStatusStyle(dept.status)}`}>
                    {dept.status?.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Operations */}
                {dept.operations && dept.operations.length > 0 && (
                  <div className="operations-container">
                    {dept.operations.map((operation, opIndex) => (
                      <div key={operation._id?.$oid || opIndex} className="operation-card">
                        <div className="operation-header">
                          <div className="operation-info">
                            <FiActivity size={16} />
                            <span className="operation-name">{operation.name}</span>
                          </div>
                          <span className={`operation-status ${getStatusStyle(operation.status)}`}>
                            {operation.status?.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Checkpoints */}
                        {operation.checkpoints && operation.checkpoints.length > 0 && (
                          <div className="checkpoints-container">
                            <div className="checkpoints-label">
                              <FiCheckSquare size={14} />
                              <span>Checkpoints ({operation.checkpoints.length})</span>
                            </div>
                            <div className="checkpoints-list">
                              {operation.checkpoints.map((checkpoint, cpIndex) => (
                                <div key={checkpoint._id?.$oid || cpIndex} className="checkpoint-item">
                                  <div className="checkpoint-info">
                                    <div className={`checkpoint-indicator ${getStatusStyle(checkpoint.status)}`} />
                                    <span className="checkpoint-name">{checkpoint.name}</span>
                                  </div>
                                  <div className="checkpoint-meta">
                                    <span className={`checkpoint-status ${getStatusStyle(checkpoint.status)}`}>
                                      {checkpoint.status}
                                    </span>
                                    {checkpoint.qcRequired && (
                                      <span className="qc-badge">QC Required</span>
                                    )}
                                  </div>
                                  {checkpoint.allowedSubmissionTypes && checkpoint.allowedSubmissionTypes.length > 0 && (
                                    <div className="submission-types">
                                      {checkpoint.allowedSubmissionTypes.map((type, typeIndex) => (
                                        <span key={typeIndex} className="submission-type-badge">
                                          {type}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
