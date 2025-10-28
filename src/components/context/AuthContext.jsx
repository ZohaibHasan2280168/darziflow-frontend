"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("darziflow_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error("Failed to parse stored user:", err)
        localStorage.removeItem("darziflow_user")
      }
    }
    setLoading(false)
  }, [])

  const login = (email, password, role) => {
    setError(null)
    try {
      // Simulate API call - replace with actual authentication
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        loginTime: new Date().toISOString(),
      }

      setUser(userData)
      localStorage.setItem("darziflow_user", JSON.stringify(userData))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("darziflow_user")
  }

  return <AuthContext.Provider value={{ user, loading, error, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
