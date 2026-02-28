import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Search,
  Eye,
  Send,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
  Users,
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

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
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
    setLoading(true);
    setError(null);
    const params: Record<string, string | number> = {
      skip: page * limit,
      limit,
    };
    if (statusFilter) params.status = statusFilter;
    if (searchQuery) params.q = searchQuery;

    api
      .get("/admin/events", { params })
      .then((res) => {
        setEvents(res.data?.events ?? []);
        setTotal(res.data?.total ?? 0);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.detail ||
          (typeof err?.response?.data === "string" ? err.response.data : null) ||
          "Failed to load events";
        setError(Array.isArray(msg) ? msg[0]?.msg : msg);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [page, statusFilter, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setPage(0);
  };

  const publish = async (id: string) => {
    setActionId(id);
    try {
      await api.put(`/admin/events/${id}/publish`);
      setEvents((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: "PUBLISHED" as const } : e))
      );
      toast.success("Event published");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to publish");
    } finally {
      setActionId(null);
    }
  };

  const unpublish = async (id: string) => {
    setActionId(id);
    try {
      await api.put(`/admin/events/${id}/unpublish`);
      setEvents((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: "DRAFT" as const } : e))
      );
      toast.success("Event unpublished");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to unpublish");
    } finally {
      setActionId(null);
    }
  };

  const cancel = async (id: string) => {
    if (!window.confirm("Cancel this event? It will no longer be visible to users.")) return;
    setActionId(id);
    try {
      await api.put(`/admin/events/${id}/cancel`);
      setEvents((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: "CANCELLED" as const } : e))
      );
      toast.success("Event cancelled");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to cancel");
    } finally {
      setActionId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Events</h2>
        <span className="text-gray-500 text-sm">
          {total} event{total !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, city, category, venue..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchEvents}
            className="mt-3 text-sm font-medium text-red-600 underline"
          >
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No events found</p>
          {(searchQuery || statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchInput("");
                setStatusFilter("");
                setPage(0);
              }}
              className="mt-2 text-sm text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow-md rounded-xl border border-gray-200">
          <table className="min-w-full table-fixed">
              <thead className="bg-gray-50">
  <tr>
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
      Event
    </th>

    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
      Date
    </th>

    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
      Location
    </th>

    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
      Status
    </th>

    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
      Bookings
    </th>

    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
      Revenue
    </th>

    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-[220px]">
      Actions
    </th>
  </tr>
</thead>
              <tbody>
                {events.map((e) => (
                  <tr
                    key={e._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      e.status === "CANCELLED" ? "bg-red-50/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {e.banner_url ? (
                          <img
                            src={e.banner_url}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">
  {e.title}
</p>
                          {e.category && (
                            <p className="text-xs text-gray-500">{e.category}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {e.organizer_name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="text-gray-900">{formatDate(e.start_date)}</p>
                      {(e.city || e.venue) && (
                        <p className="text-xs text-gray-500 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {[e.venue, e.city].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          e.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-800"
                            : e.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        {e.bookings_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(e.revenue)}
                    </td>
                    <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-nowrap overflow-x-auto">
                        <Link
                          to={`/event/${e._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        {e.status === "DRAFT" && (
                          <button
                            onClick={() => publish(e._id)}
                            disabled={actionId !== null}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {actionId === e._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}{" "}
                            Publish
                          </button>
                        )}
                        {e.status === "PUBLISHED" && (
                          <button
                            onClick={() => unpublish(e._id)}
                            disabled={actionId !== null}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                          >
                            Unpublish
                          </button>
                        )}
                        {e.status !== "CANCELLED" && (
                          <button
                            onClick={() => cancel(e._id)}
                            disabled={actionId !== null}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
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
