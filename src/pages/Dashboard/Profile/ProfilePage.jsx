"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaUser, FaLock, FaArrowLeft, FaCheck } from "react-icons/fa"
import { useAlert } from '../../../components/ui/AlertProvider'
import api from "../../../services/reqInterceptor"
import { useAuth } from "../../../components/context/AuthContext"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { setMustChangePassword } = useAuth()
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordMsgType, setPasswordMsgType] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile`)
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
        const res = await api.put("/profile/password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      })

      showAlert({ title: 'Success', message: res.data.msg || 'Password updated', type: 'success' })
      setMustChangePassword(false)
      navigate("/dashboard")

      setPasswordMsg("")
      setPasswordMsgType("")
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to change password"
      showAlert({ title: 'Error', message: msg, type: 'error' })
      setPasswordMsg(msg)
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
            onMouseEnter={(e) => (e.target.style.background = "rgba(106, 17, 203, 0.2)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(106, 17, 203, 0.1)")}
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--main-bg)",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    background: "var(--card-bg)",
    borderRadius: "24px",
    border: "1px solid var(--border-light)",
    maxWidth: "600px",
    width: "100%",
    padding: "2.5rem",
    boxShadow: "var(--card-shadow)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1.5rem",
    borderBottom: "2px solid var(--border-light)",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "var(--text-primary)",
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
    borderBottom: "2px solid var(--border-light)",
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
    color: "var(--text-primary)",
    marginBottom: "0.25rem",
  },
  userEmail: {
    fontSize: "0.938rem",
    color: "var(--text-secondary)",
  },
  passwordSection: {
    background: "var(--card-hover-bg)",
    padding: "2rem",
    borderRadius: "16px",
    border: "1px solid var(--border-light)",
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
    color: "var(--text-primary)",
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
    color: "var(--text-primary)",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    background: "var(--input-bg)",
    border: "1px solid var(--border-light)",
    borderRadius: "10px",
    transition: "all 0.3s ease",
  },
  inputIcon: {
    color: "var(--text-muted)",
    fontSize: "1rem",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "0.938rem",
    color: "var(--text-primary)",
    fontFamily: "inherit",
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
    color: "#10b981",
    border: "1px solid #10b981",
  },
  errorMessage: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid #ef4444",
  },
  loadingContainer: {
    minHeight: "100vh",
    background: "var(--main-bg)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "var(--text-primary)",
    fontSize: "1.125rem",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(106, 17, 203, 0.3)",
    borderTop: "4px solid #6a11cb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  errorContainer: {
    minHeight: "100vh",
    background: "var(--main-bg)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    background: "var(--card-bg)",
    padding: "1.5rem",
    borderRadius: "12px",
    color: "#ef4444",
    fontSize: "1.125rem",
    fontWeight: "600",
    border: "1px solid var(--border-light)",
  },
}