// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Don't intercept 401s for these endpoints - they should fail naturally
//     const skipRefreshUrls = ['/auth/status', '/auth/login', '/refresh-token', '/logout'];
//     const shouldSkipRefresh = skipRefreshUrls.some(url => 
//       originalRequest.url?.includes(url)
//     );

//     if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(() => axiosInstance(originalRequest))
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         // Create a separate axios instance to avoid interceptor loops
//         const refreshAxios = axios.create({
//           baseURL: axiosInstance.defaults.baseURL,
//           withCredentials: true,
//         });
        
//         await refreshAxios.post('/refresh-token');

//         processQueue(null);
//         isRefreshing = false;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         isRefreshing = false;
        
//         // Only redirect if we're not already on the login page
//         if (window.location.pathname !== '/login') {
//           window.location.href = '/login';
//         }
        
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // FIXED: Only skip login and refresh endpoints - allow status to trigger refresh
    const skipRefreshUrls = ['/auth/login', '/refresh-token', '/logout'];
    const shouldSkipRefresh = skipRefreshUrls.some(url => 
      originalRequest.url?.includes(url)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Create a separate axios instance to avoid interceptor loops
        const refreshAxios = axios.create({
          baseURL: axiosInstance.defaults.baseURL,
          withCredentials: true,
        });
        
        await refreshAxios.post('/refresh-token');

        processQueue(null);
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;