import axios from 'axios';
import { storage, STORAGE_KEYS } from './storage';
import { clearUserRuntimeCaches } from './runtime-cache';
import { useNetworkActivityStore } from '@/store/network-activity';
import { resetRouteTransitions } from '@/lib/route-activity';

// Get base URL from env or use default fallback for local dev
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true, // important for sending/receiving refresh token cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

const LOADER_SKIP_HEADER = 'x-skip-global-loader';

const startRequestLoader = (config: any) => {
  const headers = config.headers ?? {};
  const rawSkipValue = headers[LOADER_SKIP_HEADER] ?? headers[LOADER_SKIP_HEADER.toUpperCase()];
  const shouldSkip = rawSkipValue === '1' || rawSkipValue === 1 || rawSkipValue === true;

  if (headers[LOADER_SKIP_HEADER] !== undefined) delete headers[LOADER_SKIP_HEADER];
  if (headers[LOADER_SKIP_HEADER.toUpperCase()] !== undefined) delete headers[LOADER_SKIP_HEADER.toUpperCase()];

  config.headers = headers;
  config.__globalLoaderTracked = !shouldSkip;

  if (!shouldSkip) {
    useNetworkActivityStore.getState().begin();
  }
};

const stopRequestLoader = (config: any) => {
  if (config?.__globalLoaderTracked) {
    useNetworkActivityStore.getState().end();
  }
};

// Request interceptor: attach Access Token if present
api.interceptors.request.use((config) => {
  startRequestLoader(config as any);

  const token = storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 Unauthorized by attempting to refresh token
api.interceptors.response.use(
  (response) => {
    stopRequestLoader((response as any)?.config);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    stopRequestLoader(originalRequest as any);

    if (status === 403) {
      // Role/session mismatch: clear candidate tab token and force clean login.
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      storage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
      resetRouteTransitions();
      useNetworkActivityStore.getState().reset();
      void clearUserRuntimeCaches();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using httpOnly cookie via the endpoint
        const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        
        const newAccessToken = res.data.accessToken;
        // Save the new token using storage service
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        
        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed or expired, force logout pipeline
        storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        storage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
        resetRouteTransitions();
        useNetworkActivityStore.getState().reset();
        void clearUserRuntimeCaches();
        if (typeof window !== 'undefined') {
          window.location.href = '/login'; // Redirect to login
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
