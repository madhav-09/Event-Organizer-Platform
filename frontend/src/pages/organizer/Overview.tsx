import { useEffect, useState } from "react";
import { Calendar, Users, IndianRupee, CheckCircle, TrendingUp, Activity } from "lucide-react";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
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

type Event = { event_id: string; title: string; date: string; location: string };
type OverviewStats = { total_events: number; registrations: number; revenue: number; checked_in: number; not_checked_in: number };
type RecentBooking = { user: { name: string; email: string }; event: string; quantity: number; amount: number; status: string; created_at: string };

const KPI_CONFIG = [
  { key: "total_events" as const, label: "Total Events", icon: Calendar, accent: "rgba(108,71,236,0.15)", border: "rgba(108,71,236,0.25)", color: "#c4b5fd" },
  { key: "registrations" as const, label: "Registrations", icon: Users, accent: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.25)", color: "#93c5fd" },
  { key: "revenue" as const, label: "Revenue", icon: IndianRupee, accent: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.25)", color: "#fcd34d" },
  { key: "checked_in" as const, label: "Checked In", icon: CheckCircle, accent: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.25)", color: "#6ee7b7" },
  { key: "not_checked_in" as const, label: "Pending", icon: Users, accent: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.22)", color: "#fca5a5" },
];

const CHART_TOOLTIP = {
  contentStyle: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
  },
};

const COLORS = ["#6c47ec", "#4f46e5", "#3b82f6", "#10b981"];

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

  useEffect(() => {
    getOrganizerEvents().then(setEvents);
    getRecentBookings().then(setRecentBookings);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAnalyticsOverview(selectedEvent),
      getRegistrationsTrend(selectedEvent),
      getRevenueTrend(selectedEvent),
      getTicketDistribution(selectedEvent),
      getCheckinDistribution(selectedEvent),
    ]).then(([overview, registrations, revenue, tickets, checkins]) => {
      setStats(overview);
      setRegistrationsTrend(registrations);
      setRevenueTrend(revenue);
      setTicketData(tickets.map((t: any) => ({ name: t._id, value: t.count })));
      setCheckinData([
        { name: "Checked In", value: checkins.checked_in },
        { name: "Not Checked In", value: checkins.not_checked_in },
      ]);
    }).finally(() => setLoading(false));
  }, [selectedEvent]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-2xl text-[var(--text-primary)]">Dashboard Overview</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">Monitor registrations, revenue, and check-ins</p>
      </div>

      {/* Event filter */}
      <div className="glass-card rounded-2xl px-5 py-4">
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
          Filter by Event
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="input-glass w-full md:w-[420px] text-sm py-2.5"
          style={{ '--tw-ring-color': 'rgba(108,71,236,0.5)' } as React.CSSProperties}
        >
          <option value="ALL" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Events</option>
          {events.map((e) => (
            <option key={e.event_id} value={e.event_id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              {e.title} • {new Date(e.date).toLocaleDateString()} • {e.location}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPI_CONFIG.map(({ key, label, icon: Icon, accent, border, color }) => {
          const val = stats?.[key];
          const display = key === "revenue" && val != null ? `₹${val}` : val;
          return (
            <div key={key} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ background: accent, border: `1px solid ${border}` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-black text-[var(--text-primary)] font-heading">{loading ? "—" : display}</p>
            </div>
          );
        })}
      </div>

      {/* Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 h-72">
          <h3 className="font-heading font-semibold text-[var(--text-primary)] text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" /> Registrations Trend
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrationsTrend}>
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Line type="monotone" dataKey="count" stroke="#6c47ec" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6 h-72">
          <h3 className="font-heading font-semibold text-[var(--text-primary)] text-sm mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-400" /> Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend}>
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v}`} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: "Ticket Distribution", data: ticketData },
          { title: "Check-in Status", data: checkinData },
        ].map(({ title, data }) => (
          <div key={title} className="glass-card rounded-2xl p-6 h-72">
            <h3 className="font-heading font-semibold text-[var(--text-primary)] text-sm mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP.contentStyle} />
                <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--glass-border)' }}>
          <Activity className="w-4 h-4 text-brand-400" />
          <h3 className="font-heading font-bold text-[var(--text-primary)]">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {["User", "Event", "Qty", "Amount", "Status", "Date"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[var(--text-secondary)] text-sm">No recent bookings found</td>
                </tr>
              )}
              {recentBookings.map((b, i) => (
                <tr key={i} className="transition-colors hover:bg-[var(--glass-hover)]"
                  style={{ borderBottom: i < recentBookings.length - 1 ? '1px solid var(--glass-border)' : undefined }}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[var(--text-primary)] text-sm">{b.user.name}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{b.user.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)] text-sm">{b.event}</td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)] text-sm">{b.quantity}</td>
                  <td className="px-5 py-3.5 font-bold text-brand-300 text-sm">₹{b.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${b.status === "CONFIRMED" ? "text-emerald-400" : "text-amber-400"
                      }`} style={{ background: 'var(--glass-hover)' }}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-muted)] text-xs">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
