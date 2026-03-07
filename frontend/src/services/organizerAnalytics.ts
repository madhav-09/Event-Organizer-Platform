import api from "./api";

/* ================= EVENTS ================= */

export const getOrganizerEvents = async () => {
  const res = await api.get("/organizers/me/events");
  return res.data;
};

/* ================= KPI OVERVIEW ================= */

export const getAnalyticsOverview = async (eventId: string) => {
  const res = await api.get(
    `/organizers/me/analytics/overview?event_id=${eventId}`
  );
  return res.data;
};

/* ================= CHARTS ================= */

export const getRegistrationsTrend = async (eventId: string) => {
  const res = await api.get(
    `/organizers/me/analytics/registrations?event_id=${eventId}`
  );
  return res.data;
};

export const getRevenueTrend = async (eventId: string) => {
  const res = await api.get(
    `/organizers/me/analytics/revenue?event_id=${eventId}`
  );
  return res.data;
};

export const getTicketDistribution = async (eventId: string) => {
  const res = await api.get(
    `/organizers/me/analytics/tickets?event_id=${eventId}`
  );
  return res.data;
};

export const getCheckinDistribution = async (eventId: string) => {
  const res = await api.get(
    `/organizers/me/analytics/checkin?event_id=${eventId}`
  );
  return res.data;
};

/* ===== RECENT BOOKINGS ===== */
export const getRecentBookings = async () => {
  const res = await api.get("/organizers/me/analytics/recent-bookings");
  return res.data;
};