import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaUsers,
  FaRupeeSign,
  FaCheckCircle,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getOrganizerEvents,
  getAnalyticsOverview,
  getRegistrationsTrend,
  getRevenueTrend,
  getTicketDistribution,
  getCheckinDistribution,
  getRecentBookings,
} from "../../services/organizerAnalytics";

/* ================= TYPES ================= */

type Event = {
  event_id: string;
  title: string;
  date: string;
  location: string;
};

type OverviewStats = {
  total_events: number;
  registrations: number;
  revenue: number;
  checked_in: number;
  not_checked_in: number;
};

type RecentBooking = {
  user: {
    name: string;
    email: string;
  };
  event: string;
  quantity: number;
  amount: number;
  status: string;
  created_at: string;
};

/* ================= COMPONENT ================= */

const Overview = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("ALL");

  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [registrationsTrend, setRegistrationsTrend] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [checkinData, setCheckinData] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  /* ===== Load events ===== */
  useEffect(() => {
    getOrganizerEvents().then(setEvents);
    getRecentBookings().then(setRecentBookings);
  }, []);

  /* ===== Load analytics when event changes ===== */
  useEffect(() => {
    setLoading(true);

    Promise.all([
      getAnalyticsOverview(selectedEvent),
      getRegistrationsTrend(selectedEvent),
      getRevenueTrend(selectedEvent),
      getTicketDistribution(selectedEvent),
      getCheckinDistribution(selectedEvent),
    ])
      .then(
        ([
          overview,
          registrations,
          revenue,
          tickets,
          checkins,
        ]) => {
          setStats(overview);
          setRegistrationsTrend(registrations);
          setRevenueTrend(revenue);
          setTicketData(
            tickets.map((t: any) => ({
              name: t._id,
              value: t.count,
            }))
          );
          setCheckinData([
            { name: "Checked In", value: checkins.checked_in },
            { name: "Not Checked In", value: checkins.not_checked_in },
          ]);
        }
      )
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  return (
    <div className="space-y-10">
      {/* ===== Header ===== */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Monitor registrations, revenue, and check-ins
        </p>
      </div>

      {/* ===== Event Filter ===== */}
      <div className="bg-white border rounded-lg px-6 py-4">
        <label className="text-sm text-gray-600 mb-1 block">
          Select Event
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full md:w-[420px] border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Events</option>
          {events.map((e) => (
            <option key={e.event_id} value={e.event_id}>
              {e.title} • {new Date(e.date).toLocaleDateString()} • {e.location}
            </option>
          ))}
        </select>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard label="Total Events" value={stats?.total_events} loading={loading} icon={<FaCalendarAlt />} />
        <KpiCard label="Registrations" value={stats?.registrations} loading={loading} icon={<FaUsers />} />
        <KpiCard label="Revenue" value={stats ? `₹${stats.revenue}` : undefined} loading={loading} icon={<FaRupeeSign />} />
        <KpiCard label="Checked In" value={stats?.checked_in} loading={loading} icon={<FaCheckCircle />} />
        <KpiCard label="Pending" value={stats?.not_checked_in} loading={loading} icon={<FaUsers />} />
      </div>

      {/* ===== LINE CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartBox title="Registrations Trend" data={registrationsTrend} dataKey="count" />
        <LineChartBox title="Revenue Trend" data={revenueTrend} dataKey="revenue" />
      </div>

      {/* ===== DONUT CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChartBox title="Ticket Distribution" data={ticketData} />
        <DonutChartBox title="Check-in Status" data={checkinData} />
      </div>

      {/* ===== RECENT BOOKINGS TABLE ===== */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Bookings
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Event</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {recentBookings.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.user.name}</div>
                    <div className="text-gray-500 text-xs">{b.user.email}</div>
                  </td>
                  <td className="px-4 py-3">{b.event}</td>
                  <td className="px-4 py-3 text-center">{b.quantity}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    ₹{b.amount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        b.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No recent bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ================= UI COMPONENTS ================= */

const KpiCard = ({
  label,
  value,
  loading,
  icon,
}: {
  label: string;
  value?: number | string;
  loading: boolean;
  icon: JSX.Element;
}) => (
  <div className="bg-white border rounded-lg px-6 py-5 flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">
        {loading ? "—" : value}
      </p>
    </div>
    <div className="text-blue-600 text-xl">{icon}</div>
  </div>
);

const LineChartBox = ({
  title,
  data,
  dataKey,
}: {
  title: string;
  data: any[];
  dataKey: string;
}) => (
  <div className="bg-white border rounded-lg p-5 h-80">
    <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const COLORS = ["#2563eb", "#60a5fa", "#93c5fd", "#bfdbfe"];

const DonutChartBox = ({
  title,
  data,
}: {
  title: string;
  data: any[];
}) => (
  <div className="bg-white border rounded-lg p-5 h-80">
    <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default Overview;
