import axios from "axios";

const API_URL = "http://localhost:5000/api/users/";

// Get token from localStorage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token;
};

// Get all users (admin only, for example)
const getUsers = async () => {
  const token = getToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const userService = {
  getUsers,
};

export default userService;
