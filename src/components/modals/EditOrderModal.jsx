import { useState, useEffect } from "react";
import api from "../../services/reqInterceptor";
import { FiX, FiLayers, FiInfo, FiUser, FiFileText, FiGitCommit } from "react-icons/fi";

const EditOrderModal = ({ isOpen, onClose, orderData, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "PANT",
    description: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    currency: "Rs.",
    requiredDocTypes: "", // Handled as comma-separated string for UI
    departmentSequenceIds: "", // Handled as comma-separated string for UI
  });

  useEffect(() => {
    if (orderData) {
      setFormData({
        name: orderData.name || "",
        type: orderData.type || "PANT",
        description: orderData.description || "",
        clientName: orderData.clientName || "",
        clientEmail: orderData.clientEmail || "",
        amount: orderData.amount || "",
        currency: orderData.currency || "Rs.",
        // Map arrays back to comma-separated strings for the input fields
        requiredDocTypes: orderData.requiredDocuments?.map(d => d.docType).join(", ") || "",
        departmentSequenceIds: orderData.departmentSequence?.join(", ") || "",
      });
    }
  }, [orderData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Process strings back into arrays for the Joi-validated backend
      const payload = {
        name: formData.name,
        type: formData.type,
        amount: Number(formData.amount),
        currency: formData.currency,
        description: formData.description,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientId: orderData.clientId?._id || orderData.clientId || null,
        requiredDocTypes: formData.requiredDocTypes
          ? formData.requiredDocTypes.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
          : [],
        departmentSequenceIds: formData.departmentSequenceIds
          ? formData.departmentSequenceIds.split(",").map(s => s.trim()).filter(Boolean)
          : [],
      };

      // Note: Using orderData.uniqueId to match your controller's req.params.id
      await api.put(`/orders/${orderData.uniqueId}`, payload);

      alert("Order Updated Successfully!");
      onUpdateSuccess();
      onClose();
    } catch (err) {
      alert("Error updating order: " + (err.response?.data?.message || "Failed"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <div className="icon-circle"><FiLayers /></div>
            <div>
              <h3>Update Order Information</h3>
              <p>Modify the details of order: <strong>{orderData?.uniqueId}</strong></p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-element">
          <div className="form-body">
            {/* Section 1: Essentials */}
            <section className="form-section">
              <h4 className="section-label"><FiInfo /> Order Essentials</h4>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Order Reference Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-field">
                  <label>Apparel Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="PANT">PANT</option>
                    <option value="SHORTS">SHORTS</option>
                    <option value="JACKET">JACKET</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Financial Quote</label>
                  <div className="input-group">
                    <select className="prefix" value={formData.currency} onChange={(e)=>setFormData({...formData, currency: e.target.value})}>
                      <option value="Rs.">Rs.</option>
                      <option value="$">$</option>
                    </select>
                    <input type="number" value={formData.amount} onChange={(e)=>setFormData({...formData, amount: e.target.value})} required />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Requirements & Workflow */}
            <section className="form-section">
              <h4 className="section-label"><FiGitCommit /> Requirements & Logic</h4>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Required Documents (Comma separated: ID, NIC, PH_ORDER)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NIC, PERMIT, INVOICE"
                    value={formData.requiredDocTypes} 
                    onChange={(e) => setFormData({...formData, requiredDocTypes: e.target.value})} 
                  />
                </div>
                <div className="form-field full">
                  <label>Department Sequence IDs (Comma separated Mongo IDs)</label>
                  <textarea 
                    rows="2"
                    placeholder="65ab...1, 65ab...2"
                    value={formData.departmentSequenceIds} 
                    onChange={(e) => setFormData({...formData, departmentSequenceIds: e.target.value})} 
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Client Info */}
            <section className="form-section">
              <h4 className="section-label"><FiUser /> Client Information</h4>
              <div className="form-grid">
                <div className="form-field">
                  <label>Customer Full Name</label>
                  <input type="text" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} required />
                </div>
                <div className="form-field">
                  <label>Email Address</label>
                  <input type="email" value={formData.clientEmail} onChange={(e) => setFormData({...formData, clientEmail: e.target.value})} required />
                </div>
                <div className="form-field full">
                  <label>Internal Notes</label>
                  <textarea rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
            </section>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Save Changes</button>
          </div>
        </form>
      </div>
      <style>{modalStyles}</style>
    </div>
  );
};

const modalStyles = `
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 17, 0.9); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(8px); }
  .modal-card { background: #111827; border-radius: 20px; width: 100%; max-width: 600px; border: 1px solid #334155; color: white; overflow: hidden; }
  .modal-header { padding: 20px 25px; background: #1e293b; display: flex; justify-content: space-between; align-items: center; }
  .modal-title { display: flex; gap: 15px; align-items: center; }
  .icon-circle { background: #3b82f620; color: #3b82f6; padding: 10px; border-radius: 10px; }
  .modal-title h3 { margin: 0; font-size: 18px; }
  .modal-title p { margin: 0; font-size: 12px; color: #94a3b8; }
  .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 20px; }
  .form-body { padding: 25px; max-height: 70vh; overflow-y: auto; }
  .section-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #3b82f6; margin-bottom: 15px; text-transform: uppercase; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .full { grid-column: span 2; }
  .form-field label { display: block; font-size: 11px; color: #64748b; margin-bottom: 5px; }
  .form-field input, .form-field select, .form-field textarea { width: 100%; background: #0f172a; border: 1px solid #334155; padding: 10px; border-radius: 8px; color: white; outline: none; }
  .input-group { display: flex; }
  .prefix { width: 70px !important; border-radius: 8px 0 0 8px !important; border-right: none !important; }
  .input-group input { border-radius: 0 8px 8px 0 !important; }
  .modal-actions { padding: 15px 25px; background: #0f172a; display: flex; justify-content: flex-end; gap: 12px; }
  .primary-btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
  .secondary-btn { background: transparent; color: #94a3b8; border: none; cursor: pointer; }
`;

export default EditOrderModal;  