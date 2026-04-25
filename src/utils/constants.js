// constants.js
const getBaseUrl = () => {
  // Check for Vite
  if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Check for Create React App
  if (process.env && process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // Check for process.env.VITE (sometimes used in hybrid setups)
  if (process.env && process.env.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }
  // Fallback
  return 'https://darziflow-backend.onrender.com/api';
};

export const API_BASE = getBaseUrl();
export default API_BASE;