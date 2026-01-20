'use client';

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiSearch, FiEdit2, FiTrash2, FiX, FiLayers, 
  FiInfo, FiUser, FiArrowLeft, FiPlus, FiList, FiFileText,
  FiPackage, FiCheckCircle, FiClock, FiActivity, FiFilter,
  FiChevronRight, FiHash, FiDollarSign, FiMail, FiAlertCircle,
  FiTag, FiAlignLeft
} from "react-icons/fi";
import api from '../../../services/reqInterceptor';
import EditOrderModal from "../../../components/modals/EditOrderModal"; 
import './OrderList.css';

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  
  const [docInput, setDocInput] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");

  const [newOrder, setNewOrder] = useState({
    name: "",
    type: "PANT", 
    description: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    currency: "Rs.",
    requiredDocTypes: [],
    departmentSequenceIds: []
  });

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addDocType = (e) => {
    if (e) e.preventDefault();
    if (docInput.trim()) {
      const formattedDoc = docInput.trim().toUpperCase().replace(/\s+/g, '_');
      if (!newOrder.requiredDocTypes.includes(formattedDoc)) {
        setNewOrder(prev => ({
          ...prev,
          requiredDocTypes: [...prev.requiredDocTypes, formattedDoc]
        }));
      }
      setDocInput(""); 
    }
  };

  const removeDocType = (doc) => {
    setNewOrder(prev => ({
      ...prev,
      requiredDocTypes: prev.requiredDocTypes.filter(d => d !== doc)
    }));
  };

  const addDeptToSequence = (e) => {
    if (e) e.preventDefault();
    if (selectedDeptId) {
      setNewOrder(prev => ({
        ...prev,
        departmentSequenceIds: [...prev.departmentSequenceIds, selectedDeptId]
      }));
      setSelectedDeptId("");
    }
  };

  const removeDeptFromSequence = (index) => {
    setNewOrder(prev => {
      const updatedSeq = [...prev.departmentSequenceIds];
      updatedSeq.splice(index, 1);
      return { ...prev, departmentSequenceIds: updatedSeq };
    });
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!newOrder.name.trim()) errors.name = "Order name is required";
      if (!newOrder.amount) errors.amount = "Quote amount is required";
    }
    
    if (step === 2) {
      if (!newOrder.clientName.trim()) errors.clientName = "Client name is required";
      if (!newOrder.clientEmail.trim()) {
        errors.clientEmail = "Client email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOrder.clientEmail)) {
        errors.clientEmail = "Please enter a valid email";
      }
    }
    
    if (step === 3) {
      if (newOrder.departmentSequenceIds.length === 0) {
        errors.departments = "At least one department is required";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setFormStep(prev => Math.max(prev - 1, 1));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    
    try {
      await api.post(`/orders`, newOrder);
      setShowAddModal(false);
      fetchData();
      alert("Order Created Successfully!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed to create order"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      try {
        await api.delete(`/orders/${id}`);
        fetchData();
      } catch (err) {
        alert("Error: " + (err.response?.data?.message || "Failed to delete"));
      }
    }
  };

  const resetAndOpenAddModal = () => {
    setNewOrder({
      name: "", 
      type: "PANT", 
      description: "", 
      clientName: "", 
      clientEmail: "", 
      amount: "", 
      currency: "Rs.", 
      requiredDocTypes: [], 
      departmentSequenceIds: []
    });
    setFormStep(1);
    setFormErrors({});
    setShowAddModal(true);
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

  const garmentTypes = [
    { value: 'PANT', label: 'Pant' },
    { value: 'JACKET', label: 'Jacket' },
    { value: 'SHORTS', label: 'Shorts' },
    { value: 'OTHER', label: 'Other' }
  ];

  const stepInfo = [
    { num: 1, title: 'Order Details', icon: FiInfo },
    { num: 2, title: 'Client Info', icon: FiUser },
    { num: 3, title: 'Workflow', icon: FiLayers },
    { num: 4, title: 'Documents', icon: FiFileText }
  ];

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
        <button className="create-btn" onClick={resetAndOpenAddModal}>
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
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon">
                  <FiPlus size={24} />
                </div>
                <div>
                  <h2 className="modal-title">Create New Order</h2>
                  <p className="modal-subtitle">Configure order details, client info and workflow</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            {/* Step Progress Indicator */}
            <div className="step-progress">
              {stepInfo.map((step, idx) => (
                <div 
                  key={step.num}
                  className={`step-item ${formStep === step.num ? 'active' : ''} ${formStep > step.num ? 'completed' : ''}`}
                  onClick={() => formStep > step.num && setFormStep(step.num)}
                >
                  <div className="step-circle">
                    {formStep > step.num ? <FiCheckCircle size={16} /> : <step.icon size={16} />}
                  </div>
                  <span className="step-label">{step.title}</span>
                  {idx < stepInfo.length - 1 && <div className="step-line" />}
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateOrder} className="modal-form">
              <div className="modal-body">
                {/* Step 1: Order Details */}
                {formStep === 1 && (
                  <div className="form-step">
                    <div className="step-header">
                      <FiInfo size={20} />
                      <div>
                        <h3>Order Details</h3>
                        <p>Enter the basic information for this order</p>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Reference Name <span className="required">*</span>
                      </label>
                      <input 
                        type="text" 
                        className={`form-input ${formErrors.name ? 'error' : ''}`}
                        value={newOrder.name} 
                        onChange={(e) => setNewOrder({...newOrder, name: e.target.value})} 
                        placeholder="e.g., Summer Collection Batch 01"
                      />
                      {formErrors.name && (
                        <span className="error-message">
                          <FiAlertCircle size={12} /> {formErrors.name}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Garment Type</label>
                      <div className="garment-type-grid">
                        {garmentTypes.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            className={`garment-type-btn ${newOrder.type === type.value ? 'selected' : ''}`}
                            onClick={() => setNewOrder({...newOrder, type: type.value})}
                          >
                            <FiTag size={18} />
                            <span className="garment-label">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Financial Quote <span className="required">*</span>
                      </label>
                      <div className="input-combo">
                        <select 
                          className="combo-prefix"
                          value={newOrder.currency} 
                          onChange={(e) => setNewOrder({...newOrder, currency: e.target.value})}
                        >
                          <option value="Rs.">Rs.</option>
                          <option value="$">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                        <input 
                          type="number" 
                          className={`combo-input ${formErrors.amount ? 'error' : ''}`}
                          value={newOrder.amount} 
                          onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})} 
                          placeholder="0.00"
                        />
                      </div>
                      {formErrors.amount && (
                        <span className="error-message">
                          <FiAlertCircle size={12} /> {formErrors.amount}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description (Optional)</label>
                      <textarea 
                        className="form-textarea"
                        value={newOrder.description} 
                        onChange={(e) => setNewOrder({...newOrder, description: e.target.value})} 
                        placeholder="Add notes or special instructions for this order..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Client Information */}
                {formStep === 2 && (
                  <div className="form-step">
                    <div className="step-header">
                      <FiUser size={20} />
                      <div>
                        <h3>Client Information</h3>
                        <p>Enter the client details for this order</p>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Client Name <span className="required">*</span>
                      </label>
                      <div className="input-with-icon">
                        <FiUser className="input-icon" size={18} />
                        <input 
                          type="text" 
                          className={`form-input with-icon ${formErrors.clientName ? 'error' : ''}`}
                          value={newOrder.clientName} 
                          onChange={(e) => setNewOrder({...newOrder, clientName: e.target.value})} 
                          placeholder="Enter client's full name"
                        />
                      </div>
                      {formErrors.clientName && (
                        <span className="error-message">
                          <FiAlertCircle size={12} /> {formErrors.clientName}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Client Email <span className="required">*</span>
                      </label>
                      <div className="input-with-icon">
                        <FiMail className="input-icon" size={18} />
                        <input 
                          type="email" 
                          className={`form-input with-icon ${formErrors.clientEmail ? 'error' : ''}`}
                          value={newOrder.clientEmail} 
                          onChange={(e) => setNewOrder({...newOrder, clientEmail: e.target.value})} 
                          placeholder="client@example.com"
                        />
                      </div>
                      {formErrors.clientEmail && (
                        <span className="error-message">
                          <FiAlertCircle size={12} /> {formErrors.clientEmail}
                        </span>
                      )}
                    </div>

                    <div className="client-preview-card">
                      <div className="preview-avatar">
                        {newOrder.clientName ? newOrder.clientName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="preview-info">
                        <span className="preview-name">{newOrder.clientName || 'Client Name'}</span>
                        <span className="preview-email">{newOrder.clientEmail || 'client@email.com'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Department Workflow */}
                {formStep === 3 && (
                  <div className="form-step">
                    <div className="step-header">
                      <FiLayers size={20} />
                      <div>
                        <h3>Department Workflow</h3>
                        <p>Define the production sequence for this order</p>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Add Department to Sequence</label>
                      <div className="adder-row">
                        <select 
                          className="form-select"
                          value={selectedDeptId} 
                          onChange={(e) => setSelectedDeptId(e.target.value)}
                        >
                          <option value="">Select Department...</option>
                          {departments.map(d => (
                            <option key={d._id} value={d._id}>{d.name}</option>
                          ))}
                        </select>
                        <button 
                          type="button" 
                          className="add-btn"
                          onClick={addDeptToSequence}
                          disabled={!selectedDeptId}
                        >
                          <FiPlus size={16} />
                          Add
                        </button>
                      </div>
                      {formErrors.departments && (
                        <span className="error-message">
                          <FiAlertCircle size={12} /> {formErrors.departments}
                        </span>
                      )}
                    </div>

                    <div className="workflow-sequence">
                      <div className="sequence-label">
                        <FiList size={14} />
                        <span>Production Sequence ({newOrder.departmentSequenceIds.length} steps)</span>
                      </div>
                      <div className="sequence-list">
                        {newOrder.departmentSequenceIds.length === 0 ? (
                          <div className="sequence-empty">
                            <FiLayers size={32} />
                            <span>No departments added yet</span>
                            <p>Add departments above to define the workflow</p>
                          </div>
                        ) : (
                          newOrder.departmentSequenceIds.map((id, index) => {
                            const dept = departments.find(d => d._id === id);
                            return (
                              <div key={index} className="sequence-item">
                                <div className="sequence-connector">
                                  <span className="sequence-num">{index + 1}</span>
                                  {index < newOrder.departmentSequenceIds.length - 1 && (
                                    <div className="connector-line" />
                                  )}
                                </div>
                                <div className="sequence-content">
                                  <span className="sequence-name">{dept?.name || 'Unknown'}</span>
                                  <span className="sequence-meta">Step {index + 1} of {newOrder.departmentSequenceIds.length}</span>
                                </div>
                                <button 
                                  type="button"
                                  className="sequence-remove"
                                  onClick={() => removeDeptFromSequence(index)}
                                >
                                  <FiX size={16} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Required Documents */}
                {formStep === 4 && (
                  <div className="form-step">
                    <div className="step-header">
                      <FiFileText size={20} />
                      <div>
                        <h3>Required Documents</h3>
                        <p>Specify documents needed before production starts</p>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Add Document Type</label>
                      <div className="adder-row">
                        <input 
                          type="text" 
                          className="form-input"
                          placeholder="e.g., TECH_PACK, FABRIC_SAMPLE"
                          value={docInput} 
                          onChange={(e) => setDocInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addDocType(e)} 
                        />
                        <button 
                          type="button" 
                          className="add-btn"
                          onClick={addDocType}
                          disabled={!docInput.trim()}
                        >
                          <FiPlus size={16} />
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="documents-container">
                      <div className="docs-label">
                        <FiFileText size={14} />
                        <span>Required Documents ({newOrder.requiredDocTypes.length})</span>
                      </div>
                      <div className="docs-list">
                        {newOrder.requiredDocTypes.length === 0 ? (
                          <div className="docs-empty">
                            <FiFileText size={32} />
                            <span>No documents required</span>
                            <p>Add document types above if needed</p>
                          </div>
                        ) : (
                          <div className="docs-tags">
                            {newOrder.requiredDocTypes.map((doc, idx) => (
                              <span key={idx} className="doc-tag">
                                <FiFileText size={12} />
                                {doc}
                                <button 
                                  type="button"
                                  className="tag-remove"
                                  onClick={() => removeDocType(doc)}
                                >
                                  <FiX size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                      <div className="summary-title">
                        <FiCheckCircle size={16} />
                        <span>Order Summary</span>
                      </div>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span className="summary-label">Order Name</span>
                          <span className="summary-value">{newOrder.name || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Type</span>
                          <span className="summary-value">{newOrder.type}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Quote</span>
                          <span className="summary-value">{newOrder.currency} {newOrder.amount || '0'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Client</span>
                          <span className="summary-value">{newOrder.clientName || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Workflow Steps</span>
                          <span className="summary-value">{newOrder.departmentSequenceIds.length}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Documents</span>
                          <span className="summary-value">{newOrder.requiredDocTypes.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <div className="footer-left">
                  <button 
                    type="button" 
                    className="btn-ghost"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
                <div className="footer-right">
                  {formStep > 1 && (
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={handlePrevStep}
                    >
                      <FiArrowLeft size={16} />
                      Previous
                    </button>
                  )}
                  {formStep < 4 && (
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={handleNextStep}
                    >
                      Next Step
                      <FiChevronRight size={16} />
                    </button>
                  )}
                  {formStep === 4 && (
                    <button type="submit" className="btn-primary btn-success btn-create">
                      <FiCheckCircle size={16} />
                      Create Order
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <EditOrderModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        orderData={orderToEdit} 
        onUpdateSuccess={fetchData} 
      />
    </div>
  );
};

export default OrdersList;
