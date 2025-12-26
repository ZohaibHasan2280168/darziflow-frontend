import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiLayers, FiInfo, FiUser, FiArrowLeft
} from "react-icons/fi";

import EditOrderModal from "../../components/modals/EditOrderModal"; 

const API_URL = "https://darziflow-backend.onrender.com/api/orders";

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  return parsedData?.accessToken;
};

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Create ke liye alag state
  const [newOrder, setNewOrder] = useState({
    name: "",
    type: "PANT", 
    description: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    currency: "Rs.",
    requiredDocTypes: ["ID_CARD"],
    departmentSequenceIds: ["65f1a2b3c4d5e6f7a8b9c0d1"]
  });

  // Edit ke liye target order state
  const [orderToEdit, setOrderToEdit] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = getToken();
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(API_URL, newOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddModal(false);
      fetchOrders();
      alert("✅ Order Created Successfully!");
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || "Failed to create order"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      try {
        const token = getToken();
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchOrders();
        alert("🗑️ Order Deleted Successfully");
      } catch (err) {
        alert("❌ Error: " + (err.response?.data?.message || "Failed to delete"));
      }
    }
  };

  const handleEditClick = (order) => {
    setOrderToEdit(order);
    setShowEditModal(true);
  };

  // --- FILTER LOGIC ---
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.uniqueId?.includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || o.overallStatus === statusFilter;
    const matchesType = typeFilter === "ALL" || (o.type && o.type.toUpperCase() === typeFilter.toUpperCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="orders-wrapper">
      <div className="orders-header">
        <div className="header-left">
          <div className="title-with-back">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FiArrowLeft />
            </button>
            <div>
              <h1>Workflow Management</h1>
              <p>Create, manage and track your tailoring orders efficiently.</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={() => { 
            setNewOrder({name: "", type: "PANT", description: "", clientName: "", clientEmail: "", amount: "", currency: "Rs.", requiredDocTypes: ["ID_CARD"], departmentSequenceIds: ["65f1a2b3c4d5e6f7a8b9c0d1"]}); 
            setShowAddModal(true); 
          }}>
            <FiPlus /> New Order
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Orders" value={orders.length} color="blue" />
        <StatCard title="Ready to Start" value={orders.filter(o=>o.overallStatus === 'READY_TO_START').length} color="green" />
        <StatCard title="Docs Pending" value={orders.filter(o=>o.overallStatus === 'DOCS_PENDING').length} color="orange" />
        <StatCard title="Drafts" value={orders.filter(o=>o.overallStatus === 'DRAFT').length} color="red" />
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <div className="filter-item">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="DOCS_PENDING">Docs Pending</option>
              <option value="READY_TO_START">Ready to Start</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="PANT">Pant</option>
              <option value="SHORTS">Shorts</option>
              <option value="JACKET">Jacket</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Details</th>
              <th>Order Type</th>
              <th>ID Number</th>
              <th>Created On</th>
              <th>Current Status</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="loading-state">Loading order data...</td></tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id} className="order-row">
                  <td onClick={() => navigate(`/orders/${order._id}`)} className="clickable">
                    <div className="order-primary-info">
                      <span className="order-name">{order.name}</span>
                    </div>
                  </td>
                  <td><span className="order-type-label">{order.type || "N/A"}</span></td>
                  <td><span className="unique-id">#{order.uniqueId?.slice(-8).toUpperCase()}</span></td>
                  <td><span className="date-cell">{new Date(order.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <span className={`status-badge ${order.overallStatus?.toLowerCase()}`}>
                      {order.overallStatus}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="icon-btn edit" title="Edit" onClick={() => handleEditClick(order)}>
                        <FiEdit2 />
                      </button>
                      <button className="icon-btn delete" title="Delete" onClick={() => handleDelete(order._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="empty-state">No orders found matching your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 1. ADD ORDER MODAL (Abhi bhi inline hai, as per current logic) */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">
                <div className="icon-circle"><FiLayers /></div>
                <div>
                  <h3>Create New Order</h3>
                  <p>Fill in the details below to start a new workflow.</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><FiX /></button>
            </div>

            <form onSubmit={handleCreateOrder} className="modal-form-element">
              <div className="form-body">
                <section className="form-section">
                  <h4 className="section-label"><FiInfo /> Order Essentials</h4>
                  <div className="form-grid">
                    <div className="form-field full">
                      <label>Order Reference Name</label>
                      <input type="text" placeholder="e.g., Wedding Suit - John" value={newOrder.name} onChange={(e) => setNewOrder({...newOrder, name: e.target.value})} required />
                    </div>
                    <div className="form-field">
                      <label>Apparel Type</label>
                      <select value={newOrder.type} onChange={(e) => setNewOrder({...newOrder, type: e.target.value})}>
                        <option value="PANT">PANT</option>
                        <option value="SHORTS">SHORTS</option>
                        <option value="JACKET">JACKET</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Financial Quote</label>
                      <div className="input-group">
                        <select className="prefix" value={newOrder.currency} onChange={(e)=>setNewOrder({...newOrder, currency: e.target.value})}>
                          <option value="Rs.">Rs.</option>
                          <option value="$">$</option>
                        </select>
                        <input type="number" placeholder="0.00" value={newOrder.amount} onChange={(e)=>setNewOrder({...newOrder, amount: e.target.value})} required />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <h4 className="section-label"><FiUser /> Client Information</h4>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Customer Full Name</label>
                      <input type="text" placeholder="Full Name" value={newOrder.clientName} onChange={(e) => setNewOrder({...newOrder, clientName: e.target.value})} required />
                    </div>
                    <div className="form-field">
                      <label>Email Address</label>
                      <input type="email" placeholder="email@example.com" value={newOrder.clientEmail} onChange={(e) => setNewOrder({...newOrder, clientEmail: e.target.value})} required />
                    </div>
                    <div className="form-field full">
                      <label>Internal Notes / Description</label>
                      <textarea rows="2" placeholder="Specific measurements or design requests..." value={newOrder.description} onChange={(e) => setNewOrder({...newOrder, description: e.target.value})} />
                    </div>
                  </div>
                </section>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Initialize Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT ORDER MODAL (Ab external component se call ho raha hai) */}
      <EditOrderModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        orderData={orderToEdit} 
        onUpdateSuccess={fetchOrders} 
      />

      <style>{orderStyles}</style>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-info">
      <span className="stat-title">{title}</span>
      <h2 className="stat-value">{value}</h2>
      <span className="stat-subtext">Real-time tracking</span>
    </div>
  </div>
);

const orderStyles = `
  /* ... (Puri styling waisi hi hai jo pehle thi) ... */
  .orders-wrapper { padding: 40px; background: #080a12; min-height: 100vh; font-family: 'Inter', sans-serif; color: #fff; }
  .orders-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
  .title-with-back { display: flex; align-items: flex-start; gap: 15px; }
  .back-btn { background: #1f2937; color: #94a3b8; border: 1px solid #374151; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; font-size: 18px; margin-top: 5px; }
  .back-btn:hover { background: #374151; color: #fff; }
  .header-left h1 { font-size: 28px; font-weight: 800; margin: 0; color: #f8fafc; letter-spacing: -0.5px; }
  .header-left p { color: #64748b; margin-top: 5px; font-size: 15px; }
  .btn-add { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
  .btn-add:hover { background: #2563eb; transform: translateY(-2px); }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
  .stat-card { background: #111827; border: 1px solid #1f2937; padding: 20px; border-radius: 12px; }
  .stat-card.blue { border-top: 4px solid #3b82f6; }
  .stat-card.orange { border-top: 4px solid #f59e0b; }
  .stat-card.green { border-top: 4px solid #10b981; }
  .stat-card.red { border-top: 4px solid #ef4444; }
  .stat-title { color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; }
  .stat-value { font-size: 24px; margin: 5px 0; font-weight: 700; }
  .stat-subtext { font-size: 11px; color: #475569; }
  .filter-bar { background: #111827; border: 1px solid #1f2937; padding: 15px 25px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 20px; }
  .search-box { position: relative; flex: 1; max-width: 450px; background: #fff; border-radius: 10px; display: flex; align-items: center; padding: 0 15px; }
  .search-icon { color: #94a3b8; font-size: 18px; }
  .search-box input { border: none; padding: 12px 10px; width: 100%; outline: none; color: #1e293b; font-weight: 500; background: transparent; }
  .filter-controls { display: flex; gap: 20px; }
  .filter-item { display: flex; flex-direction: column; gap: 4px; }
  .filter-item label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
  .filter-item select { background: #1f2937; border: 1px solid #374151; color: #fff; padding: 8px 12px; border-radius: 8px; outline: none; cursor: pointer; min-width: 140px; }
  .table-container { background: #111827; border-radius: 16px; border: 1px solid #1f2937; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  .orders-table { width: 100%; border-collapse: collapse; text-align: left; }
  .orders-table th { padding: 18px 25px; background: #1e293b; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
  .orders-table td { padding: 18px 25px; border-bottom: 1px solid #1f2937; vertical-align: middle; }
  .order-name { display: block; font-weight: 600; color: #f8fafc; font-size: 15px; }
  .order-type-label { font-weight: 500; color: #3b82f6; background: #3b82f615; padding: 4px 10px; border-radius: 6px; font-size: 13px; }
  .status-badge { padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-flex; }
  .status-badge.draft { background: #47556920; color: #94a3b8; }
  .status-badge.docs_pending { background: #f59e0b20; color: #f59e0b; }
  .status-badge.ready_to_start { background: #10b98120; color: #10b981; }
  .action-cell { display: flex; gap: 10px; justify-content: flex-end; }
  .icon-btn { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; border: 1px solid #374151; background: transparent; color: #94a3b8; }
  .icon-btn.edit:hover { background: #3b82f620; color: #3b82f6; border-color: #3b82f6; }
  .icon-btn.delete:hover { background: #ef444420; color: #ef4444; border-color: #ef4444; }
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 17, 0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
  .modal-card { background: #111827; border-radius: 20px; width: 100%; max-width: 680px; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
  .modal-header { padding: 25px 30px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: center; align-items: center; position: relative; flex-shrink: 0; }
  .modal-form-element { display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; }
  .form-body { padding: 30px; overflow-y: auto; flex-grow: 1; }
  .modal-actions { padding: 20px 30px; background: #0f172a; display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid #334155; flex-shrink: 0; }
  .modal-title { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
  .icon-circle { width: 45px; height: 45px; background: #3b82f620; color: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .modal-title h3 { margin: 0; font-size: 18px; color: #f8fafc; }
  .modal-title p { margin: 2px 0 0; font-size: 13px; color: #94a3b8; }
  .close-btn { position: absolute; right: 20px; top: 20px; background: transparent; border: none; color: #64748b; font-size: 22px; cursor: pointer; }
  .form-section { margin-bottom: 30px; }
  .section-label { display: flex; align-items: center; gap: 8px; font-size: 12px; text-transform: uppercase; color: #3b82f6; font-weight: 700; margin-bottom: 15px; border-bottom: 1px solid #1f2937; padding-bottom: 8px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .form-field.full { grid-column: span 2; }
  .form-field label { display: block; margin-bottom: 8px; font-size: 13px; color: #94a3b8; font-weight: 500; }
  .form-field input, .form-field select, .form-field textarea { width: 100%; padding: 12px 15px; background: #fff; border: 1px solid #334155; border-radius: 10px; color: #000; font-size: 14px; outline: none; transition: 0.2s; }
  .form-field input:focus, .form-field select:focus, .form-field textarea:focus { background: #0f172a; color: #fff !important; border-color: #3b82f6; }
  .input-group { display: flex; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #334155; transition: 0.2s; }
  .input-group .prefix { width: 80px; background: #f1f5f9; border: none; border-right: 1px solid #cbd5e1; color: #475569; border-radius: 0; }
  .input-group input { border: none; border-radius: 0; flex: 1; }
  .input-group:focus-within { background: #0f172a; border-color: #3b82f6; }
  .input-group:focus-within .prefix { background: #1e293b; color: #fff; border-right: 1px solid #334155; }
  .input-group:focus-within input { color: #fff !important; }
  .secondary-btn { background: transparent; color: #94a3b8; border: none; font-weight: 600; cursor: pointer; padding: 10px 20px; }
  .primary-btn { background: #3b82f6; color: white; border: none; padding: 12px 30px; border-radius: 10px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
  .loading-state, .empty-state { text-align: center; padding: 60px !important; color: #64748b; font-style: italic; }
`;

export default OrdersList;