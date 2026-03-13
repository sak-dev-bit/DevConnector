import axios from 'axios';

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// Create a new Axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for refresh token cookies
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['x-auth-token'] = accessToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints to avoid loops
    const isAuthRoute = originalRequest.url?.includes('/auth');

    // If error is 401, we haven't retried yet, and it's NOT an auth route
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });

        if (res.data.success) {
          const { token } = res.data;
          setAccessToken(token);

          // Retry the original request with new token
          originalRequest.headers['x-auth-token'] = token;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        console.error('Token refresh failed:', refreshError);
        accessToken = null;
        // Optional: window.location.href = '/login'; or trigger logout in AuthContext
      }
    }

    return Promise.reject(error);
  }
);

export default api;
