"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from '../../../components/ui/AlertProvider';
import api from "../../../services/reqInterceptor";
import './Users.css';

// Icons (you can use react-icons or inline SVGs)
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const AddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14"></path>
    <path d="M5 12h14"></path>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const roleColors = {
    MODERATOR: { bg: "rgba(59, 130, 246, 0.12)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.25)" },
    ADMIN: { bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80", border: "rgba(34, 197, 94, 0.25)" },
    DEPARTMENT_HEAD: { bg: "rgba(168, 85, 247, 0.12)", text: "#d8b4fe", border: "rgba(168, 85, 247, 0.25)" },
    QC_MEMBER: { bg: "rgba(234, 179, 8, 0.12)", text: "#facc15", border: "rgba(234, 179, 8, 0.25)" },
    CLIENT: { bg: "rgba(239, 68, 68, 0.12)", text: "#fca5a5", border: "rgba(239, 68, 68, 0.25)" },
  };

  const roles = ["ALL", "ADMIN", "MODERATOR", "DEPARTMENT_HEAD", "QC_MEMBER", "CLIENT"];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to fetch users";
      setError(message);
      showAlert({ title: 'Error', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      showAlert({ 
        title: 'Success', 
        message: 'User deleted successfully', 
        type: 'success' 
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      showAlert({ 
        title: 'Error', 
        message: err.response?.data?.message || "Failed to delete user", 
        type: 'error' 
      });
    }
  };

  const getRoleStats = () => {
    const stats = {};
    users.forEach(user => {
      stats[user.role] = (stats[user.role] || 0) + 1;
    });
    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <div className="users-container">
      <Navbar />
      
      <div className="users-content">
        {/* Header */}
        <header className="users-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              Back
            </button>
            <div className="header-text">
              <h1 className="page-title">User Management</h1>
              <p className="page-subtitle">Manage your team members and their roles</p>
            </div>
          </div>
          <Link to="/add-user" className="add-user-btn">
            Add User
          </Link>
        </header>

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon total-users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Users</span>
              <span className="stat-number">{users.length}</span>
            </div>
          </div>

          {Object.entries(roleStats).map(([role, count]) => (
            <div className="stat-card" key={role}>
              <div className="stat-icon" style={{ backgroundColor: roleColors[role]?.bg }}>
                <span style={{ color: roleColors[role]?.text }}>{count}</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">{role.replace('_', ' ')}</span>
                <span className="stat-number">{count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <SearchIcon />
            <input
              type="text"
              className="search-input"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <div className="filter-select-wrapper">
              <FilterIcon />
              <select
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === "ALL" ? "All Roles" : role.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="main-card">
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchUsers}>
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="table-header">
                <div className="table-title">
                  <h3>All Users ({filteredUsers.length})</h3>
                  <span className="table-subtitle">Showing {filteredUsers.length} of {users.length} users</span>
                </div>
                <div className="table-actions">
                  <button className="export-btn" onClick={() => {/* Export functionality */}}>
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th className="user-info-col">User Information</th>
                      <th className="role-col">Role</th>
                      <th className="status-col">Status</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr key={user._id || index} className="user-row">
                          <td className="user-info-cell">
                            <div className="user-avatar">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="user-details">
                              <span className="user-name">{user.name || 'No Name'}</span>
                              <span className="user-email">{user.email}</span>
                              {user.department && (
                                <span className="user-department">
                                  {user.department.name || user.department}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="role-cell">
                            <span
                              className="role-badge"
                              style={{
                                backgroundColor: roleColors[user.role]?.bg,
                                color: roleColors[user.role]?.text,
                                borderColor: roleColors[user.role]?.border,
                              }}
                            >
                              {user.role?.replace('_', ' ') || 'N/A'}
                            </span>
                          </td>
                          <td className="status-cell">
                            <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                              {user.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <div className="actions-group">
                              <button
                                className="action-btn edit-btn"
                                onClick={() => navigate(`/update-user/${user._id}`)}
                                title="Edit User"
                              >
                                <EditIcon />
                                <span>Edit</span>
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDelete(user._id)}
                                title="Delete User"
                              >
                                <DeleteIcon />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="empty-row">
                        <td colSpan="4">
                          <div className="empty-state">
                            <div className="empty-icon">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="18" y1="8" x2="23" y2="13"></line>
                                <line x1="23" y1="8" x2="18" y2="13"></line>
                              </svg>
                            </div>
                            <h4>No users found</h4>
                            <p>Try adjusting your search or filter to find what you're looking for.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination (Optional) */}
              {filteredUsers.length > 10 && (
                <div className="pagination">
                  <button className="pagination-btn prev" disabled>
                    Previous
                  </button>
                  <span className="page-info">Page 1 of 1</span>
                  <button className="pagination-btn next">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}