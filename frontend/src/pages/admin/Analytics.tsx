import { useEffect, useState } from "react";
import api from "../../services/api";
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
  Calendar,
  Users,
  UserCheck,
  Ticket,
  IndianRupee,
  TrendingUp,
  Loader2,
  AlertCircle,
  Activity,
} from "lucide-react";

type Overview = {
  total_events: number;
  total_users: number;
  total_organizers: number;
  total_bookings: number;
  total_revenue: number;
  pending_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
};

type TrendPoint = { date: string; revenue: number; count: number };

type TopEvent = {
  event_id: string;
  title: string;
  city: string;
  tickets_sold: number;
  revenue: number;
  bookings_count: number;
};

type RecentItem = {
  booking_id: string;
  event_title: string;
  user_name: string;
  user_email: string;
  quantity: number;
  amount: number;
  status: string;
  created_at: string;
};

type StatusCount = { status: string; count: number };

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "#22c55e",
  PENDING: "#eab308",
  CANCELLED: "#ef4444",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return "Just now";
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
    return formatDate(iso);
  } catch {
    return iso;
  }
}

export default function Analytics() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [byStatus, setByStatus] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendDays, setTrendDays] = useState(30);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overviewRes, trendRes, topRes, recentRes, statusRes] = await Promise.all([
          api.get("/admin/analytics/overview"),
          api.get("/admin/analytics/revenue-trend", { params: { days: trendDays } }),
          api.get("/admin/analytics/top-events", { params: { limit: 10 } }),
          api.get("/admin/analytics/recent-activity", { params: { limit: 10 } }),
          api.get("/admin/analytics/bookings-by-status"),
        ]);

        if (cancelled) return;

        setOverview(overviewRes.data);
        setTrend(Array.isArray(trendRes.data) ? trendRes.data : []);
        setTopEvents(Array.isArray(topRes.data) ? topRes.data : []);
        setRecent(Array.isArray(recentRes.data) ? recentRes.data : []);
        setByStatus(Array.isArray(statusRes.data) ? statusRes.data : []);
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            "Failed to load analytics";
          setError(Array.isArray(msg) ? msg[0]?.msg : msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [trendDays]);

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const stats = overview || {
    total_events: 0,
    total_users: 0,
    total_organizers: 0,
    total_bookings: 0,
    total_revenue: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    cancelled_bookings: 0,
  };

  const kpis = [
    { label: "Total Events", value: stats.total_events, icon: Calendar, color: "indigo" },
    { label: "Total Users", value: stats.total_users, icon: Users, color: "blue" },
    { label: "Organizers", value: stats.total_organizers, icon: UserCheck, color: "violet" },
    { label: "Total Bookings", value: stats.total_bookings, icon: Ticket, color: "emerald" },
    { label: "Revenue", value: formatCurrency(stats.total_revenue), icon: IndianRupee, color: "amber" },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    violet: "bg-violet-100 text-violet-800 border-violet-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setTrendDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                trendDays === d
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Last {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className={`rounded-xl border p-5 ${colorMap[color]} bg-white border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{label}</span>
              <Icon className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
        ))}
      </div>

      {/* Booking status summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
          <p className="text-xs font-medium text-amber-800">Pending</p>
          <p className="text-xl font-bold text-amber-900">{stats.pending_bookings}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
          <p className="text-xs font-medium text-emerald-800">Confirmed</p>
          <p className="text-xl font-bold text-emerald-900">{stats.confirmed_bookings}</p>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
          <p className="text-xs font-medium text-red-800">Cancelled</p>
          <p className="text-xl font-bold text-red-900">{stats.cancelled_bookings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue trend
          </h3>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 py-12 text-center">No revenue data in this period</p>
          )}
        </div>

        {/* Bookings by status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bookings by status</h3>
          {byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {byStatus.map((entry, i) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, "Bookings"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 py-12 text-center">No booking data</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top events */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top events by revenue</h3>
          {topEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Event</th>
                    <th className="text-right py-2 font-medium text-gray-600">Tickets</th>
                    <th className="text-right py-2 font-medium text-gray-600">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topEvents.map((e) => (
                    <tr key={e.event_id} className="border-b border-gray-100">
                      <td className="py-2">
                        <p className="font-medium text-gray-900">{e.title}</p>
                        {e.city && <p className="text-xs text-gray-500">{e.city}</p>}
                      </td>
                      <td className="text-right py-2">{e.tickets_sold}</td>
                      <td className="text-right py-2 font-medium">{formatCurrency(e.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-8 text-center">No events with bookings yet</p>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent activity
          </h3>
          {recent.length > 0 ? (
            <ul className="space-y-3">
              {recent.map((r) => (
                <li
                  key={r.booking_id}
                  className="flex justify-between items-start gap-3 py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{r.event_title}</p>
                    <p className="text-xs text-gray-500">
                      {r.user_name} · {r.quantity} ticket{r.quantity !== 1 ? "s" : ""} ·{" "}
                      {formatCurrency(r.amount)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        r.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {r.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(r.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-8 text-center">No recent bookings</p>
          )}
        </div>
      </div>
    </div>
  );
}
