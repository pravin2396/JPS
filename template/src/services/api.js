import axios from 'axios';
import { storageService } from './storageService';

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: 'https://api.jobportalsystem.dev/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer auth token from localStorage if present
apiClient.interceptors.request.use(
  (config) => {
    const token = storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: centralize error logging and token expiration handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and notify if needed
      console.warn('Unauthorized request intercepted. Session may have expired.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
