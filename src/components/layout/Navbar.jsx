import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { X } from "lucide-react";
import axios from "axios";

const API_URL = "https://darziflow-backend.onrender.com/api";

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  console.log(parsedData?.accessToken)
  return parsedData?.accessToken;
};

const Navbar = () => {
  const navigate = useNavigate();
  
  // State for responsive design
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for profile drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // State for user profile
  const [user, setUser] = useState({
    name: 'Loading...',
    profilePic: null,
    email: ''
  });
  
  // State for editing user profile
  const [editUser, setEditUser] = useState({ 
    name: '', 
    email: '', 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  
  // Refs and state for password visibility
  const fileInputRef = useRef(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          name: res.data.name,
          email: res.data.workEmail,
          profilePic: null,
        });

        setEditUser(prev => ({
          ...prev,
          name: res.data.name,
          email: res.data.workEmail,
        }));
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // Close sidebar when clicking on a link
  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  // Profile drawer handlers
  const handleProfileClick = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Profile image handlers
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newProfilePic = e.target.result;
        setUser({ ...user, profilePic: newProfilePic });
        setEditUser({ ...editUser, profilePic: newProfilePic });
      };
      reader.readAsDataURL(file);
    }
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  // Save profile handler with API integration
  const handleSaveProfile = async () => {
  try {
    const token = getToken();
    if (!token) return;

    // Password change only
    if (
      editUser.currentPassword &&
      editUser.newPassword &&
      editUser.confirmPassword
    ) {
      if (editUser.newPassword !== editUser.confirmPassword) {
        alert("New password and confirm password do not match!");
        return;
      }

      await axios.put(
        `${API_URL}/profile/password`,
        {
          oldPassword: editUser.currentPassword,
          newPassword: editUser.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Password updated successfully!");

      // Clear password fields after success
      setEditUser((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }

    setIsDrawerOpen(false);
  } catch (err) {
    console.error("Error updating password:", err);
    alert("Failed to update password.");
  }
};

  return (
    <>
      {/* Navbar for desktop */}
      <nav className="navbar">
        <div className="navbar-left">
          {/* Special Darzi-Flow Button with the custom styling */}
          <button className="universe-button" data-text="Darzi_Flow">
            <span className="actual-text">&nbsp;Darzi_Flow&nbsp;</span>
            <span aria-hidden="true" className="hover-text">
              &nbsp;Darzi_Flow&nbsp;
            </span>
          </button>
          
          {/* Desktop navigation links */}
          {!isMobile && (
            <>
              <button
                className="navbar-link"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>
              <button
                className="navbar-link"
                onClick={() => navigate("/users")}
              >
                All Users
              </button>
            </>
          )}
        </div>
        
        <div className="navbar-right">
          {/* Desktop action buttons */}
          {!isMobile && (
            <>
           
              <button
                className="btn btn-primary"
                onClick={() => navigate("/add-user")}
              >
                Add New User
              </button>
              <button
                className="btn btn-disabled"
                onClick={() => { authService.logout(); navigate("/"); }}
              >
                Logout
              </button>
            </>
          )}
          
          {/* Mobile menu toggle */}
          {isMobile && (
            <button
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          )}
        
          {/* Profile icon */}
          <div className="profile-icon" onClick={handleProfileClick}>
            {user.profilePic ? (
              <img src={user.profilePic} alt="Profile" />
            ) : (
              <span>{user.name ? user.name.charAt(0) : 'M'}</span>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Drawer Section - All profile code in one place */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={handleCloseDrawer}></div>
      )}
      
      <div className={`profile-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Profile</h2>
          <button className="close-btn" onClick={handleCloseDrawer}>
            <X size={24} />
          </button>
        </div>
        
        <div className="profile-info">
          <div className="profile-image-container">
            <div className="profile-image-large" onClick={handleImageClick}>
              {editUser.profilePic ? (
                <img src={editUser.profilePic} alt="Profile" />
              ) : (
                <span>{editUser.name ? editUser.name.charAt(0) : 'M'}</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-name">{editUser.name}</div>
        </div>

        <div className="profile-edit-form">
          <h3>Edit Profile</h3>
          
          {/* Name input */}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editUser.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
            />
          </div>
          
          {/* Email input */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={editUser.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              disabled
              className="disabled-input"
            />
          </div>
          
          {/* Current password input with visibility toggle */}
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={editUser.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
              />
              <span
                className="eye-icon"
                onClick={() => setShowCurrentPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer"
                }}
              >
                {showCurrentPassword ? (
                  // Eye Open SVG
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  // Eye Closed SVG
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.07 21.07 0 0 1 5.06-7.06"/>
                    <path d="M1 1l22 22"/>
                    <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/>
                  </svg>
                )}
              </span>
            </div>
          </div>
          
          {/* New password input with visibility toggle */}
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={editUser.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
              <span
                className="eye-icon"
                onClick={() => setShowNewPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer"
                }}
              >
                {showNewPassword ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.07 21.07 0 0 1 5.06-7.06"/>
                    <path d="M1 1l22 22"/>
                    <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/>
                  </svg>
                )}
              </span>
            </div>
          </div>
          
          {/* Confirm password input with visibility toggle */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={editUser.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
              />
              <span
                className="eye-icon"
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer"
                }}
              >
                {showConfirmPassword ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.07 21.07 0 0 1 5.06-7.06"/>
                    <path d="M1 1l22 22"/>
                    <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/>
                  </svg>
                )}
              </span>
            </div>
          </div>
          
          {/* Save button */}
          <button className="save-btn" onClick={handleSaveProfile}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Sidebar for mobile */}
      {isMobile && (
        <>
          <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <span className="sidebar-brand">Darzi Flow</span>
              <button
                className="close-sidebar"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <div className="sidebar-links">
              <button
                className="sidebar-link"
                onClick={() => handleNavigation("/dashboard")}
              >
                Dashboard
              </button>
              <button
                className="sidebar-link"
                onClick={() => handleNavigation("/users")}
              >
                All Users
              </button>
              <button
                className="sidebar-link"
                onClick={() => handleNavigation("/add-user")}
              >
                Add New User
              </button>
              <button
                className="sidebar-link"
                onClick={() => { authService.logout(); handleNavigation("/"); }}
              >
                Logout
              </button>
            </div>
          </div>
          <div
            className={`overlay ${sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}

      {/* CSS styles */}
      <style jsx>{`
        /* === Special Universe Button Styling === */
        .universe-button {
          margin: 0;
          height: auto;
          background: transparent;
          padding: 0;
          border: none;
          cursor: pointer;
          --border-right: 6px;
          --text-stroke-color: rgba(255, 255, 255, 0.651);
          --animation-color: #ffffff;
          --fs-size: 2em;
          letter-spacing: 3px;
          text-decoration: none;
          font-size: var(--fs-size);
          font-family: "Arial";
          position: relative;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px var(--text-stroke-color);
        }
        
        .universe-button .hover-text {
          position: absolute;
          box-sizing: border-box;
          content: attr(data-text);
          color: var(--animation-color);
          width: 0%;
          inset: 0;
          border-right: var(--border-right) solid var(--animation-color);
          overflow: hidden;
          transition: 0.5s;
          -webkit-text-stroke: 1px var(--animation-color);
        }
        
        .universe-button:hover .hover-text {
          width: 100%;
          filter: drop-shadow(0 0 23px var(--animation-color));
        }

        /* Navbar Styles */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 100;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .navbar-brand {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .navbar-link {
          background: none;
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s;
        }

        .navbar-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .btn {
          margin: 0;
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .btn-primary {
          background-color: #4caf50;
          color: white;
        }

        .btn-primary:hover {
          background-color: #45a049;
          transform: translateY(-2px);
        }

        .btn-disabled {
          background-color: #f44336;
          color: white;
        }

        .btn-disabled:hover {
          background-color: #d32f2f;
          transform: translateY(-2px);
        }

        /* Mobile Toggle */
        .mobile-toggle {
          display: block;
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        /* Sidebar Styles */
        .sidebar {
          position: fixed;
          top: 0;
          left: -300px;
          width: 280px;
          height: 100vh;
          background: linear-gradient(to bottom, #6a11cb, #2575fc);
          color: white;
          padding: 2rem 1rem;
          z-index: 1000;
          transition: left 0.3s ease;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .sidebar.open {
          left: 0;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .sidebar-brand {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .close-sidebar {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 0;
        }

        .sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .sidebar-link {
          background: none;
          border: none;
          color: white;
          text-align: left;
          padding: 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Overlay */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
        }

        .overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Profile Icon Styles */
        .profile-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #3498db;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
          cursor: pointer;
          overflow: hidden;
          border: 2px solid #ecf0f1;
          transition: transform 0.3s;
        }

        .profile-icon:hover {
          transform: scale(1.05);
        }

        .profile-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Profile Drawer Styles */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }

        .profile-drawer {
          position: fixed;
          top: 0;
          right: -350px;
          width: 320px;
          height: 100%;
          background-color: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
          transition: right 0.3s ease-out;
          z-index: 1001;
          padding: 20px;
          overflow-y: auto;
        }

        .profile-drawer.open {
          right: 0;
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .drawer-header h2 {
          color: #2c3e50;
          font-size: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #7f8c8d;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 25px;
        }

        .profile-image-container {
          position: relative;
          margin-bottom: 15px;
        }

        .profile-image-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #3498db;
          background-color: #3498db;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 40px;
          font-weight: bold;
          overflow: hidden;
          cursor: pointer;
        }

        .profile-image-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-name {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin-top: 10px;
        }

        .profile-edit-form {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .profile-edit-form h3 {
          margin-bottom: 15px;
          color: #2c3e50;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .disabled-input {
          background-color: #f5f5f5;
          color: #777;
          cursor: not-allowed;
        }

        .save-btn {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          width: 100%;
          margin-top: 10px;
          transition: background-color 0.3s;
        }

        .save-btn:hover {
          background-color: #2980b9;
        }

        @media (max-width: 768px) {
          .profile-drawer {
            width: 300px;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;