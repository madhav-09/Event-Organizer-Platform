import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Calendar, MapPin, Search, Eye, Send, XCircle, FileText,
  Loader2, AlertCircle, Users, CalendarDays,
} from "lucide-react";

type Event = {
  _id: string;
  id: string;
  title: string;
  category: string;
  city: string;
  venue: string;
  start_date: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  banner_url?: string;
  organizer_name: string;
  bookings_count: number;
  revenue: number;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: "text-emerald-400 border-emerald-500/30",
  DRAFT: "text-amber-400 border-amber-500/30",
  CANCELLED: "text-red-400 border-red-500/30",
};

function formatDate(iso: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const limit = 15;

  const fetchEvents = () => {
    setLoading(true); setError(null);
    const params: Record<string, string | number> = { skip: page * limit, limit };
    if (statusFilter) params.status = statusFilter;
    if (searchQuery) params.q = searchQuery;
    api.get("/admin/events", { params })
      .then((res) => { setEvents(res.data?.events ?? []); setTotal(res.data?.total ?? 0); })
      .catch((err) => {
        const msg = err?.response?.data?.detail || "Failed to load events";
        setError(Array.isArray(msg) ? msg[0]?.msg : msg);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [page, statusFilter, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setPage(0);
  };

  const publish = async (id: string) => {
    setActionId(id);
    try {
      await api.put(`/admin/events/${id}/publish`);
      setEvents(prev => prev.map(e => e._id === id ? { ...e, status: "PUBLISHED" as const } : e));
      toast.success("Event published");
    } catch { toast.error("Failed to publish"); }
    finally { setActionId(null); }
  };

  const unpublish = async (id: string) => {
    setActionId(id);
    try {
      await api.put(`/admin/events/${id}/unpublish`);
      setEvents(prev => prev.map(e => e._id === id ? { ...e, status: "DRAFT" as const } : e));
      toast.success("Event unpublished");
    } catch { toast.error("Failed to unpublish"); }
    finally { setActionId(null); }
  };

  const cancel = async (id: string) => {
    if (!window.confirm("Cancel this event?")) return;
    setActionId(id);
    try {
      await api.put(`/admin/events/${id}/cancel`);
      setEvents(prev => prev.map(e => e._id === id ? { ...e, status: "CANCELLED" as const } : e));
      toast.success("Event cancelled");
    } catch { toast.error("Failed to cancel"); }
    finally { setActionId(null); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.25)' }}>
            <CalendarDays className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-white text-xl">Events</h2>
            <p className="text-slate-500 text-sm">{total} event{total !== 1 ? "s" : ""} total</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, city, organizer..."
              className="input-glass pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="input-glass px-3 py-2.5 text-sm"
              style={{ minWidth: '140px' }}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value || "all"} value={o.value} style={{ background: '#0b0f1a' }}>{o.label}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        </div>
      ) : error ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={fetchEvents} className="text-sm text-brand-400 hover:text-brand-300 underline">Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-3">No events found</p>
          {(searchQuery || statusFilter) && (
            <button
              onClick={() => { setSearchQuery(""); setSearchInput(""); setStatusFilter(""); setPage(0); }}
              className="text-sm text-brand-400 hover:text-brand-300"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {["Event", "Organizer", "Date / Location", "Status", "Bookings", "Revenue", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((e, i) => {
                    const isActing = actionId === e._id;
                    const badge = STATUS_BADGE[e.status] ?? STATUS_BADGE.DRAFT;
                    return (
                      <tr
                        key={e._id}
                        className="transition-colors hover:bg-white/3"
                        style={{ borderBottom: i < events.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
                      >
                        {/* Event */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {e.banner_url ? (
                              <img src={e.banner_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.2)' }}>
                                <Calendar className="w-4 h-4 text-brand-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate max-w-[160px]">{e.title}</p>
                              {e.category && <p className="text-slate-500 text-xs">{e.category}</p>}
                            </div>
                          </div>
                        </td>
                        {/* Organizer */}
                        <td className="px-4 py-3.5 text-sm text-slate-400 max-w-[120px] truncate">{e.organizer_name}</td>
                        {/* Date/Location */}
                        <td className="px-4 py-3.5">
                          <p className="text-slate-300 text-sm">{formatDate(e.start_date)}</p>
                          {(e.city || e.venue) && (
                            <p className="text-slate-500 text-xs flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {[e.venue, e.city].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge}`}
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {e.status}
                          </span>
                        </td>
                        {/* Bookings */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {e.bookings_count}
                          </span>
                        </td>
                        {/* Revenue */}
                        <td className="px-4 py-3.5 font-bold text-brand-300 text-sm">
                          {formatCurrency(e.revenue)}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/event/${e._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand-300 transition-colors"
                              style={{ background: 'rgba(108,71,236,0.1)', border: '1px solid rgba(108,71,236,0.2)' }}
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                            {e.status === "DRAFT" && (
                              <button
                                onClick={() => publish(e._id)}
                                disabled={!!actionId}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                                style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
                              >
                                {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                Publish
                              </button>
                            )}
                            {e.status === "PUBLISHED" && (
                              <button
                                onClick={() => unpublish(e._id)}
                                disabled={!!actionId}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                                style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)' }}
                              >
                                {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                Unpublish
                              </button>
                            )}
                            {e.status !== "CANCELLED" && (
                              <button
                                onClick={() => cancel(e._id)}
                                disabled={!!actionId}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 disabled:opacity-50"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                              >
                                <XCircle className="w-3 h-3" /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 disabled:opacity-30 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 disabled:opacity-30 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
