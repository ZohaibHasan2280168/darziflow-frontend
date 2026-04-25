import axios from "axios";

// Vite ya CRA dono mein se jo available ho wo utha lega
const BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 
                 process.env.REACT_APP_API_BASE_URL;

// Agar variable load nahi hua toh console me error dikhayega
if (!BASE_URL) {
  console.error("API Base URL is missing! .env file check karein ya server restart karein.");
}

const api = axios.create({
  baseURL: BASE_URL && BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`,
  withCredentials: true,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers["x-access-token"];
    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];
    }
    return Promise.reject(error);
  }
);

export default api;