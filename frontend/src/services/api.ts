import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;


export const createEvent = (payload: any) =>
  api.post("/events/", payload);