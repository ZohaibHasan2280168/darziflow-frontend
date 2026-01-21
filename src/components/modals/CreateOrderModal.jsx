import { useState } from "react";
import { 
  FiX, FiPlus, FiInfo, FiUser, FiLayers, FiFileText,
  FiCheckCircle, FiAlertCircle, FiArrowLeft, FiChevronRight,
  FiTag, FiMail, FiList
} from "react-icons/fi";
import api from '../../services/reqInterceptor';
import { useAlert } from "../../components/ui/AlertProvider";
import './CreateOrderModal.css';

const CreateOrderModal = ({ 
  isOpen, 
  onClose, 
  departments, 
  onOrderCreated 
}) => {
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [docInput, setDocInput] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const { showAlert } = useAlert();

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
      onClose();
      onOrderCreated();
    } catch (err) {
      // Note: The AlertProvider will sanitize the message automatically
      showAlert({
        title: "Error",
        message: err.response?.data?.message || "Failed to create order",
        type: "error"
      });
    }
  };

  const resetForm = () => {
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
    setDocInput("");
    setSelectedDeptId("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
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
  );
};

export default CreateOrderModal;