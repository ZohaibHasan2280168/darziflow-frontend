import api from "./reqInterceptor";

const API_URL = "/users";

// Get all users(admin only)
const getUsers = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

const userService = {
  getUsers,
};

export default userService;
