import { useState, useEffect } from "react";
import { FiPlus,
  FiX, FiEdit2, FiInfo, FiUser, FiLayers, FiFileText, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiArrowLeft, FiChevronRight,
  FiTag, FiMail, FiList, FiTrash2
} from "react-icons/fi";
import api from "../../services/reqInterceptor";
import { useAlert } from "../../components/ui/AlertProvider";
import './CreateOrderModal.css';

const EditOrderModal = ({ isOpen, onClose, orderData, onUpdateSuccess, departments }) => {
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [docInput, setDocInput] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const { showAlert } = useAlert();

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const [editedOrder, setEditedOrder] = useState({
    name: "",
    type: "PANT",
    description: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    currency: "Rs.",
    dueDate: "",
    requiredDocTypes: [],
    departmentSequenceIds: []
  });

  useEffect(() => {
    if (orderData && isOpen) {
      // Transform the order data to match our form structure
      setEditedOrder({
        name: orderData.name || "",
        type: orderData.type || "PANT",
        description: orderData.description || "",
        clientName: orderData.clientName || "",
        clientEmail: orderData.clientEmail || "",
        amount: orderData.amount || "",
        currency: orderData.currency || "Rs.",
        dueDate: orderData.dueDate ? formatDateForInput(orderData.dueDate) : "",
        requiredDocTypes: orderData.requiredDocuments?.map(d => d.docType) || [],
        departmentSequenceIds: orderData.departmentSequence?.map(d => d._id || d) || []
      });
      setFormStep(1);
      setFormErrors({});
      setDocInput("");
      setSelectedDeptId("");
    }
  }, [orderData, isOpen]);

  const stepInfo = [
    { num: 1, title: 'Order Details', icon: FiInfo },
    { num: 2, title: 'Client Info', icon: FiUser },
    { num: 3, title: 'Workflow', icon: FiLayers },
    { num: 4, title: 'Documents', icon: FiFileText }
  ];

  const garmentTypes = [
    { value: 'PANT', label: 'Pant' },
    { value: 'JACKET', label: 'Jacket' },
    { value: 'SHORTS', label: 'Shorts' },
    { value: 'OTHER', label: 'Other' }
  ];

  const addDocType = (e) => {
    if (e) e.preventDefault();
    if (docInput.trim()) {
      const formattedDoc = docInput.trim().toUpperCase().replace(/\s+/g, '_');
      if (!editedOrder.requiredDocTypes.includes(formattedDoc)) {
        setEditedOrder(prev => ({
          ...prev,
          requiredDocTypes: [...prev.requiredDocTypes, formattedDoc]
        }));
      }
      setDocInput("");
    }
  };

  const removeDocType = (doc) => {
    setEditedOrder(prev => ({
      ...prev,
      requiredDocTypes: prev.requiredDocTypes.filter(d => d !== doc)
    }));
  };

  const addDeptToSequence = (e) => {
    if (e) e.preventDefault();
    if (selectedDeptId) {
      setEditedOrder(prev => ({
        ...prev,
        departmentSequenceIds: [...prev.departmentSequenceIds, selectedDeptId]
      }));
      setSelectedDeptId("");
    }
  };

  const removeDeptFromSequence = (index) => {
    setEditedOrder(prev => {
      const updatedSeq = [...prev.departmentSequenceIds];
      updatedSeq.splice(index, 1);
      return { ...prev, departmentSequenceIds: updatedSeq };
    });
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!editedOrder.name.trim()) errors.name = "Order name is required";
      if (!editedOrder.amount) errors.amount = "Quote amount is required";
      if (!editedOrder.dueDate) errors.dueDate = "Due date is required";
      
      // Validate due date is not in the past
      if (editedOrder.dueDate) {
        const selectedDate = new Date(editedOrder.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare dates only
        
        if (selectedDate < today) {
          errors.dueDate = "Due date cannot be in the past";
        }
      }
    }
    
    if (step === 2) {
      if (!editedOrder.clientName.trim()) errors.clientName = "Client name is required";
      if (!editedOrder.clientEmail.trim()) {
        errors.clientEmail = "Client email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedOrder.clientEmail)) {
        errors.clientEmail = "Please enter a valid email";
      }
    }
    
    if (step === 3) {
      if (editedOrder.departmentSequenceIds.length === 0) {
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

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    
    try {
      const payload = {
        name: editedOrder.name,
        type: editedOrder.type,
        amount: Number(editedOrder.amount),
        currency: editedOrder.currency,
        dueDate: editedOrder.dueDate ? new Date(editedOrder.dueDate).toISOString() : null,
        description: editedOrder.description,
        clientName: editedOrder.clientName,
        clientEmail: editedOrder.clientEmail,
        requiredDocTypes: editedOrder.requiredDocTypes,
        departmentSequenceIds: editedOrder.departmentSequenceIds
      };

      await api.put(`/orders/${orderData.uniqueId}`, payload);
      
      showAlert({
        title: "Success",
        message: "Order updated successfully!",
        type: "success"
      });
      
      onUpdateSuccess();
      onClose();
    } catch (err) {
      showAlert({
        title: "Error",
        message: err.response?.data?.message || "Failed to update order",
        type: "error"
      });
    }
  };

  const resetForm = () => {
    setEditedOrder({
      name: "",
      type: "PANT",
      description: "",
      clientName: "",
      clientEmail: "",
      amount: "",
      currency: "Rs.",
      dueDate: "",
      requiredDocTypes: [],
      departmentSequenceIds: []
    });
    setFormStep(1);
    setFormErrors({});
    setDocInput("");
    setSelectedDeptId("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !orderData) return null;

  // Get department names for display
  const getDeptName = (id) => {
    const dept = departments.find(d => d._id === id);
    return dept?.name || "Unknown Department";
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-container modal-lg edit-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <FiEdit2 size={24} />
            </div>
            <div>
              <h2 className="modal-title">Edit Order</h2>
              <p className="modal-subtitle">Update order: {orderData.uniqueId || orderData._id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
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

        <form onSubmit={handleUpdateOrder} className="modal-form">
          <div className="modal-body">
            {/* Step 1: Order Details */}
            {formStep === 1 && (
              <div className="form-step">
                <div className="step-header">
                  <FiInfo size={20} />
                  <div>
                    <h3>Order Details</h3>
                    <p>Update the basic information for this order</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Reference Name <span className="required">*</span>
                  </label>
                  <input 
                    type="text" 
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                    value={editedOrder.name} 
                    onChange={(e) => setEditedOrder({...editedOrder, name: e.target.value})} 
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
                        className={`garment-type-btn ${editedOrder.type === type.value ? 'selected' : ''}`}
                        onClick={() => setEditedOrder({...editedOrder, type: type.value})}
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
                      value={editedOrder.currency} 
                      onChange={(e) => setEditedOrder({...editedOrder, currency: e.target.value})}
                    >
                      <option value="Rs.">Rs.</option>
                      <option value="$">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <input 
                      type="number" 
                      className={`combo-input ${formErrors.amount ? 'error' : ''}`}
                      value={editedOrder.amount} 
                      onChange={(e) => setEditedOrder({...editedOrder, amount: e.target.value})} 
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {formErrors.amount && (
                    <span className="error-message">
                      <FiAlertCircle size={12} /> {formErrors.amount}
                    </span>
                  )}
                </div>

                {/* Due Date Field - Added */}
                <div className="form-group">
                  <label className="form-label">
                    Due Date <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <FiCalendar className="input-icon" size={18} />
                    <input 
                      type="date" 
                      className={`form-input with-icon ${formErrors.dueDate ? 'error' : ''}`}
                      value={editedOrder.dueDate} 
                      onChange={(e) => setEditedOrder({...editedOrder, dueDate: e.target.value})} 
                      min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    />
                  </div>
                  {formErrors.dueDate && (
                    <span className="error-message">
                      <FiAlertCircle size={12} /> {formErrors.dueDate}
                    </span>
                  )}
                  <div className="date-hint">
                    <FiInfo size={12} />
                    <span>Select the expected completion date for this order</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea 
                    className="form-textarea"
                    value={editedOrder.description} 
                    onChange={(e) => setEditedOrder({...editedOrder, description: e.target.value})} 
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
                    <p>Update the client details for this order</p>
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
                      value={editedOrder.clientName} 
                      onChange={(e) => setEditedOrder({...editedOrder, clientName: e.target.value})} 
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
                      value={editedOrder.clientEmail} 
                      onChange={(e) => setEditedOrder({...editedOrder, clientEmail: e.target.value})} 
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
                    {editedOrder.clientName ? editedOrder.clientName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="preview-info">
                    <span className="preview-name">{editedOrder.clientName || 'Client Name'}</span>
                    <span className="preview-email">{editedOrder.clientEmail || 'client@email.com'}</span>
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
                    <p>Update the production sequence for this order</p>
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
                        <option key={d._id} value={d._id} disabled={editedOrder.departmentSequenceIds.includes(d._id)}>
                          {d.name}
                        </option>
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
                    <span>Production Sequence ({editedOrder.departmentSequenceIds.length} steps)</span>
                  </div>
                  <div className="sequence-list">
                    {editedOrder.departmentSequenceIds.length === 0 ? (
                      <div className="sequence-empty">
                        <FiLayers size={32} />
                        <span>No departments added yet</span>
                        <p>Add departments above to define the workflow</p>
                      </div>
                    ) : (
                      editedOrder.departmentSequenceIds.map((id, index) => {
                        const deptName = getDeptName(id);
                        return (
                          <div key={index} className="sequence-item">
                            <div className="sequence-connector">
                              <span className="sequence-num">{index + 1}</span>
                              {index < editedOrder.departmentSequenceIds.length - 1 && (
                                <div className="connector-line" />
                              )}
                            </div>
                            <div className="sequence-content">
                              <span className="sequence-name">{deptName}</span>
                              <span className="sequence-meta">Step {index + 1} of {editedOrder.departmentSequenceIds.length}</span>
                            </div>
                            <button 
                              type="button"
                              className="sequence-remove"
                              onClick={() => removeDeptFromSequence(index)}
                            >
                              <FiTrash2 size={14} />
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
                    <p>Update documents needed before production starts</p>
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
                    <span>Required Documents ({editedOrder.requiredDocTypes.length})</span>
                  </div>
                  <div className="docs-list">
                    {editedOrder.requiredDocTypes.length === 0 ? (
                      <div className="docs-empty">
                        <FiFileText size={32} />
                        <span>No documents required</span>
                        <p>Add document types above if needed</p>
                      </div>
                    ) : (
                      <div className="docs-tags">
                        {editedOrder.requiredDocTypes.map((doc, idx) => (
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

                {/* Order Summary - Updated with Due Date */}
                <div className="order-summary edit-order-summary">
                  <div className="summary-title">
                    <FiCheckCircle size={16} />
                    <span>Order Summary</span>
                  </div>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Order Name</span>
                      <span className="summary-value">{editedOrder.name || '-'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Type</span>
                      <span className="summary-value">{editedOrder.type}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Quote</span>
                      <span className="summary-value">{editedOrder.currency} {editedOrder.amount || '0'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Due Date</span>
                      <span className="summary-value">
                        {editedOrder.dueDate ? new Date(editedOrder.dueDate).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Client</span>
                      <span className="summary-value">{editedOrder.clientName || '-'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Workflow Steps</span>
                      <span className="summary-value">{editedOrder.departmentSequenceIds.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Documents</span>
                      <span className="summary-value">{editedOrder.requiredDocTypes.length}</span>
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
                onClick={handleClose}
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
                <button type="submit" className="btn-primary btn-success btn-update">
                  <FiCheckCircle size={16} />
                  Update Order
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;