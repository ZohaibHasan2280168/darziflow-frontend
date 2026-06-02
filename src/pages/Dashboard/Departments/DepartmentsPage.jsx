import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/reqInterceptor";
import BackButton from "../../../components/ui/BackButton";
import './Departments.css';

// Icons
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

// FilterIcon removed — dropdown uses outer container without a separate icon

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const DepartmentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/departments`);
      setDepartments(res.data || []);
      setFilteredDepartments(res.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch departments";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterDepartments();
  }, [departments, searchTerm, statusFilter]);

  // Status dropdown state/ref for custom dropdown
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      try {
        const el = statusRef.current;
        if (!el) return;
        const path = e.composedPath ? e.composedPath() : (e.path || []);
        const clickedInside = path.length ? path.includes(el) : el.contains(e.target);
        if (!clickedInside) setIsStatusOpen(false);
      } catch (err) {
        // fallback to simple contains check
        if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const statusLabel = statusFilter === 'ALL' ? 'All Status' : statusFilter === 'ACTIVE' ? 'Active' : 'Inactive';

  const filterDepartments = () => {
    let filtered = [...departments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(dept =>
        dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.departmentHead?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(dept => 
        (dept.status || "INACTIVE").toUpperCase() === statusFilter
      );
    }

    setFilteredDepartments(filtered);
  };

  const handleDetailView = (deptId) => {
    navigate(`/department-detail/${deptId}`);
  };

  const getStats = () => {
    const active = departments.filter(d => (d.status || "INACTIVE").toUpperCase() === "ACTIVE").length;
    const inactive = departments.filter(d => (d.status || "INACTIVE").toUpperCase() === "INACTIVE").length;
    const withHeads = departments.filter(d => d.departmentHead).length;
    
    return {
      total: departments.length,
      active,
      inactive,
      withHeads
    };
  };

  const stats = getStats();

  return (
    <div className="departments-container">
      <div className="departments-content">
        {/* Header */}
        <header className="departments-header">
          <div className="header-left">
            <BackButton />
            <div className="header-text">
              <h1 className="page-title">Departments</h1>
              <p className="page-subtitle">Manage production departments and their teams</p>
            </div>
          </div>
          <Link to="/add-department" className="add-dept-btn">
            <AddIcon />
            Add Department
          </Link>
        </header>

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon total">
              <DepartmentIcon />
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Departments</span>
              <span className="stat-number">{stats.total}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Active</span>
              <span className="stat-number">{stats.active}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon with-heads">
              <UsersIcon />
            </div>
            <div className="stat-content">
              <span className="stat-label">With Heads</span>
              <span className="stat-number">{stats.withHeads}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon inactive">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Inactive</span>
              <span className="stat-number">{stats.inactive}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <SearchIcon />
            <input
              type="text"
              className="search-input"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <div className="custom-dropdown-container" ref={statusRef}>
              <button
                type="button"
                className="dropdown-trigger"
                onClick={(e) => { e.stopPropagation(); setIsStatusOpen(s => !s); }}
                aria-haspopup="true"
                aria-expanded={isStatusOpen}
              >
                <span>{statusLabel}</span>
                <span className="chev">▾</span>
              </button>

              {isStatusOpen && (
                <div className="dropdown-popover">
                  <div className="dropdown-options">
                    <div className="dropdown-option" onClick={() => { setStatusFilter('ALL'); setIsStatusOpen(false); }}>All Status</div>
                    <div className="dropdown-option" onClick={() => { setStatusFilter('ACTIVE'); setIsStatusOpen(false); }}>Active</div>
                    <div className="dropdown-option" onClick={() => { setStatusFilter('INACTIVE'); setIsStatusOpen(false); }}>Inactive</div>
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
              <p>Loading departments...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchDepartments}>
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="table-header">
                <div className="table-title">
                  <h3>All Departments ({filteredDepartments.length})</h3>
                  <span className="table-subtitle">Showing {filteredDepartments.length} of {departments.length} departments</span>
                </div>
              </div>

              {/* Departments Table */}
              <div className="table-container">
                <table className="departments-table">
                  <thead>
                    <tr>
                      <th className="dept-info-col">Department Information</th>
                      <th className="head-col">Department Head</th>
                      <th className="status-col">Status</th>
                      <th className="members-col">Team Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept, index) => (
                        <tr 
                          key={dept._id || index} 
                          className="dept-row clickable"
                          onClick={() => handleDetailView(dept._id)}
                        >
                          <td className="dept-info-cell">
                            <div className="dept-avatar">
                              {dept.name ? dept.name.charAt(0).toUpperCase() : 'D'}
                            </div>
                            <div className="dept-details">
                              <span className="dept-name">{dept.name}</span>
                              <span className="dept-description">
                                {dept.description || 'No description'}
                              </span>
                            </div>
                          </td>
                          <td className="head-cell">
                            {dept.departmentHead ? (
                              <div className="head-info">
                                <span className="head-name">
                                  {typeof dept.departmentHead === 'object' 
                                    ? dept.departmentHead.name 
                                    : dept.departmentHead}
                                </span>
                                {typeof dept.departmentHead === 'object' && dept.departmentHead.email && (
                                  <span className="head-email">{dept.departmentHead.email}</span>
                                )}
                              </div>
                            ) : (
                              <span className="no-head">Not Assigned</span>
                            )}
                          </td>
                          <td className="status-cell">
                            <span className={`status-badge ${(dept.status || 'INACTIVE').toUpperCase()}`}>
                              {(dept.status || 'INACTIVE').toUpperCase()}
                            </span>
                          </td>
                          <td className="members-cell">
                            <div className="members-count">
                              <UsersIcon />
                              <span>{dept.teamMembers?.length || 0} members</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="empty-row">
                        <td colSpan="4">
                          <div className="empty-state">
                            <div className="empty-icon">
                              <DepartmentIcon />
                            </div>
                            <h4>No departments found</h4>
                            <p>Try adjusting your search or create a new department.</p>
                            <Link to="/add-department" className="add-btn">
                              <AddIcon />
                              Add Department
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Departments;