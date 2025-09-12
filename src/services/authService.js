import api from "./reqInterceptor";

const API_URL = "/auth"; // baseURL already set in api.js

// Register user
const register = async (userData) => {
  const { data } = await api.post(`${API_URL}/register`, userData);
  return data;
};

// Login user
const login = async ({ workEmail, password, platform = "WEB" }) => {
  const { data } = await api.post(`${API_URL}/login`, { workEmail, password, platform });
  // Store initial access token in localStorage (api.js will handle updates after refresh)
  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
    //console.log(`Access token stored in localStorage:${localStorage.getItem("accessToken")}`);
  }

  return data;
};

// Logout user
const logout = async () => {
  const { data } = await api.post(`${API_URL}/logout`);

  // Clear access token from localStorage
  localStorage.removeItem("accessToken");

  return data;
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
