import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // adjust if deployed

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};
  
// Login user
const login = async ( { email, password, platform="WEB" }) => {
   const response = await axios.post(`${API_URL}/login`, { email, password, platform });
  if (response.data.accessToken) {
    localStorage.setItem("useraccesstoken", JSON.stringify(response.data));
  }
console.log(response.data);
  return response.data;
};


// Logout user
const logout = async () => {
  // Get the stored token
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  const token = parsedData?.accessToken;

  if (!token) {
    console.error("No access token found");
    return;
  }

  // Send token in Authorization header
  const response = await axios.post(
    `${API_URL}/logout`,
    {}, // empty body
    {
      headers: {
        Authorization: `Bearer ${token}`,  // or just `token: token` if your API uses custom header
      },
    }
  );

  console.log(response.data);

  // Remove token from localStorage after logout
  localStorage.removeItem("useraccesstoken");

  return response.data;
};


const authService = {
  register,
  login,
  logout,
};

export default authService;
