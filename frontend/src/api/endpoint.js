const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    STATUS: `${BASE_URL}/auth/status`,
    LOGOUT: `${BASE_URL}/logout`,
    REFRESH_TOKEN: `${BASE_URL}/refresh-token`,
  },
  CUSTOMER: {
    ADD_CUSTOMER: `${BASE_URL}/customer/add-customer`,
    CUSTOMER_LIST:`${BASE_URL}/customer`,
    CUSTOMER_DETAIL:`${BASE_URL}/customer/customer-detail`,
    UPDATE_CUSTOMER:`${BASE_URL}/customer/update-customer`,
    EXPORT_CUSTOMER:`${BASE_URL}/export/customers`
  },
  TECHNICIAN: {
    ADD_TECHNICIAN: `${BASE_URL}/master-add/technician`,
    TECHNICIAN_LIST: `${BASE_URL}/master-view/technician-list`,
    TECHNICIAN_DETAIL: `${BASE_URL}/master-view/technician-detail`,
    UPDATE_TECHNICIAN: `${BASE_URL}/master-edit/technician`,
    EXPORT_TECHNICIAN: `${BASE_URL}/export/technicians`
  }
};

export default ENDPOINTS;