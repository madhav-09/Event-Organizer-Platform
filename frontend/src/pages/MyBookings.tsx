import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Ticket, ExternalLink, AlertCircle, Trash2 } from "lucide-react";
import { getMyBookings, deleteMyBooking } from "../services/api";
import toast from "react-hot-toast";

interface Booking {
  booking_id: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    city?: string;
    banner_url?: string;
  };
  ticket: {
    id: string;
    title: string;
    price: number;
  };
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const statusLabel: Record<string, string> = {
  PENDING: "Payment Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyBookings()
      .then((data) => {
        if (!cancelled) {
          setBookings(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setBookings([]);
          const msg =
            err?.response?.data?.detail ||
            (typeof err?.response?.data === "string" ? err.response.data : null) ||
            err?.message ||
            "Failed to load bookings";
          setError(Array.isArray(msg) ? msg[0]?.msg || "Failed to load" : msg);
          if (err?.response?.status === 401) {
            toast.error("Please sign in to view your bookings");
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(bookingId);
      await deleteMyBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
      toast.success("Booking deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete booking");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Couldn’t load bookings
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              getMyBookings()
                .then((data) => {
                  setBookings(Array.isArray(data) ? data : []);
                  setError(null);
                })
                .catch(() => setError("Failed to load bookings"))
                .finally(() => setLoading(false));
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4 text-center py-16">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No bookings yet
          </h2>
          <p className="text-gray-600 mb-6">
            When you book events, they’ll show up here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Browse events
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

        <div className="space-y-5">
          {bookings.map((b) => (
            <div
              key={b.booking_id}
              className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative ${deletingId === b.booking_id ? "opacity-50 pointer-events-none" : ""
                }`}
            >
              <div className="flex flex-col sm:flex-row">
                {b.event.banner_url && (
                  <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0">
                    <img
                      src={b.event.banner_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2 pr-8">
                      <Link
                        to={`/event/${b.event.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {b.event.title}
                      </Link>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyles[b.status] ?? "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                      >
                        {statusLabel[b.status] ?? b.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(b.booking_id)}
                      disabled={deletingId === b.booking_id}
                      className="absolute top-5 right-5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete booking"
                    >
                      <Trash2 size={20} />
                    </button>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(b.event.date)}
                        {formatTime(b.event.date) && ` · ${formatTime(b.event.date)}`}
                      </span>
                      {b.event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {b.event.location}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Ticket size={14} />
                      <span>
                        {b.ticket.title} × {b.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-semibold text-gray-900">
                      ₹{Number(b.total_amount).toLocaleString("en-IN")}
                    </span>
                    <Link
                      to={`/event/${b.event.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                    >
                      View event
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
