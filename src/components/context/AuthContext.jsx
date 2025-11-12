"use client"

import { createContext, useContext, useState, useEffect } from "react"
import authService from "../../services/authService";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("useraccesstoken")
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed.user) // backend returns { user, accessToken, refreshToken }
      } catch (err) {
        console.error("Failed to parse stored user:", err)
        localStorage.removeItem("useraccesstoken")
      }
    }
    setLoading(false)
  }, [])

  const login = async ({ email, password, platform = "WEB" }) => {
    setError(null)
    try {
      const data = await authService.login({ email, password, platform })
      setUser(data.user)
      localStorage.setItem("useraccesstoken", JSON.stringify(data))
      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed"
      setError(message)
      throw new Error(message)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error(err)
    }
    setUser(null)
    localStorage.removeItem("useraccesstoken")
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
