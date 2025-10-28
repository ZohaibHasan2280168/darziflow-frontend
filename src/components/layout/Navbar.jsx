"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import authService from "../../services/authService"
import { X, Eye, EyeOff } from "lucide-react"
import axios from "axios"

const API_URL = "https://darziflow-backend.onrender.com/api"

const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken")
  const parsedData = storedData ? JSON.parse(storedData) : null
  return parsedData?.accessToken
}

const Navbar = () => {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [user, setUser] = useState({
    name: "Loading...",
    profilePic: null,
    email: "",
  })
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const fileInputRef = useRef(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken()
        if (!token) return

        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setUser({
          name: res.data.name,
          email: res.data.workEmail,
          profilePic: null,
        })

        setEditUser((prev) => ({
          ...prev,
          name: res.data.name,
          email: res.data.workEmail,
        }))
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }

    fetchProfile()
  }, [])

  const handleNavigation = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const handleProfileClick = () => {
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
  }

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newProfilePic = e.target.result
        setUser({ ...user, profilePic: newProfilePic })
        setEditUser({ ...editUser, profilePic: newProfilePic })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditUser({ ...editUser, [name]: value })
  }

  const handleSaveProfile = async () => {
    try {
      const token = getToken()
      if (!token) return

      if (editUser.currentPassword && editUser.newPassword && editUser.confirmPassword) {
        if (editUser.newPassword !== editUser.confirmPassword) {
          alert("New password and confirm password do not match!")
          return
        }

        await axios.put(
          `${API_URL}/profile/password`,
          {
            oldPassword: editUser.currentPassword,
            newPassword: editUser.newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        alert("Password updated successfully!")
        setEditUser((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      }

      setIsDrawerOpen(false)
    } catch (err) {
      console.error("Error updating password:", err)
      alert("Failed to update password.")
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <section className="brand">
            <div className="brand-content" aria-hidden>
              <h2>DarziFlow</h2>
              <h2>DarziFlow</h2>
            </div>
          </section>

          {/* move primary links next to brand on the left */}
          {!isMobile && (
            <div className="nav-links-left">
              <button className="nav-link" onClick={() => navigate("/dashboard")}>
                Dashboard
              </button>
              <button className="nav-link" onClick={() => navigate("/users")}>
                All Users
              </button>
            </div>
          )}
        </div>
 
        <div className="navbar-right">
           {!isMobile && (
             <div className="action-buttons">
               <button className="btn btn-primary" onClick={() => navigate("/add-user")}>
                 + Add User
               </button>
               <button
                 className="btn btn-logout"
                 onClick={() => {
                   authService.logout()
                   navigate("/")
                 }}
               >
                 Logout
               </button>
             </div>
           )}

          {isMobile && (
            <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
              ☰
            </button>
          )}

          <div className="profile-icon" onClick={handleProfileClick}>
            {user.profilePic ? (
              <img src={user.profilePic || "/placeholder.svg"} alt="Profile" />
            ) : (
              <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
            )}
          </div>
        </div>
      </nav>

      {isDrawerOpen && <div className="drawer-overlay" onClick={handleCloseDrawer}></div>}

      <div className={`profile-drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2>Profile Settings</h2>
          <button className="close-btn" onClick={handleCloseDrawer}>
            <X size={24} />
          </button>
        </div>

        <div className="profile-info">
          <div className="profile-image-container">
            <div className="profile-image-large" onClick={handleImageClick}>
              {editUser.profilePic ? (
                <img src={editUser.profilePic || "/placeholder.svg"} alt="Profile" />
              ) : (
                <span>{editUser.name ? editUser.name.charAt(0).toUpperCase() : "U"}</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>
          <div className="profile-name">{editUser.name}</div>
        </div>

        <div className="profile-edit-form">
          <h3>Edit Profile</h3>

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
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowCurrentPassword((v) => !v)}
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                title={showCurrentPassword ? "Hide" : "Show"}
              >
                {showCurrentPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

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
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowNewPassword((v) => !v)}
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                title={showNewPassword ? "Hide" : "Show"}
              >
                {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

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
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                title={showConfirmPassword ? "Hide" : "Show"}
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button className="save-btn" onClick={handleSaveProfile}>
            Save Changes
          </button>
        </div>
      </div>

      {isMobile && (
        <>
          <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <span className="sidebar-brand">Darzi Flow</span>
              <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
                ×
              </button>
            </div>
            <div className="sidebar-links">
              <button className="sidebar-link" onClick={() => handleNavigation("/dashboard")}>
                Dashboard
              </button>
              <button className="sidebar-link" onClick={() => handleNavigation("/users")}>
                All Users
              </button>
              <button className="sidebar-link" onClick={() => handleNavigation("/add-user")}>
                Add New User
              </button>
              <button
                className="sidebar-link"
                onClick={() => {
                  authService.logout()
                  handleNavigation("/")
                }}
              >
                Logout
              </button>
            </div>
          </div>
          <div className={`overlay ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(false)} />
        </>
      )}

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700;800&display=swap");

        /* Brand animated text (scoped) */
        .brand { display: flex; align-items: center; }
        /* make brand-content take up layout space (so links won't overlap) */
        .brand-content {
          position: relative;
          display: inline-block;       /* reserve inline space for the brand */
          line-height: 1;
          height: 72px;
          padding-left: 2px;
        }
        /* invisible text to size the container (keeps animated absolute layers on top) */
        .brand-content::before {
          content: "DarziFlow";
          font-family: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          font-weight: 900;
          font-size: 2.6rem;
          opacity: 0;
          display: inline-block;
          height: 100%;
        }
         .brand-content h2 {
           font-family: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
           font-weight: 900;
           font-size: 2.6rem; /* slightly larger brand text */
           margin: 0;
           position: absolute;
           left: 0;
           top: 50%;
           transform: translateY(-50%);
+          z-index: 2; /* ensure visible text sits above the pseudo element */
           pointer-events: none;
           user-select: none;
           letter-spacing: -0.6px;
         }
         .brand-content h2:nth-child(1) {
           color: transparent;
           -webkit-text-stroke: 1.8px #03a9f4;
           filter: drop-shadow(0 3px 6px rgba(3,169,244,0.12));
         }
         .brand-content h2:nth-child(2) {
           color: #03a9f4;
           animation: brandClip 4s ease-in-out infinite;
         }
        @keyframes brandClip {
          0%, 100% {
            clip-path: polygon(
              0% 45%,
              16% 44%,
              33% 50%,
              54% 60%,
              70% 61%,
              84% 59%,
              100% 52%,
              100% 100%,
              0% 100%
            );
          }
          50% {
            clip-path: polygon(
              0% 60%,
              15% 65%,
              34% 66%,
              51% 62%,
              67% 50%,
              84% 45%,
              100% 46%,
              100% 100%,
              0% 100%
            );
          }
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          color: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 100;
        }

        /* left area: brand + primary links placed immediately after brand */
        .navbar-left { display: flex; align-items: center; gap: 0.6rem; padding-right: 0; }
        .nav-links-left { display: flex; gap: 0.45rem; align-items: center; margin-left: 0.5rem; }
        .nav-links-left .nav-link { padding: 0.45rem 0.8rem; font-size: 0.93rem; }

        /* right area: actions and profile */
        .navbar-right { display: flex; align-items: center; gap: 1rem; margin-left: 1rem; }

        /* responsive adjustments */
        @media (max-width: 1024px) {
          .brand-content { width: auto; }
          .brand-content h2 { font-size: 2.1rem; }
        }
        @media (max-width: 768px) {
          .brand-content { width: auto; min-width: 0; height: 44px; padding-left: 0; }
          .brand-content h2 { font-size: 1.25rem; -webkit-text-stroke: 1px #03a9f4; }
          .navbar-left { padding-right: 1rem; }
        }

        .logo-button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .logo-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .logo-icon {
          font-size: 1.3rem;
        }

        .logo-text {
          letter-spacing: 0.5px;
        }

        .nav-links {
          display: flex;
          gap: 0.5rem;
        }

        .nav-link {
          background: none;
          border: none;
          color: #cbd5e1;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .nav-link:hover {
          color: #e2e8f0;
        }

        .nav-link:hover::after {
          width: 80%;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .btn-logout {
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .profile-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
          cursor: pointer;
          overflow: hidden;
          border: 2px solid rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .profile-icon:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
        }

        .profile-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .profile-drawer {
          position: fixed;
          top: 0;
          right: -380px;
          width: 350px;
          height: 100%;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
          transition: right 0.3s ease-out;
          z-index: 1001;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .profile-drawer.open {
          right: 0;
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        }

        .drawer-header h2 {
          color: #e2e8f0;
          font-size: 1.3rem;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          color: #e2e8f0;
          transform: rotate(90deg);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .profile-image-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .profile-image-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 2.5rem;
          font-weight: bold;
          overflow: hidden;
          cursor: pointer;
          border: 3px solid rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .profile-image-large:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
        }

        .profile-image-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #e2e8f0;
          margin-top: 0.75rem;
        }

        .profile-edit-form {
          background: rgba(255, 255, 255, 0.03);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .profile-edit-form h3 {
          margin: 0 0 1.5rem 0;
          color: #e2e8f0;
          font-size: 1.1rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(99, 102, 241, 0.1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .disabled-input {
          background-color: rgba(0, 0, 0, 0.2);
          color: #94a3b8;
          cursor: not-allowed;
        }

        .eye-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 1.1rem;
          transition: transform 0.18s ease, opacity 0.18s ease;
          background: transparent;   /* no background */
          border: none;              /* remove default button border */
          color: #ffffff;            /* white icon color */
          padding: 6px;              /* comfortable hit area */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          box-shadow: none;
        }

        .eye-icon:hover {
          transform: translateY(-50%) scale(1.08);
          opacity: 0.95;
        }

        .eye-icon:focus {
          outline: 2px solid rgba(99,102,241,0.18);
          outline-offset: 2px;
        }

        /* ensure lucide svg uses currentColor for stroke */
        .eye-icon svg {
          stroke: currentColor;
          fill: none;
        }

        /* Save button - themed, 3D, dark-glass look to match site */
        .save-btn {
          width: 100%;
          padding: 0.85rem 0.95rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.95rem;
          color: #ffffff;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 60%, #60a5fa 100%);
          box-shadow:
            0 14px 40px rgba(3, 7, 18, 0.65),
            0 6px 18px rgba(59,130,246,0.12),
            inset 0 1px 0 rgba(255,255,255,0.03);
          transition: transform 0.18s cubic-bezier(.2,.9,.2,1), box-shadow 0.18s ease, filter 0.15s;
          -webkit-font-smoothing: antialiased;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow:
            0 28px 70px rgba(3, 7, 18, 0.75),
            0 10px 30px rgba(59,130,246,0.16);
          filter: saturate(1.06);
        }

        .save-btn:active:not(:disabled) {
          transform: translateY(-1px) scale(0.998);
          box-shadow:
            0 10px 28px rgba(3, 7, 18, 0.7),
            0 4px 12px rgba(59,130,246,0.10);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
          filter: grayscale(0.15) brightness(0.9);
        }

        .save-btn:focus-visible {
          outline: 3px solid rgba(99,102,241,0.18);
          outline-offset: 3px;
        }
      `}</style>
    </>
  )
}

export default Navbar