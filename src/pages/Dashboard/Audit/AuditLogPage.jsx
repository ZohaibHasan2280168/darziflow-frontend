import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiShoppingBag,
  FiGrid,
  FiUsers,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import api from '../../../services/reqInterceptor';
import Loader from '../../../components/ui/Loader';
import { toast } from 'react-hot-toast';
import './AuditLog.css';

const AuditLogPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    priority: '',
    dateFrom: '',
    dateTo: ''
  });
  const [markingRead, setMarkingRead] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const actionCategories = {
    'Auth & User': ['SIGNUP', 'LOGIN', 'LOGOUT', 'CHANGE_PASSWORD', 'USER_CREATE', 'USER_DELETE', 'USER_UPDATE', 'ROLE_ASSIGN'],
    'Department & Template': ['DEPT_CREATE', 'DEPT_UPDATE', 'DEPT_DELETE', 'OP_CREATE', 'OP_UPDATE', 'OP_DELETE', 'CHK_CREATE', 'CHK_UPDATE', 'CHK_DELETE'],
    'Order Management': ['ORDER_CREATE', 'ORDER_UPDATE', 'ORDER_DELETE', 'PREREQ_UPLOAD', 'PREREQ_APPROVE', 'PREREQ_REJECT', 'WORKFLOW_START', 'CHK_SUBMIT']
  };

  const priorityConfig = {
    info: { icon: <FiInfo />, color: 'info' },
    success: { icon: <FiCheckCircle />, color: 'success' },
    warning: { icon: <FiAlertTriangle />, color: 'warning' },
    error: { icon: <FiAlertCircle />, color: 'error' }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pageNumber: page,
        ...(filters.action && { action: filters.action }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(searchQuery && { search: searchQuery })
      });

      const res = await api.get(`/audit/?${params}`);
      setLogs(res.data.logs);
      setTotalPages(res.data.pages);
      setTotalLogs(res.data.total);
    } catch (err) {
      toast.error('Failed to load audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingRead(true);
      await api.patch('/audit/read');
      toast.success('All logs marked as read');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to mark logs as read');
    } finally {
      setMarkingRead(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      const response = await api.get('/audit/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Logs exported successfully');
    } catch (err) {
      toast.error('Failed to export logs');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionCategory = (action) => {
    for (const [category, actions] of Object.entries(actionCategories)) {
      if (actions.includes(action)) {
        return category;
      }
    }
    return 'Other';
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (loading && logs.length === 0) return <Loader />;

  return (
    <div className="audit-wrapper">
      {/* Header Section */}
      <div className="audit-header">
        <div className="audit-title-block">
          <h1>System Audit Logs</h1>
          <p>Monitor all system activities and security events</p>
        </div>
        
        <div className="audit-actions">
          <div className="audit-search">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            />
          </div>
          <button className="audit-btn outline" onClick={handleExportLogs}>
            <FiDownload /> Export
          </button>
          <button className="audit-btn primary" onClick={handleMarkAllAsRead} disabled={markingRead}>
            Mark All Read
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="audit-card">
        <div className="table-responsive">
          <table className="audit-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Priority</th>
                <th>Timestamp</th>
                <th className="text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log._id}>
                  <tr className={`audit-row ${expandedLogId === log._id ? 'expanded-active' : ''}`}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          <FiUser />
                        </div>
                        <span className="user-name">{log.userId?.name || 'System'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="action-text">{log.action?.replace(/_/g, ' ')}</span>
                    </td>
                    <td>
                      <span className="module-chip">{getActionCategory(log.action)}</span>
                    </td>
                    <td>
                      <span className={`priority-badge ${priorityConfig[log.priority]?.color || 'info'}`}>
                        {priorityConfig[log.priority]?.icon}
                        {log.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="timestamp-cell">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="text-right">
                      <button 
                        className={`view-btn ${expandedLogId === log._id ? 'active' : ''}`}
                        onClick={() => toggleLogExpansion(log._id)}
                      >
                        {expandedLogId === log._id ? <><FiEyeOff /> Close</> : <><FiEye /> View</>}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row */}
                  {expandedLogId === log._id && (
                    <tr className="details-row">
                      <td colSpan="6">
                        <div className="details-panel">
                          <div className="details-header">Detailed Payload</div>
                          <pre>{JSON.stringify(log.details || log.metadata || log, null, 2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {logs.length === 0 && (
          <div className="audit-empty">
            <FiFileText className="empty-icon" />
            <h3>No logs found</h3>
            <p>Try adjusting your search filters to find what you're looking for.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="audit-pagination">
            <span className="pagination-info">Showing page {page} of {totalPages}</span>
            <div className="pagination-controls">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                <FiChevronLeft /> Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;