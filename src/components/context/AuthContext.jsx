"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const storedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(false); // no need to block UI
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Do not auto-create a fake user from a token. Real auth state must come from login or persisted user data.

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        mustChangePassword,
        setMustChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
