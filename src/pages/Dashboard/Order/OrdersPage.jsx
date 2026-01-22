import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiSearch, FiEdit2, FiTrash2, FiLayers, 
  FiArrowLeft, FiPlus,
  FiPackage, FiCheckCircle, FiClock, FiActivity, FiFilter,
  FiChevronRight, FiHash
} from "react-icons/fi";
import api from '../../../services/reqInterceptor';
import EditOrderModal from "../../../components/modals/EditOrderModal";
import CreateOrderModal from "../../../components/modals/CreateOrderModal";
import { useAlert } from "../../../components/ui/AlertProvider";
import './OrderList.css';

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, deptsRes] = await Promise.all([
        api.get(`/orders`),
        api.get(`/departments`)
      ]);
      setOrders(ordersRes.data.orders || []);
      setDepartments(deptsRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      showAlert({
        title: "Error",
        message: "Failed to load orders",
        type: "error"
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      try {
        await api.delete(`/orders/${id}`);
        fetchData();
        showAlert({
          title: "Success",
          message: "Order deleted successfully",
          type: "success"
        });
      } catch (err) {
        showAlert({
          title: "Error",
          message: err.response?.data?.message || "Failed to delete order",
          type: "error"
        });
      }
    }
  };

  const handleOrderCreated = () => {
    fetchData();
    showAlert({
      title: "Success",
      message: "Order created successfully!",
      type: "success"
    });
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.uniqueId?.includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || o.overallStatus === statusFilter;
    const matchesType = typeFilter === "ALL" || (o.type && o.type.toUpperCase() === typeFilter.toUpperCase());
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusClass = (status) => {
    switch(status) {
      case 'READY_TO_START': return 'status-ready';
      case 'DOCS_PENDING': return 'status-pending';
      case 'IN_PROGRESS': return 'status-progress';
      case 'COMPLETED': return 'status-completed';
      case 'DRAFT': return 'status-draft';
      default: return 'status-default';
    }
  };

  return (
    <div className="orders-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>
          <div className="header-text">
            <h1 className="page-title">Order Workflows</h1>
            <p className="page-subtitle">Initialize and manage production cycles</p>
          </div>
        </div>
        <button className="create-btn" onClick={() => setShowAddModal(true)}>
          <FiPlus size={18} />
          <span>New Order</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card stat-total">
          <div className="stat-icon-wrap">
            <FiPackage size={22} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Total Orders</span>
            <span className="stat-number">{orders.length}</span>
          </div>
        </div>
        <div className="stat-card stat-ready">
          <div className="stat-icon-wrap">
            <FiCheckCircle size={22} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Ready to Start</span>
            <span className="stat-number">{orders.filter(o => o.overallStatus === 'READY_TO_START').length}</span>
          </div>
        </div>
        <div className="stat-card stat-docs">
          <div className="stat-icon-wrap">
            <FiClock size={22} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Docs Pending</span>
            <span className="stat-number">{orders.filter(o => o.overallStatus === 'DOCS_PENDING').length}</span>
          </div>
        </div>
        <div className="stat-card stat-production">
          <div className="stat-icon-wrap">
            <FiActivity size={22} />
          </div>
          <div className="stat-body">
            <span className="stat-label">In Production</span>
            <span className="stat-number">{orders.filter(o => o.overallStatus === 'IN_PROGRESS').length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <FiSearch className="search-icon" size={18} />
          <input 
            type="text" 
            className="search-input"
            placeholder="Search by name or ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="filter-group">
          <div className="filter-select-wrap">
            <FiFilter size={14} />
            <select 
              className="filter-select"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="DOCS_PENDING">Docs Pending</option>
              <option value="READY_TO_START">Ready to Start</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>
          <div className="filter-select-wrap">
            <FiLayers size={14} />
            <select 
              className="filter-select"
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="PANT">Pant</option>
              <option value="JACKET">Jacket</option>
              <option value="SHORTS">Shorts</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Details</th>
              <th>Type</th>
              <th>Unique ID</th>
              <th>Status</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <div className="loader-spinner" />
                  <span>Loading orders...</span>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <FiPackage size={40} />
                  <span>No orders found</span>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="table-row">
                  <td>
                    <div 
                      className="order-info clickable"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <span className="order-name">{order.name}</span>
                      <span className="order-client">{order.clientName || 'No client'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">{order.type}</span>
                  </td>
                  <td>
                    <span className="unique-id">
                      <FiHash size={12} />
                      {order.uniqueId?.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.overallStatus)}`}>
                      {order.overallStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="actions-group">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => navigate(`/orders/${order._id}`)}
                        title="View Details"
                      >
                        <FiChevronRight size={18} />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => { setOrderToEdit(order); setShowEditModal(true); }}
                        title="Edit Order"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(order._id)}
                        title="Delete Order"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        departments={departments}
        onOrderCreated={handleOrderCreated}
      />

      
<EditOrderModal 
  isOpen={showEditModal} 
  onClose={() => setShowEditModal(false)} 
  orderData={orderToEdit} 
  onUpdateSuccess={fetchData}
  departments={departments}
/>
    </div>
  );
};

export default OrdersList;