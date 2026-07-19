import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiArrowLeft, FiPlus, FiFilter,
  FiChevronRight, FiTrash2, FiFileText,
  FiPackage, FiClock, FiCheckCircle, FiXCircle,
  FiCalendar
} from "react-icons/fi";
import api from '../../../services/reqInterceptor';
import { useAlert } from "../../../components/ui/AlertProvider";
import { useAuth } from "../../../components/context/AuthContext";
import CreateOrderRequestModal from "../../../components/modals/CreateOrderRequestModal";
import './OrderRequestsPage.css';

const OrderRequestsPage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { showAlert } = useAlert();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      const dataObj = res.data;
      let requestsArray = [];
      if (Array.isArray(dataObj)) {
        requestsArray = dataObj;
      } else if (dataObj && Array.isArray(dataObj.data)) {
        requestsArray = dataObj.data;
      } else if (dataObj && Array.isArray(dataObj.requests)) {
        requestsArray = dataObj.requests;
      }
      setRequests(requestsArray);
    } catch (err) {
      console.error("Error fetching order requests:", err);
      showAlert({ title: "Error", message: "Failed to load order requests", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING_ADMIN': return 'oreq-status-pending-admin';
      case 'PENDING_CLIENT': return 'oreq-status-pending-client';
      case 'CONVERTED': return 'oreq-status-converted';
      case 'CANCELED': return 'oreq-status-canceled';
      default: return 'oreq-status-default';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const handleRequestCreated = () => {
    fetchRequests();
    showAlert({ title: "Success", message: "Order request created successfully!", type: "success" });
  };

  const statCounts = {
    total: requests.length,
    pendingAdmin: requests.filter(r => r.status === 'PENDING_ADMIN').length,
    pendingClient: requests.filter(r => r.status === 'PENDING_CLIENT').length,
    converted: requests.filter(r => r.status === 'CONVERTED').length,
  };

  return (
    <div className="oreq-page">
      {/* Header */}
      <header className="oreq-header">
        <div className="oreq-header-content">
          <button className="oreq-back-button" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
            <span style={{ fontSize: '14px', marginLeft: '4px' }}>Back</span>
          </button>
          <div>
            <h1 className="oreq-title">Order Requests</h1>
            <p className="oreq-subtitle">Quote negotiation &amp; request management</p>
          </div>
        </div>
        {(authUser?.role === 'CLIENT') && (
          <button className="oreq-create-btn" onClick={() => setShowCreateModal(true)}>
            <FiPlus size={18} />
            <span>New Request</span>
          </button>
        )}
      </header>

      {/* Stats Cards */}
      <div className="oreq-stats-row">
        <div className="oreq-stat-card oreq-stat-total">
          <div className="oreq-stat-icon-wrap"><FiFileText size={22} /></div>
          <div className="oreq-stat-body">
            <span className="oreq-stat-label">Total Requests</span>
            <span className="oreq-stat-number">{statCounts.total}</span>
          </div>
        </div>
        <div className="oreq-stat-card oreq-stat-pending-admin">
          <div className="oreq-stat-icon-wrap"><FiClock size={22} /></div>
          <div className="oreq-stat-body">
            <span className="oreq-stat-label">Pending Admin</span>
            <span className="oreq-stat-number">{statCounts.pendingAdmin}</span>
          </div>
        </div>
        <div className="oreq-stat-card oreq-stat-pending-client">
          <div className="oreq-stat-icon-wrap"><FiPackage size={22} /></div>
          <div className="oreq-stat-body">
            <span className="oreq-stat-label">Pending Client</span>
            <span className="oreq-stat-number">{statCounts.pendingClient}</span>
          </div>
        </div>
        <div className="oreq-stat-card oreq-stat-converted">
          <div className="oreq-stat-icon-wrap"><FiCheckCircle size={22} /></div>
          <div className="oreq-stat-body">
            <span className="oreq-stat-label">Converted</span>
            <span className="oreq-stat-number">{statCounts.converted}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="oreq-filters-bar">
        <div className="oreq-search-wrapper">
          <FiSearch className="oreq-search-icon" size={18} />
          <input
            type="text"
            className="oreq-search-input"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="oreq-filter-group">
          <div className="oreq-dropdown-container" ref={statusRef}>
            <button
              type="button"
              className="oreq-dropdown-trigger"
              onClick={() => setIsStatusOpen(s => !s)}
            >
              <span>{statusFilter === 'ALL' ? 'All Status' : statusFilter.replace(/_/g, ' ')}</span>
              <FiFilter size={14} />
            </button>
            {isStatusOpen && (
              <div className="oreq-dropdown-popover">
                <div className="oreq-dropdown-options">
                  {['ALL', 'PENDING_ADMIN', 'PENDING_CLIENT', 'CONVERTED', 'CANCELED'].map(status => (
                    <div
                      key={status}
                      className="oreq-dropdown-option"
                      onClick={() => { setStatusFilter(status); setIsStatusOpen(false); }}
                    >
                      {status === 'ALL' ? 'All Status' : status.replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="oreq-table-wrapper">
        <table className="oreq-table">
          <thead>
            <tr>
              <th>Request Details</th>
              <th>Type</th>
              <th>Target Due Date</th>
              <th>Status</th>
              <th className="oreq-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="oreq-empty-state">
                  <div className="oreq-loader" />
                  <span>Loading requests...</span>
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="oreq-empty-state">
                  <FiFileText size={40} />
                  <span>No order requests found</span>
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr
                  key={req._id}
                  className="oreq-table-row"
                  onClick={() => navigate(`/order-requests/${req._id}`)}
                >
                  <td>
                    <div className="oreq-info">
                      <span className="oreq-name">{req.name}</span>
                      <span className="oreq-description">{req.description || 'No description'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="oreq-type-badge">{req.type}</span>
                  </td>
                  <td>
                    <span className="oreq-due-date">
                      <FiCalendar size={14} />
                      {formatDate(req.targetDueDate)}
                    </span>
                  </td>
                  <td>
                    <span className={`oreq-status-badge ${getStatusClass(req.status)}`}>
                      {req.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="oreq-actions-group" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="oreq-action-btn oreq-view-btn"
                        onClick={() => navigate(`/order-requests/${req._id}`)}
                        title="View Details"
                      >
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <CreateOrderRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRequestCreated={handleRequestCreated}
      />
    </div>
  );
};

export default OrderRequestsPage;
