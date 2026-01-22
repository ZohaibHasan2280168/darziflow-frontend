"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/reqInterceptor";
import Navbar from "../../components/layout/Navbar";
import RolePieChart from "../../components/charts/RolePieChart";
import { useAuth } from "../../components/context/AuthContext";
import DashboardLoader from "../../components/ui/Loader";
import MustChangePasswordModal from "../../components/modals/MustChangePasswordModal";

export default function Dashboard() {
  const { user, mustChangePassword } = useAuth();
  const navigate = useNavigate();

  // Initial states for all charts
  const initialUserStats = [
    { name: "Admin", value: 0, backendKey: "ADMIN", color: "rgb(0, 136, 254)" },
    { name: "Client", value: 0, backendKey: "CLIENT", color: "rgb(0, 196, 159)" },
    { name: "QC Member", value: 0, backendKey: "QC_MEMBER", color: "rgb(255, 187, 40)" },
    { name: "Department Head", value: 0, backendKey: "DEPT_HEAD", color: "rgb(168, 85, 247)" },
  ];

  const initialOrderStats = [
    { name: "Draft", value: 0, color: "rgb(148, 163, 184)" },
    { name: "Docs Pending", value: 0, color: "rgb(245, 158, 11)" },
    { name: "Ready to Start", value: 0, color: "rgb(16, 185, 129)" },
    { name: "In Progress", value: 0, color: "rgb(59, 130, 246)" },
    { name: "Completed", value: 0, color: "rgb(139, 92, 246)" },
  ];

  const [userStats, setUserStats] = useState(initialUserStats);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [orderStats, setOrderStats] = useState(initialOrderStats);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch users data
        const usersRes = await api.get("/users");
        const { stats: userData } = usersRes.data;

        const newUserStats = initialUserStats.map(stat => ({
          ...stat,
          value: userData?.roles?.[stat.backendKey] || 0,
        }));
        setUserStats(newUserStats);

        // Fetch departments data
        const deptRes = await api.get("/departments");
        const departments = deptRes.data || [];
        
        // Calculate department stats by role
        const deptRoleCounts = departments.reduce((acc, dept) => {
          if (dept.head) {
            if (Array.isArray(dept.head)) {
              dept.head.forEach(head => {
                acc.DEPT_HEAD = (acc.DEPT_HEAD || 0) + 1;
              });
            } else {
              acc.DEPT_HEAD = (acc.DEPT_HEAD || 0) + 1;
            }
          }
          return acc;
        }, {});

        const deptStats = [
          { name: "Active Departments", value: departments.length, color: "rgb(59, 130, 246)" },
          { name: "With Department Head", value: deptRoleCounts.DEPT_HEAD || 0, color: "rgb(16, 185, 129)" },
        ];
        setDepartmentStats(deptStats);
        setDepartmentCount(departments.length);

        // Fetch orders data
        const ordersRes = await api.get("/orders");
        const orders = ordersRes.data?.orders || [];

        // Calculate order status counts
        const orderCounts = orders.reduce((acc, order) => {
          const status = order.overallStatus || 'DRAFT';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        const newOrderStats = initialOrderStats.map(stat => ({
          ...stat,
          value: orderCounts[stat.name.toUpperCase().replace(/\s+/g, '_')] || 0,
        }));
        setOrderStats(newOrderStats);
        setTotalOrders(orders.length);

      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch dashboard data");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Navigation handlers
  const handleUserRoleClick = (roleDisplayName) => {
    const urlRoleSlug = roleDisplayName.toLowerCase().replace(/\s+/g, '_');
    navigate(`/users/role/${urlRoleSlug}`);
  };

  const totalUsers = userStats.reduce((sum, s) => sum + s.value, 0);

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-content">
          <DashboardLoader label="Loading dashboard data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {mustChangePassword && (
        <MustChangePasswordModal onContinue={() => navigate("/profile")} />
      )}

      <Navbar />

      <div className="dashboard-content">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {user.name || user.email}!</h1>
          <p className="dashboard-subtitle">Here's what's happening with your production today</p>
        </div>

        {/* Stats Summary Cards */}
        <div className="stats-summary">
          <div className="summary-card">
            <div className="summary-icon users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="summary-content">
              <h3>Total Users</h3>
              <p className="summary-number">{totalUsers}</p>
              <p className="summary-label">Across all roles</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon departments">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div className="summary-content">
              <h3>Active Departments</h3>
              <p className="summary-number">{departmentCount}</p>
              <p className="summary-label">Production workflow</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon orders">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div className="summary-content">
              <h3>Active Orders</h3>
              <p className="summary-number">{totalOrders}</p>
              <p className="summary-label">In production</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Users Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>User Roles Distribution</h2>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="chart-container">
              <RolePieChart data={userStats} />
            </div>
            
            <div className="legend-container">
              {userStats.map((stat, idx) => (
                <div
                  key={stat.name}
                  className="legend-item clickable"
                 >
                  <div className="legend-color" style={{ backgroundColor: stat.color || "#888" }}></div>
                  <div className="legend-text">
                    <span className="legend-name">{stat.name}</span>
                    <span className="legend-value">
                      </span>
                  </div>
                </div>
              ))}
            </div>

            {user.role === "ADMIN" && (
              <div className="chart-actions">
                <button className="action-btn primary" onClick={() => navigate("/users")}>
                  View All Users
                </button>
              </div>
            )}
          </div>

          {/* Orders Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Orders Status</h2>
              </div>
            
            <div className="chart-container">
              <RolePieChart data={orderStats} />
            </div>
            
            <div className="legend-container">
              {orderStats.map((stat, idx) => (
                <div
                  key={stat.name}
                  className="legend-item clickable"
                  >
                  <div className="legend-color" style={{ backgroundColor: stat.color || "#888" }}></div>
                  <div className="legend-text">
                    <span className="legend-name">{stat.name}</span>
                    <span className="legend-value">
                      {stat.value} ({totalOrders > 0 ? Math.round((stat.value / totalOrders) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-actions">
              <button className="action-btn primary" onClick={() => navigate("/orderlist")}>
                View All Orders
              </button>
            </div>
          </div>

          {/* Departments Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Departments Overview</h2>
               </div>
            
            <div className="chart-container">
              <RolePieChart data={departmentStats} />
            </div>
            
            <div className="legend-container">
              {departmentStats.map((stat, idx) => (
                <div
                  key={stat.name}
                  className="legend-item clickable"
                >
                  <div className="legend-color" style={{ backgroundColor: stat.color || "#888" }}></div>
                  <div className="legend-text">
                    <span className="legend-name">{stat.name}</span>
                    <span className="legend-value">
                      {stat.value} ({departmentCount > 0 ? Math.round((stat.value / departmentCount) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {user.role === "ADMIN" && (
              <div className="chart-actions">
                <button className="action-btn primary" onClick={() => navigate("/departments")}>
                  View All Departments
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
        }

        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          margin-bottom: 2.5rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-subtitle {
          font-size: 1.1rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .summary-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .summary-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .summary-icon.users {
          background: linear-gradient(135deg, rgba(0, 136, 254, 0.2), rgba(0, 136, 254, 0.1));
          color: #0088FE;
        }

        .summary-icon.departments {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
          color: #3b82f6;
        }

        .summary-icon.orders {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
          color: #10b981;
        }

        .summary-content {
          flex: 1;
        }

        .summary-content h3 {
          font-size: 1rem;
          font-weight: 500;
          color: #94a3b8;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .summary-label {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0.25rem 0 0 0;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .chart-card:hover {
          border-color: rgba(59, 130, 246, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .total-count {
          font-size: 0.875rem;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart-container {
          height: 220px;
          margin-bottom: 1.5rem;
        }

        .legend-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .legend-item.clickable {
          cursor: pointer;
        }

        .legend-item.clickable:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .legend-text {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex: 1;
        }

        .legend-name {
          font-size: 0.875rem;
          color: #e2e8f0;
        }

        .legend-value {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .chart-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          border: none;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .action-btn.secondary {
          background: transparent;
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .quick-actions {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .quick-actions h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #e2e8f0;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }

        .quick-action-btn {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          text-align: center;
        }

        .quick-action-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .quick-action-btn svg {
          color: #94a3b8;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1rem;
          }

          .dashboard-header h1 {
            font-size: 2rem;
          }

          .stats-summary,
          .charts-grid {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            gap: 1rem;
          }

          .chart-card {
            padding: 1.25rem;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .summary-card {
            flex-direction: column;
            text-align: center;
          }

          .summary-icon {
            width: 48px;
            height: 48px;
          }

          .chart-actions {
            flex-direction: column;
          }

          .legend-text {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}