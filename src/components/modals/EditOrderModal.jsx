import { useState, useEffect } from "react";
import {
  FiX, FiPlus, FiEdit2, FiInfo, FiUser, FiLayers, FiFileText, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiArrowLeft, FiChevronRight,
  FiTag, FiMail, FiChevronUp, FiChevronDown, FiLoader, FiTrash2
} from "react-icons/fi";
import api from "../../services/reqInterceptor";
import { useAlert } from "../../components/ui/AlertProvider";
import './CreateOrderModal.css';

const EditOrderModal = ({ isOpen, onClose, orderData, onUpdateSuccess, departments }) => {
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [docInput, setDocInput] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedQCId, setSelectedQCId] = useState("");
  const { showAlert } = useAlert();

  const [departmentsList, setDepartmentsList] = useState(departments || []);
  const [qcMembersList, setQCMembersList] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingQC, setLoadingQC] = useState(false);
  const [departmentsError, setDepartmentsError] = useState("");
  const [qcError, setQcError] = useState("");

  const [checkingUser, setCheckingUser] = useState(false);
  const [userExistsStatus, setUserExistsStatus] = useState(null);
  const [matchedUserId, setMatchedUserId] = useState(null);

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
    departmentSequenceIds: [],
    qcMemberId: ""
  });

  useEffect(() => {
    if (orderData && isOpen) {
      const baseDocsArray = orderData.requiredDocuments || orderData.requiredDocTypes || [];
      const extractedTypes = [];

      baseDocsArray.forEach(d => {
        const typeStr = d.docType || d;
        if (typeStr && typeof typeStr === 'string') {
          extractedTypes.push(typeStr);
        }
      });

      setEditedOrder({
        name: orderData.name || "",
        type: orderData.type || "PANT",
        description: orderData.description || "",
        clientName: orderData.clientName || "",
        clientEmail: orderData.clientEmail || "",
        amount: orderData.amount || "",
        currency: orderData.currency || "Rs.",
        dueDate: orderData.dueDate ? formatDateForInput(orderData.dueDate) : "",
        requiredDocTypes: extractedTypes,
        departmentSequenceIds: orderData.departmentSequence?.map(d => d._id || d) || orderData.departmentSequenceIds || [],
        qcMemberId: orderData.qcMember?._id || orderData.qcMemberId || ""
      });

      setFormStep(1);
      setFormErrors({});
      setDocInput("");
      setSelectedDeptId("");
      setSelectedQCId(orderData.qcMember?._id || orderData.qcMemberId || "");
      setUserExistsStatus('EXISTS');
      const rawClientId = orderData.clientId?._id || orderData.clientId || null;
      setMatchedUserId(rawClientId ? String(rawClientId) : null);
    }
  }, [orderData, isOpen]);

  const stepInfo = [
    { num: 1, title: 'Details', icon: FiInfo },
    { num: 2, title: 'Client Info', icon: FiUser },
    { num: 3, title: 'Workflow', icon: FiLayers },
    { num: 4, title: 'Doc Specifications', icon: FiFileText }
  ];

  // Strictly syncs with backend validation schema
  const garmentTypes = [
    { value: 'PANT', label: 'Pant' },
    { value: 'JACKET', label: 'Jacket' },
    { value: 'SHORTS', label: 'Shorts' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleEmailBlur = async () => {
    const email = editedOrder.clientEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    try {
      setCheckingUser(true);
      const response = await api.get(`/users?email=${email}`);
      const data = response.data?.users || response.data || [];
      const match = Array.isArray(data) ? data.find(u => u.email?.toLowerCase() === email.toLowerCase()) : null;

      if (match) {
        setUserExistsStatus('EXISTS');
        setMatchedUserId(match._id || match.id);
      } else {
        setUserExistsStatus('NOT_FOUND');
        setMatchedUserId(null);
      }
    } catch (err) {
      setUserExistsStatus(null);
    } finally {
      setCheckingUser(false);
    }
  };

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

  const addDeptToSequence = () => {
    if (selectedDeptId) {
      setEditedOrder(prev => ({
        ...prev,
        departmentSequenceIds: [...prev.departmentSequenceIds, selectedDeptId]
      }));
      setSelectedDeptId("");
    }
  };

  const moveDept = (index, direction) => {
    setEditedOrder(prev => {
      const seq = [...prev.departmentSequenceIds];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= seq.length) return prev;
      const tmp = seq[newIndex];
      seq[newIndex] = seq[index];
      seq[index] = tmp;
      return { ...prev, departmentSequenceIds: seq };
    });
  };

  const removeDeptFromSequence = (index) => {
    setEditedOrder(prev => {
      const updatedSeq = [...prev.departmentSequenceIds];
      updatedSeq.splice(index, 1);
      return { ...prev, departmentSequenceIds: updatedSeq };
    });
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      if (departments && departments.length) return;
      try {
        setLoadingDepartments(true);
        setDepartmentsError("");
        const res = await api.get('/departments');
        setDepartmentsList(res.data?.departments || res.data || []);
      } catch (err) {
        setDepartmentsError('Failed to sync pipelines.');
      } finally {
        setLoadingDepartments(false);
      }
    };
    if (isOpen) fetchDepartments();
  }, [isOpen, departments]);

  useEffect(() => {
    const fetchQCMembers = async () => {
      try {
        setLoadingQC(true);
        setQcError("");
        const res = await api.get('/users/qc-members');
        setQCMembersList(res.data?.data || []);
      } catch (err) {
        setQcError('Failed to load QC members.');
      } finally {
        setLoadingQC(false);
      }
    };
    if (isOpen) fetchQCMembers();
  }, [isOpen]);

  const validateStep = (step) => {
    const errors = {};
    if (step === 1 || step === 'all') {
      if (!editedOrder.name.trim()) errors.name = "Order name required";
      if (!editedOrder.amount) errors.amount = "Quote metric required";
      if (!editedOrder.dueDate) errors.dueDate = "Target deadline parameters required";
    }
    if (step === 2 || step === 'all') {
      if (!editedOrder.clientName.trim()) errors.clientName = "Client identity name required";
      if (!editedOrder.clientEmail.trim()) errors.clientEmail = "Client email required";
    }
    if (step === 3 || step === 'all') {
      if (editedOrder.departmentSequenceIds.length === 0) errors.departments = "Workflow route tracks required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) setFormStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setFormStep(prev => Math.max(prev - 1, 1));
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!validateStep('all')) return;

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
        departmentSequenceIds: editedOrder.departmentSequenceIds,
        requiredDocTypes: editedOrder.requiredDocTypes
      };

      if (editedOrder.qcMemberId) {
        payload.qcMemberId = editedOrder.qcMemberId;
      }

      if (userExistsStatus === 'EXISTS' && matchedUserId) {
        payload.clientId = matchedUserId;
      }

      const activeOrderId = orderData._id || orderData.id;
      await api.put(`/order/${activeOrderId}`, payload);

      showAlert({
        title: "Updated Successfully",
        message: "Order blueprint modified cleanly.",
        type: "success"
      });
      onUpdateSuccess();
      onClose();
    } catch (err) {
      showAlert({
        title: "Update Failed",
        message: err.response?.data?.message || "Failed to update target configurations.",
        type: "error"
      });
    }
  };

  if (!isOpen || !orderData) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon"><FiEdit2 size={24} /></div>
            <div>
              <h2 className="modal-title">Edit Order Parameters</h2>
              <p className="modal-subtitle">Track Code: {orderData.uniqueId || orderData._id?.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><FiX size={20} /></button>
        </div>

        <div className="step-progress">
          {stepInfo.map((step) => (
            <div
              key={step.num}
              className={`step-item ${formStep === step.num ? 'active' : ''} ${formStep > step.num ? 'completed' : ''}`}
            >
              <div className="step-circle"><step.icon size={14} /></div>
              <span className="step-label">{step.title}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleUpdateOrder} className="modal-form">
          <div className="modal-body">
            {formStep === 1 && (
              <div className="form-step">
                <div className="form-group">
                  <label className="form-label">Reference Operational Name</label>
                  <input type="text" className="form-input" value={editedOrder.name} onChange={(e) => setEditedOrder({ ...editedOrder, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Garment Configuration Category</label>
                  <div className="garment-type-grid">
                    {garmentTypes.map(g => (
                      <button key={g.value} type="button" className={`garment-type-btn ${editedOrder.type === g.value ? 'selected' : ''}`} onClick={() => setEditedOrder({ ...editedOrder, type: g.value })}>{g.label}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Financial Evaluation Valuation</label>
                  <input type="number" className="form-input" value={editedOrder.amount} onChange={(e) => setEditedOrder({ ...editedOrder, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Commitment Deadline</label>
                  <input type="date" className="form-input" value={editedOrder.dueDate} onChange={(e) => setEditedOrder({ ...editedOrder, dueDate: e.target.value })} />
                </div>
              </div>
            )}

            {formStep === 2 && (
              <div className="form-step">
                <div className="form-group">
                  <label className="form-label">Client System Communication Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editedOrder.clientEmail}
                    onChange={(e) => setEditedOrder({ ...editedOrder, clientEmail: e.target.value })}
                    onBlur={handleEmailBlur}
                  />
                  {checkingUser && <span className="inline-loader-text"><FiLoader className="spin" size={12} /> Auditing logs...</span>}
                  {userExistsStatus === 'EXISTS' && (
                    <div className="field-suggestion-box status-exists">
                      <FiCheckCircle size={14} /> <span>User recognized correctly. Order updates will preserve identity linkage.</span>
                    </div>
                  )}
                  {userExistsStatus === 'NOT_FOUND' && (
                    <div className="field-suggestion-box status-missing">
                      <FiAlertCircle size={14} /> <span>User not registered in standard directories.</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Client Registered Name</label>
                  <input type="text" className="form-input" value={editedOrder.clientName} onChange={(e) => setEditedOrder({ ...editedOrder, clientName: e.target.value })} />
                </div>
              </div>
            )}

            {formStep === 3 && (
              <div className="form-step">
                <div className="form-group">
                  <label className="form-label">Modify Processing Path Map</label>
                  <div className="adder-row">
                    <select className="form-select" value={selectedDeptId} onChange={(e) => setSelectedDeptId(e.target.value)}>
                      <option value="">Select Processing Department...</option>
                      {departmentsList.map(d => (
                        <option key={d._id} value={d._id} disabled={editedOrder.departmentSequenceIds.includes(d._id)}>{d.name}</option>
                      ))}
                    </select>
                    <button type="button" className="add-btn" onClick={addDeptToSequence}>Link Node</button>
                  </div>
                </div>
                <div className="workflow-sequence">
                  {editedOrder.departmentSequenceIds.map((id, index) => {
                    const deptNode = departmentsList.find(d => d._id === id);
                    return (
                      <div key={index} className="sequence-item">
                        <span>{index + 1}. {deptNode?.name || 'Department Track Line'}</span>
                        <div className="sequence-actions">
                          <button type="button" onClick={() => moveDept(index, 'up')} disabled={index === 0}><FiChevronUp /></button>
                          <button type="button" onClick={() => moveDept(index, 'down')} disabled={index === editedOrder.departmentSequenceIds.length - 1}><FiChevronDown /></button>
                          <button type="button" onClick={() => removeDeptFromSequence(index)}><FiTrash2 /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="form-label">Assign Quality Control (QC) Member</label>
                  <select
                    className="form-select"
                    value={selectedQCId}
                    onChange={(e) => {
                      setSelectedQCId(e.target.value);
                      setEditedOrder({ ...editedOrder, qcMemberId: e.target.value });
                    }}
                    disabled={loadingQC}
                  >
                    <option value="">Select QC Member...</option>
                    {(qcMembersList || []).map(qc => (
                      <option key={qc._id} value={qc._id}>{qc.name}</option>
                    ))}
                  </select>
                  {loadingQC && <span className="inline-loader-text"><FiLoader className="spin" size={12} /> Loading QC members...</span>}
                  {qcError && <span className="error-message"><FiAlertCircle size={12} /> {qcError}</span>}
                  {editedOrder.qcMemberId && (
                    <div className="field-suggestion-box status-exists">
                      <FiCheckCircle size={14} />
                      <span>QC member assigned: {qcMembersList.find(q => q._id === editedOrder.qcMemberId)?.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {formStep === 4 && (
              <div className="form-step">
                <div className="form-group">
                  <label className="form-label">Append Specification Verification Rules</label>
                  <div className="adder-row">
                    <input type="text" className="form-input" value={docInput} onChange={(e) => setDocInput(e.target.value)} placeholder="e.g., SEWING_GUIDE" />
                    <button type="button" className="add-btn" onClick={addDocType}>Add Rule Block</button>
                  </div>
                </div>

                <div className="documents-container">
                  <div className="docs-upload-master-grid">
                    {editedOrder.requiredDocTypes.map((docType, index) => (
                      <div key={index} className="document-upload-card-row">
                        <div className="doc-meta-info">
                          <span className="doc-type-badge">{docType}</span>
                          <span className="doc-file-assigned-name" style={{ fontStyle: 'italic' }}>Managed on tracking panel</span>
                        </div>
                        <div className="doc-upload-action-hub">
                          <button type="button" className="doc-row-purge" onClick={() => removeDocType(docType)}><FiX /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <div className="footer-right">
              {formStep > 1 && <button type="button" className="btn-secondary" onClick={handlePrevStep}>Previous</button>}
              {formStep < 4 && <button type="button" className="btn-primary" onClick={handleNextStep}>Next Step</button>}
              {formStep === 4 && <button type="submit" className="btn-primary btn-success">Apply Track Updates</button>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;  
