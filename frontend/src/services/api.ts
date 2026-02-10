import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'https://event-organizer-platform-production.up.railway.app/',
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');

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

