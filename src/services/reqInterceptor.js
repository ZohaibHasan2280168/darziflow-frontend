import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/",
  //baseURL: "https://darziflow-backend.onrender.com/api",
  withCredentials: true,
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers["x-access-token"];
    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
      api.defaults.headers.common["Authorization"] =
        `Bearer ${newAccessToken}`;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // Refresh token expired 
    if (status === 401) {
      
      localStorage.removeItem("accessToken");

      delete api.defaults.headers.common["Authorization"];

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// REQUEST INTERCEPTOR
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
