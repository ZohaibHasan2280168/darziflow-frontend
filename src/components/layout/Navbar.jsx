import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/reqInterceptor";
import authService from "../../services/authService";

import {
  FiClock,
  FiUsers,
  FiGrid,
  FiShoppingCart,
  FiHome,
  FiLogOut
} from "react-icons/fi";

import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

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

  // Fetch user profile (NEW AUTH SYSTEM)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");

        setUser({
          name: res.data.name,
          email: res.data.email,
          profilePic: res.data.profilePic || null
        });
      } catch (err) {
        console.error("Error fetching profile:", err);

        if (err.response?.status === 401) {
          authService.logout();
          navigate("/login");
        }
      }
    };

    fetchProfile();
  }, [navigate]);

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

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
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
          <div className="profile-container" ref={dropdownRef}>
            <div
              className="profile-icon"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
            >
              {user.profilePic ? (
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
                  title="Audit Logs"
                  onClick={() => handleNavigation("/audit-logs")}
                >
                  <FiClock />
                </button>

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
