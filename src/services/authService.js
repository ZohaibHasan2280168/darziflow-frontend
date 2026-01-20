import axios from "axios";
import api from "../services/reqInterceptor.js";

 const API_URL = "http://localhost:5000/api/auth"; // adjust if deployed
//const API_URL = "https://darziflow-backend.onrender.com/api/auth"; 

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};
  
// Login user
const login = async ({ email, password, platform = "WEB" }) => {
  const response = await api.post("/auth/login", {
    email,
    password,
    platform,
  });

  if (response.data.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
  }

  return response.data;
};



// Logout user
const logout = async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("accessToken");
};



const authService = {
  register,
  login,
  logout,
};

export default authService;
