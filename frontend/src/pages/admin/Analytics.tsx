import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Calendar, Users, UserCheck, Ticket, IndianRupee, TrendingUp,
  Loader2, AlertCircle, Activity, BarChart3,
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
type TopEvent = { event_id: string; title: string; city: string; tickets_sold: number; revenue: number; bookings_count: number };
type RecentItem = { booking_id: string; event_title: string; user_name: string; quantity: number; amount: number; status: string; created_at: string };
type StatusCount = { status: string; count: number };

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "#22c55e",
  PENDING: "#f59e0b",
  CANCELLED: "#ef4444",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}

function timeAgo(iso: string) {
  if (!iso) return "";
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return formatDate(iso);
}

const KPI_CONFIG = [
  { key: "total_events" as const, label: "Events", icon: Calendar, accent: "rgba(108,71,236,0.2)", border: "rgba(108,71,236,0.3)", text: "#c4b5fd" },
  { key: "total_users" as const, label: "Users", icon: Users, accent: "rgba(59,130,246,0.2)", border: "rgba(59,130,246,0.3)", text: "#93c5fd" },
  { key: "total_organizers" as const, label: "Organizers", icon: UserCheck, accent: "rgba(139,92,246,0.2)", border: "rgba(139,92,246,0.3)", text: "#c4b5fd" },
  { key: "total_bookings" as const, label: "Bookings", icon: Ticket, accent: "rgba(16,185,129,0.2)", border: "rgba(16,185,129,0.3)", text: "#6ee7b7" },
  { key: "total_revenue" as const, label: "Revenue", icon: IndianRupee, accent: "rgba(245,158,11,0.2)", border: "rgba(245,158,11,0.3)", text: "#fcd34d" },
];

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(18,24,39,0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#e2e8f0',
  },
  labelStyle: { color: '#94a3b8' },
};

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
    setLoading(true); setError(null);
    Promise.all([
      api.get("/admin/analytics/overview"),
      api.get("/admin/analytics/revenue-trend", { params: { days: trendDays } }),
      api.get("/admin/analytics/top-events", { params: { limit: 10 } }),
      api.get("/admin/analytics/recent-activity", { params: { limit: 10 } }),
      api.get("/admin/analytics/bookings-by-status"),
    ]).then(([o, t, te, r, s]) => {
      if (cancelled) return;
      setOverview(o.data);
      setTrend(Array.isArray(t.data) ? t.data : []);
      setTopEvents(Array.isArray(te.data) ? te.data : []);
      setRecent(Array.isArray(r.data) ? r.data : []);
      setByStatus(Array.isArray(s.data) ? s.data : []);
    }).catch((err) => {
      if (!cancelled) setError(err?.response?.data?.detail || "Failed to load analytics");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [trendDays]);

  if (loading && !overview) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-10 h-10 animate-spin text-brand-400" />
    </div>
  );

  if (error && !overview) return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-red-400">{error}</p>
    </div>
  );

  const stats = overview!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.25)' }}>
            <BarChart3 className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-white text-xl">Analytics Dashboard</h2>
            <p className="text-slate-500 text-sm">Platform-wide performance overview</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setTrendDays(d)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${trendDays === d ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              style={{
                background: trendDays === d ? "rgba(108,71,236,0.4)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${trendDays === d ? "rgba(108,71,236,0.5)" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              Last {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPI_CONFIG.map(({ key, label, icon: Icon, accent, border, text }) => {
          const val = stats[key];
          const display = key === "total_revenue" ? formatCurrency(val) : val.toLocaleString();
          return (
            <div key={key} className="glass-card rounded-2xl p-5 animate-fade-up" style={{ animationFillMode: 'both' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: accent, border: `1px solid ${border}` }}>
                  <Icon className="w-4 h-4" style={{ color: text }} />
                </div>
              </div>
              <p className="text-2xl font-black text-white font-heading">{display}</p>
            </div>
          );
        })}
      </div>

      {/* Booking status summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: stats.pending_bookings, accent: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.25)", color: "#fcd34d" },
          { label: "Confirmed", value: stats.confirmed_bookings, accent: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.25)", color: "#6ee7b7" },
          { label: "Cancelled", value: stats.cancelled_bookings, accent: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.25)", color: "#fca5a5" },
        ].map(({ label, value, accent, border, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: accent, border: `1px solid ${border}` }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-black font-heading" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue trend */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-heading font-bold text-white text-base mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            Revenue Trend
          </h3>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${v / 1000}k`} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value: number) => [formatCurrency(value), "Revenue"]} labelFormatter={formatDate} />
                <Line type="monotone" dataKey="revenue" stroke="#6c47ec" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-slate-500 text-sm">No revenue data in this period</div>
          )}
        </div>

        {/* Status pie */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-heading font-bold text-white text-base mb-5">Bookings by Status</h3>
          {byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90}
                  label={({ status, count }) => `${status}: ${count}`}>
                  {byStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, "Bookings"]} contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-slate-500 text-sm">No booking data</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top events */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-heading font-bold text-white text-base mb-5">Top Events by Revenue</h3>
          {topEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <th className="text-left py-2.5 text-xs font-semibold text-slate-500 uppercase">Event</th>
                    <th className="text-right py-2.5 text-xs font-semibold text-slate-500 uppercase">Tickets</th>
                    <th className="text-right py-2.5 text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topEvents.map((e, i) => (
                    <tr key={e.event_id} style={{ borderBottom: i < topEvents.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                      <td className="py-3">
                        <p className="font-medium text-white">{e.title}</p>
                        {e.city && <p className="text-xs text-slate-500">{e.city}</p>}
                      </td>
                      <td className="text-right py-3 text-slate-300">{e.tickets_sold}</td>
                      <td className="text-right py-3 font-bold text-brand-300">{formatCurrency(e.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500 text-sm">No events with bookings yet</div>
          )}
        </div>

        {/* Recent activity */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-heading font-bold text-white text-base mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" />
            Recent Activity
          </h3>
          {recent.length > 0 ? (
            <ul className="space-y-3">
              {recent.map((r) => (
                <li key={r.booking_id} className="flex justify-between items-start gap-3 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p className="font-medium text-white text-sm">{r.event_title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {r.user_name} · {r.quantity} ticket{r.quantity !== 1 ? "s" : ""} · {formatCurrency(r.amount)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${r.status === "CONFIRMED" ? "text-emerald-400" : r.status === "PENDING" ? "text-amber-400" : "text-red-400"
                      }`} style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {r.status}
                    </span>
                    <p className="text-xs text-slate-600 mt-1">{timeAgo(r.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center text-slate-500 text-sm">No recent bookings</div>
          )}
        </div>
      </div>
    </div>
  );
}
