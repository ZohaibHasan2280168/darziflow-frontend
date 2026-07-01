// constants.js
const getBaseUrl = () => {
  let url;

  // Check for Vite
  if (import.meta && import.meta.env && (import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL)) {
    url = import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  }
  // Check for Create React App
  else if (process.env && (process.env.REACT_APP_AZURE_BASE_URL || process.env.REACT_APP_API_BASE_URL)) {
    url = process.env.REACT_APP_AZURE_BASE_URL || process.env.REACT_APP_API_BASE_URL;
  }
  // Check for process.env.VITE (sometimes used in hybrid setups)
  else if (process.env && (process.env.VITE_AZURE_BASE_URL || process.env.VITE_API_BASE_URL)) {
    url = process.env.VITE_AZURE_BASE_URL || process.env.VITE_API_BASE_URL;
  }

  // Fallback if not configured or resolved as string 'undefined'
  if (!url || url === "undefined") {
    return 'https://darziflowbackend-buagfcfpfveadmgm.centralindia-01.azurewebsites.net/api';
  }

  return url;
};

export const API_BASE = getBaseUrl();
export default API_BASE;