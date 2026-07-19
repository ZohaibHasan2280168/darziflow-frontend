import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from '../../../components/ui/AlertProvider';
import api from "../../../services/reqInterceptor";
import BackButton from "../../../components/ui/BackButton";
import './Users.css';

// Icons
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

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

export default function Users() {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  
  // Theme change detect karne ke liye
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const dynamicColor = isDark ? '#ffffff' : '#0f172a';

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  
  // Custom Filter Dropdown State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [tempSelectedRoles, setTempSelectedRoles] = useState([]);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const roleColors = {
    MODERATOR: { bg: "rgba(59, 130, 246, 0.12)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.25)" },
    ADMIN: { bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80", border: "rgba(34, 197, 94, 0.25)" },
    DEPARTMENT_HEAD: { bg: "rgba(168, 85, 247, 0.12)", text: "#d8b4fe", border: "rgba(168, 85, 247, 0.25)" },
    QC_MEMBER: { bg: "rgba(234, 179, 8, 0.12)", text: "#facc15", border: "rgba(234, 179, 8, 0.25)" },
    CLIENT: { bg: "rgba(239, 68, 68, 0.12)", text: "#fca5a5", border: "rgba(239, 68, 68, 0.25)" },
  };

  const filterableRoles = ["ADMIN", "MODERATOR", "DEPARTMENT_HEAD", "QC_MEMBER", "CLIENT"];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRoles]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    // Apply multiple role filter
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(user => selectedRoles.includes(user.role));
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

  const handleDropdownOpen = () => {
    setTempSelectedRoles(selectedRoles);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleRoleSelection = (role) => {
    if (tempSelectedRoles.includes(role)) {
      setTempSelectedRoles(tempSelectedRoles.filter(r => r !== role));
    } else {
      setTempSelectedRoles([...tempSelectedRoles, role]);
    }
  };

  const applyRoleFilter = () => {
    setSelectedRoles(tempSelectedRoles);
    setIsFilterOpen(false);
  };

  return (
    <div className="users-container">
      <div className="users-content">
        {/* Header */}
        <header className="users-header">
          <div className="header-left">
            <BackButton />
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
              <span className="stat-number" style={{ color: dynamicColor, fontWeight: '800' }}>
                {users.length}
              </span>
            </div>
          </div>

          {Object.entries(roleStats).map(([role, count]) => (
            <div className="stat-card" key={role}>
              <div className="stat-icon" style={{ backgroundColor: roleColors[role]?.bg }}>
                <span style={{ color: roleColors[role]?.text }}>{count}</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">{role.replace('_', ' ')}</span>
                <span className="stat-number" style={{ color: dynamicColor, fontWeight: '800' }}>
                  {count}
                </span>
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
          
          {/* Custom Dropdown UI */}
          <div className="filter-group">
            <div className="custom-dropdown-container" ref={dropdownRef}>
              <button className="dropdown-trigger" onClick={handleDropdownOpen}>
                <span>Role {selectedRoles.length > 0 && `(${selectedRoles.length})`}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '8px' }}>
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </button>

              {isFilterOpen && (
                <div className="dropdown-popover">
                  
                  <div className="dropdown-options">
                    {filterableRoles
                      .filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()))
                      .map(role => (
                        <label key={role} className="dropdown-option">
                          <input
                            type="checkbox"
                            checked={tempSelectedRoles.includes(role)}
                            onChange={() => toggleRoleSelection(role)}
                          />
                          <span className="checkbox-custom"></span>
                          <span className="option-text">{role.replace('_', ' ')}</span>
                        </label>
                      ))}
                    {filterableRoles.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())).length === 0 && (
                      <div className="dropdown-no-results">No roles found</div>
                    )}
                  </div>
                  <div className="dropdown-footer">
                    <button className="apply-btn" onClick={applyRoleFilter}>
                      Apply
                    </button>
                  </div>
                </div>
              )}
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

              {/* Pagination */}
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
      
      <style>{`
        .theme-aware-text {
          color: var(--text-primary);
          transition: color 0.3s ease;
        }
        :root.light .theme-aware-text { color: #0f172a !important; }
        :root.dark .theme-aware-text { color: #ffffff !important; }
      `}</style>
    </div>
  );
}
