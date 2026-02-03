import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: Add request interceptor for JWT token
// apiClient.interceptors.request.use((config) => {
//   const token = // get from AuthContext
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// TODO: Add response interceptor for error handling
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle token expiration
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
