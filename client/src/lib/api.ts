import axios from 'axios';
import { getToken, setToken } from './token';

const API_URL = '/api';

const api = axios.create({ baseURL: API_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// One shared refresh for the whole app. If several callers need a new access
// token at the same time (page load, expired token, dev double-mount), they all
// wait on the same request, so the refresh cookie is only rotated once.
let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        setToken(res.data.accessToken);
        return res.data.accessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const AUTH_ENDPOINTS = ['/auth/login', '/auth/signup', '/auth/admin-login', '/auth/refresh'];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (err: any) {
        const status = err?.response?.status;
        // Only drop the token when the session is really invalid, not on a temporary error
        if (status === 401 || status === 403) setToken(null);
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;