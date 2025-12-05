import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers["x-access-token"];
    if (newAccessToken) {
      //console.log("[Interceptor] New token received:", newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);

      // Also update axios defaults
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    }
    return response;
  },
  (error) => {
    console.error("[Interceptor] Response error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    //console.log("[Interceptor] Using token for request:", accessToken);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error("[Interceptor] Request error:", error);
    return Promise.reject(error);
  }
);

export default api;
