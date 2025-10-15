const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ADMINENDPOINTS = {
  AUTH: {
    SIGNUP: `${BASE_URL}/admin/create-user`,
  },
  
};

export default ADMINENDPOINTS;