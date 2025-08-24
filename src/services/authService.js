import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // adjust if deployed

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// Login user
const login = async ( { workEmail, password }) => {
   const response = await axios.post(`${API_URL}/login`, { workEmail, password });
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
