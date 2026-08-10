import axios from 'axios';
import { clearSession, setAccessToken } from '../features/auth/authSlice.js';
import { store } from '../store/index.js';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const isAuthEndpoint = (url = '') => url.includes('/auth/login') || url.includes('/auth/refresh');

const redirectToLogin = () => {
  if (window.location.pathname === '/login') return;
  const currentPath = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?expired=1&from=${encodeURIComponent(currentPath)}`);
};

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint(originalRequest?.url)) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        store.dispatch(setAccessToken(response.data.data.accessToken));
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        store.dispatch(clearSession());
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
