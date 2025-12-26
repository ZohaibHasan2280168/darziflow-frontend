import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiArrowLeft, FiUser, FiDollarSign, FiClock, 
  FiTag, FiMail, FiFileText, FiCalendar, FiBox
} from "react-icons/fi";

const Order = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const storedData = localStorage.getItem("useraccesstoken");
        const token = storedData ? JSON.parse(storedData)?.accessToken : null;

        const res = await axios.get(`https://darziflow-backend.onrender.com/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data.order || res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) return (
    <div className="order-loading">
      <div className="spinner"></div>
      <p>Loading workflow details...</p>
    </div>
  );

  if (!order) return (
    <div className="order-error">
      <h2>Order not found</h2>
      <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
    </div>
  );

  return (
    <div className="order-detail-wrapper">
      {/* HEADER SECTION */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn-circle">
          <FiArrowLeft />
        </button>
        <div className="header-main-info">
          <div className="id-badge">#{order.uniqueId?.slice(-8).toUpperCase() || order._id.slice(-8).toUpperCase()}</div>
          <h1>{order.name}</h1>
          <p className="subtitle">Detailed workflow management and apparel specifications</p>
        </div>
      </div>

      <div className="detail-container">
        {/* TOP STATS CARDS - Perfectly Aligned */}
        <div className="stats-grid-wrapper">
          <div className="stat-card-pro">
            <div className="icon-wrapper blue"><FiTag /></div>
            <div className="content-wrapper">
              <span className="label">Apparel Type</span>
              <span className="value">{order.type}</span>
            </div>
          </div>

          <div className="stat-card-pro">
            <div className="icon-wrapper green"><FiDollarSign /></div>
            <div className="content-wrapper">
              <span className="label">Financial Quote</span>
              <span className="value">{order.currency} {order.amount}</span>
            </div>
          </div>

          <div className="stat-card-pro">
            <div className="icon-wrapper orange"><FiClock /></div>
            <div className="content-wrapper">
              <span className="label">Order Status</span>
              <span className={`status-pill ${order.overallStatus?.toLowerCase()}`}>
                {order.overallStatus?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="stat-card-pro">
            <div className="icon-wrapper purple"><FiCalendar /></div>
            <div className="content-wrapper">
              <span className="label">Created Date</span>
              <span className="value">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM CONTENT AREA */}
        <div className="content-split-view">
          {/* CLIENT SECTION */}
          <div className="glass-card">
            <div className="card-header">
              <FiUser className="header-icon" />
              <h3>Client Information</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <div className="info-group">
                  <label>Full Name</label>
                  <p>{order.clientName || "Walk-in Client"}</p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-group">
                  <label>Email Address</label>
                  <p><FiMail className="inline-icon" /> {order.clientEmail || "No email provided"}</p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-group">
                  <label>Associated Client ID</label>
                  <p className="code-font">{order.clientId?._id || "INTERNAL_GENERIC"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* NOTES SECTION */}
          <div className="glass-card">
            <div className="card-header">
              <FiFileText className="header-icon" />
              <h3>Work Order Notes</h3>
            </div>
            <div className="card-body">
              <div className="notes-display">
                <FiBox className="bg-icon" />
                <p>{order.description || "No specific instructions or design notes provided for this garment."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .order-detail-wrapper { 
          padding: 40px; 
          background: radial-gradient(circle at top left, #0f172a, #080a12); 
          min-height: 100vh; 
          color: #f8fafc; 
          font-family: 'Inter', sans-serif;
        }

        /* Header Styling */
        .detail-header { display: flex; align-items: flex-start; gap: 24px; margin-bottom: 48px; }
        .back-btn-circle { 
          width: 50px; height: 50px; border-radius: 14px; 
          background: #1e293b; border: 1px solid #334155; 
          color: #94a3b8; display: flex; align-items: center; 
          justify-content: center; cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 22px; 
        }
        .back-btn-circle:hover { 
          background: #3b82f6; color: white; border-color: #60a5fa;
          transform: translateX(-5px);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }

        .id-badge { 
          background: #3b82f615; color: #3b82f6; 
          padding: 4px 12px; border-radius: 6px; 
          font-size: 11px; font-weight: 800; 
          text-transform: uppercase; border: 1px solid #3b82f630;
          display: inline-block; margin-bottom: 8px;
        }
        .header-main-info h1 { margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -1px; }
        .subtitle { color: #64748b; margin: 4px 0 0; font-size: 15px; }

        /* Stats Grid Fix */
        .stats-grid-wrapper { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          gap: 20px; 
          margin-bottom: 32px; 
        }

        .stat-card-pro { 
          background: rgba(17, 24, 39, 0.7); 
          border: 1px solid #1f2937; 
          padding: 24px; 
          border-radius: 20px; 
          display: flex; 
          align-items: center; 
          gap: 20px;
          transition: 0.3s;
        }
        .stat-card-pro:hover { border-color: #3b82f6; transform: translateY(-2px); background: #111827; }

        .icon-wrapper { 
          width: 54px; height: 54px; border-radius: 14px; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 24px; flex-shrink: 0;
        }
        .icon-wrapper.blue { background: #3b82f615; color: #3b82f6; }
        .icon-wrapper.green { background: #10b98115; color: #10b981; }
        .icon-wrapper.orange { background: #f59e0b15; color: #f59e0b; }
        .icon-wrapper.purple { background: #8b5cf615; color: #8b5cf6; }

        .content-wrapper { display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
        .content-wrapper .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .content-wrapper .value { font-size: 19px; font-weight: 700; color: #f1f5f9; white-space: nowrap; }

        /* Status Pills */
        .status-pill {
          font-size: 12px; font-weight: 800; padding: 4px 10px; 
          border-radius: 8px; text-transform: uppercase; width: fit-content;
        }
        .status-pill.ready_to_start { background: #10b98120; color: #10b981; border: 1px solid #10b98140; }
        .status-pill.docs_pending { background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b40; }
        .status-pill.draft { background: #64748b20; color: #94a3b8; border: 1px solid #64748b40; }

        /* Lower Section */
        .content-split-view { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; }
        .glass-card { 
          background: rgba(17, 24, 39, 0.4); 
          border: 1px solid #1f2937; 
          border-radius: 24px; 
          padding: 30px; 
          backdrop-filter: blur(10px);
        }

        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; border-bottom: 1px solid #1f2937; padding-bottom: 15px; }
        .header-icon { color: #3b82f6; font-size: 20px; }
        .card-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #e2e8f0; }

        .info-row { margin-bottom: 20px; }
        .info-group label { display: block; font-size: 12px; color: #64748b; margin-bottom: 6px; font-weight: 500; }
        .info-group p { font-size: 16px; font-weight: 600; color: #f1f5f9; margin: 0; display: flex; align-items: center; }
        .inline-icon { margin-right: 8px; font-size: 14px; color: #3b82f6; }
        .code-font { font-family: 'JetBrains Mono', monospace; font-size: 13px !important; color: #94a3b8 !important; }

        .notes-display { 
          background: #080a12; border-radius: 16px; padding: 25px; 
          min-height: 180px; position: relative; overflow: hidden;
          border: 1px solid #1f2937;
        }
        .bg-icon { position: absolute; bottom: -10px; right: -10px; font-size: 80px; color: #ffffff03; }
        .notes-display p { position: relative; z-index: 1; color: #94a3b8; line-height: 1.8; margin: 0; font-size: 15px; }

        /* Loader */
        .order-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #080a12; }
        .spinner { width: 50px; height: 50px; border: 4px solid #1e2937; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite; margin-bottom: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1100px) {
          .stats-grid-wrapper { grid-template-columns: repeat(2, 1fr); }
          .content-split-view { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Order;