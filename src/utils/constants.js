// Centralized API base that works with both Vite and CRA env formats
let viteUrl;
try {
  // Access import.meta.env inside try/catch to avoid parser issues in non-Vite environments
  viteUrl = import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL;
} catch (e) {
  // import.meta may not exist in some environments — fall back to undefined
  viteUrl = undefined;
}

const processUrl = (typeof process !== 'undefined' && process.env)
  ? (process.env.REACT_APP_API_BASE_URL || process.env.VITE_API_BASE_URL)
  : undefined;

export const API_BASE = processUrl || viteUrl || 'https://darziflow-backend.onrender.com/api';
export default API_BASE;
