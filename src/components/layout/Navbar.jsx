"use client";



import { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import authService from "../../services/authService";

import axios from "axios";

import "./Navbar.css";



const API_URL = "https://darziflow-backend.onrender.com/api";



const getToken = () => {

  const storedData = localStorage.getItem("useraccesstoken");

  const parsedData = storedData ? JSON.parse(storedData) : null;

  return parsedData?.accessToken;

};



const Navbar = () => {

  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);

  const [user, setUser] = useState({

    name: "",

    profilePic: null,

    email: "",

  });

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);



  // 📱 Handle responsive behavior

  useEffect(() => {

    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);

  }, []);



  // 👤 Fetch user profile

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

          email: res.data.email,

          profilePic: res.data.profilePic || null,

        });

      } catch (err) {

        console.error("Error fetching profile:", err);

      }

    };



    fetchProfile();

  }, []);



  // 🧠 Close dropdown when clicking outside

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {

        setProfileDropdownOpen(false);

      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);



  const handleProfileClick = () => {

    setProfileDropdownOpen((prev) => !prev);

  };



  const handleLogout = () => {

    authService.logout();

    navigate("/");

  };

 

  // 🏢 New handler for All Departments button

  const handleAllDepartments = () => {

    navigate("/departments"); // Navigate to the new departments management page

  };



  return (

    <nav className="navbar">

      <div className="navbar-left">

        <section

          className="brand"

          aria-hidden

          style={{ cursor: "pointer" }}

          onClick={() => navigate("/dashboard")}

        >

          <div className="brand-content">

            <h2>DarziFlow</h2>

          </div>

        </section>

      </div>



      <div className="navbar-right">

        {!isMobile && (

          <div className="action-buttons">

            {/* 🆕 New "All Departments" Button */}

            <button

              className="nav-button"

              onClick={handleAllDepartments}

              aria-label="View all departments"

            >

              All Departments

            </button>

            {/* End of new button */}

          </div>

        )}



        {/* 👤 Profile Dropdown */}

        <div className="profile-container" ref={dropdownRef}>

          <div className="profile-icon" onClick={handleProfileClick}>

            {user.profilePic ? (

              <img src={user.profilePic || "/placeholder.svg"} alt="Profile" />

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

  );

};



export default Navbar;