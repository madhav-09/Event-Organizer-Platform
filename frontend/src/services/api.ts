import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'https://event-organizer-platform.onrender.com',
  // baseURL: 'http://localhost:8000',
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Don't attach token to refresh endpoint
    if (config.url?.includes('/users/refresh')) {
      return config;
    }
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      processQueue(error, null);
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const res = await axios.post(
        `${api.defaults.baseURL}/users/refresh`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { access_token } = res.data;
      localStorage.setItem('access_token', access_token);
      processQueue(null, access_token);
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;


export const createEvent = (payload: any) =>
  api.post("/events/", payload);


export const getMyEvents = async () => {
  const res = await api.get("/organizers/me/events");
  return res.data;
};
export const getMyBookings = async () => {
  const res = await api.get("/users/me/bookings");
  return res.data;
}

export const createBooking = (ticket_id: string, quantity: number) =>
  api.post("/bookings/", { ticket_id, quantity });

export const createPaymentOrder = (booking_id: string) =>
  api.post(`/payments/create-order/${booking_id}`);

export const verifyPayment = (payload: any) =>
  api.post("/payments/verify", payload);

export const getEventBookings = async (eventId: string) => {
  const res = await api.get(
    `/organizers/me/events/${eventId}/bookings`
  );
  return res.data;
};

export const scanBookingQR = (payload: any) =>
  api.post("/bookings/scan", payload);

// ─── Event Management ────────────────────────────────────────────────────────
export const updateEvent = (eventId: string, payload: any) =>
  api.put(`/events/${eventId}`, payload);

export const deleteEvent = (eventId: string) =>
  api.delete(`/events/${eventId}`);

// ─── Ticket Management ───────────────────────────────────────────────────────
export const getEventTickets = async (eventId: string) => {
  const res = await api.get(`/tickets/event/${eventId}`);
  return res.data;
};

export const createTicket = (payload: any) =>
  api.post("/tickets/", payload);

export const updateTicket = (ticketId: string, payload: any) =>
  api.put(`/tickets/${ticketId}`, payload);

export const deleteTicket = (ticketId: string) =>
  api.delete(`/tickets/${ticketId}`);

// ================= PROFILE MANAGEMENT =================
export const getUserProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateUserProfile = async (data: Record<string, any>) => {
  const response = await api.put("/users/me", data);
  return response.data;
};

export const getOrganizerProfile = async () => {
  const response = await api.get("/organizers/me");
  return response.data;
};

export const updateOrganizerProfile = async (data: Record<string, any>) => {
  const response = await api.put("/organizers/me", data);
  return response.data;
};
