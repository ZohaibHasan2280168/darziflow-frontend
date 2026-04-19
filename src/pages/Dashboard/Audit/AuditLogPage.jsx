import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiUser, 
  FiFileText,
  FiMail, 
  FiFilter, 
  FiChevronDown, 
  FiChevronUp,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiCalendar,
  FiShoppingBag,
  FiGrid,
  FiUsers,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiX,
  FiDownload,
  FiExternalLink,
  FiArrowLeft
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
  const [showFilters, setShowFilters] = useState(false);
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
    info: { 
      icon: <FiInfo />, 
      color: '#3b82f6', 
      bg: 'rgba(59, 130, 246, 0.2)',
      label: 'Info'
    },
    success: { 
      icon: <FiCheckCircle />, 
      color: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.2)',
      label: 'Success'
    },
    warning: { 
      icon: <FiAlertTriangle />, 
      color: '#f59e0b', 
      bg: 'rgba(245, 158, 11, 0.2)',
      label: 'Warning'
    },
    error: { 
      icon: <FiAlertCircle />, 
      color: '#ef4444', 
      bg: 'rgba(239, 68, 68, 0.2)',
      label: 'Error'
    }
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      priority: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchQuery('');
    setPage(1);
    fetchLogs();
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

  const getActionIcon = (action) => {
    if (action.includes('USER') || action.includes('SIGNUP') || action.includes('LOGIN')) {
      return <FiUsers size={16} />;
    } else if (action.includes('ORDER')) {
      return <FiShoppingBag size={16} />;
    } else if (action.includes('DEPT') || action.includes('OP') || action.includes('CHK')) {
      return <FiGrid size={16} />;
    } else {
      return <FiFileText size={16} />;
    }
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

  const handleNavigateToOrder = (orderId) => {
    if (orderId && orderId._id) {
      navigate(`/orders/${orderId._id}`);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  if (loading && logs.length === 0) return <Loader />;

  return (
    <div className="audit-log-container-wrapper dark-theme">
      {/* Header */}
      <header className="audit-log-header">
        <div className="audit-header-left">
          <button 
            className="audit-back-btn"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <FiArrowLeft size={24} />
            <span>Back</span>
          </button>
          
          <div className="audit-title-section">
            <div className="audit-title-icon">
              <FiClock size={28} />
            </div>
            <div>
              <h1 className="audit-main-title">Audit Logs</h1>
              <p className="audit-main-subtitle">System activity tracking and audit trail</p>
            </div>
          </div>
          
          <div className="audit-search-bar">
            <FiSearch size={18} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="audit-search-input"
            />
            {searchQuery && (
              <button 
                className="audit-clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="audit-header-actions">
          <button 
            className="audit-action-btn audit-secondary-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={18} />
            <span>Filters</span>
            {Object.values(filters).some(val => val) && (
              <span className="audit-active-badge"></span>
            )}
          </button>
          
          <button 
            className="audit-action-btn audit-secondary-btn"
            onClick={handleExportLogs}
          >
            <FiDownload size={18} />
            <span>Export</span>
          </button>
          
          <button 
            className="audit-action-btn audit-secondary-btn"
            onClick={fetchLogs}
            disabled={loading}
          >
            <FiRefreshCw size={18} className={loading ? 'audit-spinning' : ''} />
            <span>Refresh</span>
          </button>
          
          <button 
            className="audit-action-btn audit-primary-btn"
            onClick={handleMarkAllAsRead}
            disabled={markingRead}
          >
            <FiCheckCircle size={18} />
            <span>{markingRead ? 'Marking...' : 'Mark All Read'}</span>
          </button>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="audit-filters-panel">
          <div className="audit-panel-header">
            <h3>Filter Logs</h3>
            <button 
              className="audit-close-filters-btn"
              onClick={() => setShowFilters(false)}
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="audit-filter-grid">
            <div className="audit-filter-group">
              <label className="audit-filter-label">Action Type</label>
              <select 
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="audit-filter-select"
              >
                <option value="">All Actions</option>
                {Object.entries(actionCategories).map(([category, actions]) => (
                  <optgroup key={category} label={category}>
                    {actions.map(action => (
                      <option key={action} value={action}>
                        {action.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="audit-filter-group">
              <label className="audit-filter-label">Priority Level</label>
              <div className="audit-priority-buttons">
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <button
                    key={key}
                    className={`audit-priority-btn ${filters.priority === key ? 'active' : ''}`}
                    onClick={() => handleFilterChange('priority', filters.priority === key ? '' : key)}
                    style={{
                      '--audit-priority-color': config.color,
                      '--audit-priority-bg': config.bg
                    }}
                  >
                    {config.icon}
                    <span>{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="audit-filter-group">
              <label className="audit-filter-label">Date Range</label>
              <div className="audit-date-range">
                <div className="audit-date-input-group">
                  <FiCalendar size={16} />
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="audit-date-input"
                    placeholder="From"
                  />
                </div>
                <span className="audit-date-separator">to</span>
                <div className="audit-date-input-group">
                  <FiCalendar size={16} />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="audit-date-input"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="audit-filter-actions">
            <button 
              className="audit-action-btn audit-clear-btn"
              onClick={handleClearFilters}
              disabled={!Object.values(filters).some(val => val) && !searchQuery}
            >
              Clear All
            </button>
            <button 
              className="audit-action-btn audit-apply-btn"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="audit-stats-overview">
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon-total">
            <FiFileText size={24} />
          </div>
          <div className="audit-stat-content">
            <div className="audit-stat-value">{totalLogs.toLocaleString()}</div>
            <div className="audit-stat-label">Total Logs</div>
          </div>
        </div>
        
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon-unread">
            <FiClock size={24} />
          </div>
          <div className="audit-stat-content">
            <div className="audit-stat-value">
              {logs.filter(log => !log.isRead).length}
            </div>
            <div className="audit-stat-label">Unread Logs</div>
          </div>
        </div>
        
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon-error">
            <FiAlertCircle size={24} />
          </div>
          <div className="audit-stat-content">
            <div className="audit-stat-value">
              {logs.filter(log => log.priority === 'error').length}
            </div>
            <div className="audit-stat-label">Errors</div>
          </div>
        </div>
        
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon-warning">
            <FiAlertTriangle size={24} />
          </div>
          <div className="audit-stat-content">
            <div className="audit-stat-value">
              {logs.filter(log => log.priority === 'warning').length}
            </div>
            <div className="audit-stat-label">Warnings</div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="audit-logs-section">
        <div className="audit-section-header">
          <h2>Recent Activity</h2>
          <div className="audit-logs-info">
            Showing {logs.length} of {totalLogs.toLocaleString()} logs
          </div>
        </div>
        
        <div className="audit-logs-container">
          {logs.length > 0 ? (
            <>
              <div className="audit-logs-table">
                <div className="audit-table-header">
                  <div className="audit-header-cell priority">Priority</div>
                  <div className="audit-header-cell action">Action</div>
                  <div className="audit-header-cell user">User</div>
                  <div className="audit-header-cell order">Order</div>
                  <div className="audit-header-cell time">Timestamp</div>
                  <div className="audit-header-cell expand"></div>
                </div>
                
                <div className="audit-table-body">
                  {logs.map((log) => (
                    <div 
                      key={log._id} 
                      className={`audit-log-item ${!log.isRead ? 'unread' : ''} ${expandedLogId === log._id ? 'expanded' : ''}`}
                    >
                      <div 
                        className="audit-log-row" 
                        onClick={() => toggleLogExpansion(log._id)}
                      >
                        <div className="audit-cell audit-priority-cell">
                          <div 
                            className="audit-priority-indicator"
                            style={{ 
                              backgroundColor: priorityConfig[log.priority]?.color
                            }}
                          />
                          <div className="audit-priority-label">
                            {priorityConfig[log.priority]?.label}
                          </div>
                        </div>
                        
                        <div className="audit-cell audit-action-cell">
                          <div className="audit-action-icon">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="audit-action-content">
                            <div className="audit-action-type">
                              {log.action.replace(/_/g, ' ')}
                            </div>
                            <div className="audit-action-category">
                              {getActionCategory(log.action)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="audit-cell audit-user-cell">
                          <div className="audit-user-avatar">
                            <FiUser size={14} />
                          </div>
                          <div className="audit-user-info">
                            <div className="audit-user-name">
                              {log.performedBy?.name || 'System'}
                            </div>
                            <div className="audit-user-email">
                              {log.performedBy?.email || 'System Account'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="audit-cell audit-order-cell">
                          {log.orderId ? (
                            <button 
                              className="audit-order-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToOrder(log.orderId);
                              }}
                            >
                              <FiShoppingBag size={14} />
                              <div className="audit-order-info">
                                <div className="audit-order-name" title={log.orderId?.name}>
                                  {log.orderId?.name || 'Order'}
                                </div>
                                <div className="audit-order-id">
                                  {log.orderId?.uniqueId ? 
                                    `#${log.orderId.uniqueId.slice(0, 8)}` : 
                                    ''
                                  }
                                </div>
                              </div>
                            </button>
                          ) : (
                            <span className="audit-no-order">—</span>
                          )}
                        </div>
                        
                        <div className="audit-cell audit-time-cell">
                          <div className="audit-time-content">
                            <FiCalendar size={14} />
                            <div className="audit-time-text">
                              <div className="audit-time-date">
                                {new Date(log.createdAt).toLocaleDateString()}
                              </div>
                              <div className="audit-time-hour">
                                {new Date(log.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="audit-cell audit-expand-cell">
                          <button className="audit-expand-btn">
                            {expandedLogId === log._id ? 
                              <FiChevronUp size={18} /> : 
                              <FiChevronDown size={18} />
                            }
                          </button>
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedLogId === log._id && (
                        <div className="audit-log-details">
                          <div className="audit-details-grid">
                            <div className="audit-detail-group">
                              <div className="audit-detail-label">Action Details</div>
                              <div className="audit-detail-value">{log.details}</div>
                            </div>
                            
                            <div className="audit-detail-group">
                              <div className="audit-detail-label">User Information</div>
                              <div className="audit-detail-value">
                                <div className="audit-user-detail">
                                  <FiUser size={14} />
                                  <span>{log.performedBy?.name || 'System'}</span>
                                </div>
                                {log.performedBy?.email && (
                                  <div className="audit-user-detail">
                                    <FiMail size={14} />
                                    <span>{log.performedBy.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {log.orderId && (
                              <div className="audit-detail-group">
                                <div className="audit-detail-label">Order Reference</div>
                                <div className="audit-detail-value">
                                  <div className="audit-order-reference">
                                    <div className="audit-order-detail">
                                      <span className="audit-detail-title">Name:</span>
                                      <span>{log.orderId?.name}</span>
                                    </div>
                                    <div className="audit-order-detail">
                                      <span className="audit-detail-title">ID:</span>
                                      <span>{log.orderId?.uniqueId}</span>
                                    </div>
                                    <button 
                                      className="audit-view-order-btn"
                                      onClick={() => handleNavigateToOrder(log.orderId)}
                                    >
                                      <FiExternalLink size={14} />
                                      <span>View Order</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="audit-detail-group">
                              <div className="audit-detail-label">System Information</div>
                              <div className="audit-detail-value">
                                <div className="audit-system-detail">
                                  <span className="audit-detail-title">IP Address:</span>
                                  <span>{log.ipAddress || 'N/A'}</span>
                                </div>
                                <div className="audit-system-detail">
                                  <span className="audit-detail-title">Timestamp:</span>
                                  <span>{formatDate(log.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="audit-pagination">
                  <button
                    className="audit-pagination-btn prev-btn"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    <FiChevronLeft size={18} />
                    <span>Previous</span>
                  </button>
                  
                  <div className="audit-page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`audit-page-btn ${page === pageNum ? 'active' : ''}`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && page < totalPages - 2 && (
                      <>
                        <span className="audit-page-dots">...</span>
                        <button
                          className="audit-page-btn"
                          onClick={() => setPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    className="audit-pagination-btn next-btn"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    <span>Next</span>
                    <FiChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="audit-no-logs">
              <div className="audit-no-logs-icon">
                <FiFileText size={64} />
              </div>
              <h3>No audit logs found</h3>
              <p className="audit-no-logs-sub">
                {Object.values(filters).some(val => val) || searchQuery
                  ? 'Try adjusting your filters or search criteria'
                  : 'No activity has been logged yet'
                }
              </p>
              {(Object.values(filters).some(val => val) || searchQuery) && (
                <button 
                  className="audit-action-btn audit-clear-filters-btn"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;