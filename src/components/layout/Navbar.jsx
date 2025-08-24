import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar when clicking on a link
  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
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
                onClick={() => navigate("/")}
              >
                Logout
              </button>
            </>
          )}
          {isMobile && (
            <button
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          )}
        </div>
      </nav>

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
                onClick={() => handleNavigation("/")}
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
          gap: 1rem;
        }

        .btn {
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
          }

          .navbar-brand {
            font-size: 1.5rem;
          }
          
          .universe-button {
            --fs-size: 1.5em;
          }
        }
      `}</style>
    </>
  );
}