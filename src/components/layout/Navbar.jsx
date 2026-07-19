import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/reqInterceptor";
import authService from "../../services/authService";
import { useAuth } from "../../components/context/AuthContext";
import { useTheme } from "../../components/context/ThemeContext";
import NotificationBell from '../ui/NotificationBell';

import {
  FiClock,
  FiUsers,
  FiGrid,
  FiShoppingCart,
  FiHome,
  FiLogOut,
  FiSun,
  FiMoon,
  FiMessageSquare,
  FiImage,
  FiFileText
} from "react-icons/fi";

import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  const { logout, user: authUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePic: null
  });

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");

        setUser({
          name: res.data.name,
          email: res.data.email,
          profilePic: res.data.profilePic || null,
          avatar: res.data.avatar || null
        });
      } catch (err) {
        console.error("Error fetching profile:", err);

        if (err.response?.status === 401) {
          await logout();
          const loginPath = window.location.pathname.includes("admin")
            ? "/admin-login"
            : window.location.pathname.includes("moderator")
              ? "/moderator-login"
              : "/";
          navigate(loginPath);
        }
      }
    };

    fetchProfile();
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close side drawer with ESC
  useEffect(() => {
    if (!sideOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") setSideOpen(false);
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [sideOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err?.response?.data || err.message || err);
    } finally {
      navigate("/login");
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSideOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button
            className="hamburger-btn"
            aria-label="Toggle navigation"
            onClick={() => setSideOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <div
            className="brand"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            <h2>DarziFlow</h2>
          </div>
        </div>

        <div className="navbar-right">
          <div className="notification-wrapper" style={{ marginRight: "15px", display: "flex", alignItems: "center" }}>
            <NotificationBell />
          </div>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
          <div className="profile-container" ref={dropdownRef}>
            <div
              className="profile-icon"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
            >
              {authUser?.avatar?.url ? (
                <img src={authUser.avatar.url} alt="Profile" />
              ) : user.avatar?.url ? (
                <img src={user.avatar.url} alt="Profile" />
              ) : user.profilePic ? (
                <img src={user.profilePic} alt="Profile" />
              ) : (
                <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
              )}
            </div>

            {profileDropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={() => navigate("/profile")}>Profile</button>
                <button onClick={() => navigate("/settings")}>Settings</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {sideOpen && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setSideOpen(false)}
          />

          <aside className={`side-drawer ${sideOpen ? "open" : ""}`}>
            <div className="side-inner">
              <div className="side-items">
                <button
                  className="side-item"
                  title="Dashboard"
                  onClick={() => handleNavigation("/dashboard")}
                >
                  <FiHome />
                </button>

                <button
                  className="side-item"
                  title="Users"
                  onClick={() => handleNavigation("/users")}
                >
                  <FiUsers />
                </button>

                <button
                  className="side-item"
                  title="Departments"
                  onClick={() => handleNavigation("/departments")}
                >
                  <FiGrid />
                </button>

                <button
                  className="side-item"
                  title="Orders"
                  onClick={() => handleNavigation("/orderlist")}
                >
                  <FiShoppingCart />
                </button>

                <button
                  className="side-item"
                  title="Order Requests"
                  onClick={() => handleNavigation("/order-requests")}
                >
                  <FiFileText />
                </button>

                <button
                  className="side-item"
                  title="Audit Logs"
                  onClick={() => handleNavigation("/audit-logs")}
                >
                  <FiClock />
                </button>

                <button
                  className="side-item"
                  title="Messages"
                  onClick={() => handleNavigation("/chat")}
                >
                  <FiMessageSquare />
                </button>

                {authUser?.role === "ADMIN" && (
                  <button
                    className="side-item"
                    title="Carousel Management"
                    onClick={() => handleNavigation("/carousel")}
                  >
                    <FiImage />
                  </button>
                )}

                <button
                  className="side-item exit-btn"
                  title="Logout"
                  onClick={handleLogout}
                >
                  <FiLogOut />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;
