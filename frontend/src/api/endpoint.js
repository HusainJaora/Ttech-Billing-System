const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    STATUS: `${BASE_URL}/auth/status`,
    LOGOUT: `${BASE_URL}/logout`,
    REFRESH_TOKEN: `${BASE_URL}/refresh-token`,
  },
};

export default ENDPOINTS;