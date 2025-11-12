"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaCheck } from "react-icons/fa"

const API_URL = "http://localhost:5000/api/profile"

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordMsgType, setPasswordMsgType] = useState("")

  const getToken = () => {
    const storedData = localStorage.getItem("useraccesstoken")
    const parsedData = storedData ? JSON.parse(storedData) : null
    return parsedData?.accessToken
  }

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken()
        if (!token) throw new Error("No access token found")

        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setUser(res.data)
      } catch (err) {
        setError(err.response?.data?.msg || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg("")

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg("New passwords do not match")
      setPasswordMsgType("error")
      return
    }

    try {
      const token = getToken()
      const res = await axios.put(
        `${API_URL}/password`,
        {
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setPasswordMsg(res.data.msg)
      setPasswordMsgType("success")
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setPasswordMsg(err.response?.data?.msg || "Failed to change password")
      setPasswordMsgType("error")
    }
  }

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    )

  if (error)
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
      </div>
    )

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Profile Settings</h1>
          <button
            onClick={() => navigate("/dashboard")}
            style={styles.backBtn}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.1)")}
          >
            <FaArrowLeft size={16} />
            Back
          </button>
        </div>

        <div style={styles.profileSection}>
          <div style={styles.iconWrapper}>
            <FaUser size={64} style={styles.profileIcon} />
          </div>
          <h2 style={styles.userName}>{user?.name || "User"}</h2>
          <p style={styles.userEmail}>{user?.email || "email@example.com"}</p>
        </div>

        <div style={styles.passwordSection}>
          <div style={styles.sectionHeader}>
            <FaLock style={styles.sectionIcon} />
            <h3 style={styles.sectionTitle}>Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input
                  type="password"
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  style={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              style={styles.submitBtn}
              onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              <FaCheck size={16} style={{ marginRight: "0.5rem" }} />
              Update Password
            </button>

            {passwordMsg && (
              <div
                style={{
                  ...styles.message,
                  ...(passwordMsgType === "success" ? styles.successMessage : styles.errorMessage),
                }}
              >
                {passwordMsg}
              </div>
            )}
          </form>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
            'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
            'Helvetica Neue', sans-serif;
        }
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    background: "#fff",
    borderRadius: "24px",
    maxWidth: "600px",
    width: "100%",
    padding: "2.5rem",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1.5rem",
    borderBottom: "2px solid #f0f0f0",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: "-0.5px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(106, 17, 203, 0.1)",
    color: "#6a11cb",
    border: "2px solid #6a11cb",
    padding: "0.625rem 1.25rem",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  profileSection: {
    textAlign: "center",
    marginBottom: "2.5rem",
    paddingBottom: "2rem",
    borderBottom: "2px solid #f0f0f0",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    alignItems: "center",
    margin: "0 auto 1rem",
  },
  profileIcon: {
    color: "#fff",
  },
  userName: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "0.25rem",
  },
  userEmail: {
    fontSize: "0.938rem",
    color: "#666",
  },
  infoSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "2.5rem",
  },
  infoCard: {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    background: "#f9f9f9",
    borderRadius: "12px",
    border: "1px solid #f0f0f0",
  },
  infoIconWrapper: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoIcon: {
    color: "#fff",
    fontSize: "1.25rem",
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "0.25rem",
  },
  infoInput: {
    width: "100%",
    padding: "0.5rem",
    border: "none",
    background: "transparent",
    color: "#1a1a1a",
    fontWeight: "600",
    fontSize: "0.938rem",
    outline: "none",
  },
  passwordSection: {
    background: "#f9f9f9",
    padding: "2rem",
    borderRadius: "16px",
    border: "1px solid #f0f0f0",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  sectionIcon: {
    color: "#6a11cb",
    fontSize: "1.25rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1a1a1a",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    transition: "all 0.3s ease",
  },
  inputIcon: {
    color: "#999",
    fontSize: "1rem",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "0.938rem",
    color: "#1a1a1a",
    fontFamily: "inherit",
    WebkitAutofill: {
      WebkitBoxShadow: "0 0 0 1000px #fff inset",
      WebkitTextFillColor: "#1a1a1a",
    },
  },
  submitBtn: {
    padding: "0.875rem 1.5rem",
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "0.5rem",
  },
  message: {
    padding: "0.875rem 1rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
    textAlign: "center",
    fontWeight: "500",
  },
  successMessage: {
    background: "rgba(34, 197, 94, 0.1)",
    color: "#22c55e",
    border: "1px solid #22c55e",
  },
  errorMessage: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid #ef4444",
  },
  loadingContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontSize: "1.125rem",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(255, 255, 255, 0.3)",
    borderTop: "4px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  errorContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    color: "#ef4444",
    fontSize: "1.125rem",
    fontWeight: "600",
  },
}
