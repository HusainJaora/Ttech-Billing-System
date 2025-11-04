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
    EXPORT_CUSTOMER:`${BASE_URL}/export/customers`,
    CHECK_BY_CONTACT:`${BASE_URL}/check-customer/by-contact`,
  },
  TECHNICIAN: {
    ADD_TECHNICIAN: `${BASE_URL}/master-add/technician`,
    UPDATE_TECHNICIAN: `${BASE_URL}/master-edit/technician`,
    DELETE_TECHNICIAN:`${BASE_URL}/master-delete/technician`,
    TECHNICIAN_DETAIL: `${BASE_URL}/master-view/technician-detail`,
    TECHNICIAN_LIST: `${BASE_URL}/master-view/technician-list`,
    EXPORT_TECHNICIAN: `${BASE_URL}/export/technicians`
  },
  SUPPLIER: {
    ADD_SUPPLIER: `${BASE_URL}/master-add/supplier`,
    SUPPLIER_LIST: `${BASE_URL}/master-view/supplier-list`,
    DELETE_SUPPLIER:`${BASE_URL}/master-delete/supplier`,
    SUPPLIER_DETAIL: `${BASE_URL}/master-view/supplier-detail`,
    UPDATE_SUPPLIER: `${BASE_URL}/master-edit/supplier`,
    EXPORT_SUPPLIER: `${BASE_URL}/export/suppliers`
  },
  PRODUCT_CATEGORY: {
    ADD_PRODUCT_CATEGORY: `${BASE_URL}/master-add/product-category`,
    PRODUCT_CATEGORY_LIST: `${BASE_URL}/master-view/product-category-list`,
    DELETE_PRODUCT_CATEGORY:`${BASE_URL}/master-delete/product-category`,
    PRODUCT_CATEGORY_DETAIL: `${BASE_URL}/master-view/product-category-detail`,
    UPDATE_PRODUCT_CATEGORY: `${BASE_URL}/master-edit/product-category`,
    EXPORT_PRODUCT_CATEGORY: `${BASE_URL}/export/product-category`
  },
  INQUIRY: {
    ADD_INQUIRY: `${BASE_URL}/repair-inquiry/add-inquiry`,
    // PRODUCT_CATEGORY_LIST: `${BASE_URL}/master-view/product-category-list`,
    // DELETE_PRODUCT_CATEGORY:`${BASE_URL}/master-delete/product-category`,
    // PRODUCT_CATEGORY_DETAIL: `${BASE_URL}/master-view/product-category-detail`,
    // UPDATE_PRODUCT_CATEGORY: `${BASE_URL}/master-edit/product-category`,
    // EXPORT_PRODUCT_CATEGORY: `${BASE_URL}/export/product-category`
  },
};

export default ENDPOINTS;