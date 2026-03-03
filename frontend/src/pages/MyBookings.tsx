import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, MapPin, Ticket, ExternalLink, AlertCircle, Trash2,
  CheckCircle, Clock, XCircle, ShoppingBag, Loader
} from "lucide-react";
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
  ticket: { id: string; title: string; price: number };
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Payment Pending",
    className: "badge-pending",
    icon: <Clock className="w-3 h-3" />,
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "badge-confirmed",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "badge-cancelled",
    icon: <XCircle className="w-3 h-3" />,
  },
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

function formatTime(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function BookingCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden shimmer h-40"
      style={{ background: 'rgba(255,255,255,0.03)' }} />
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
        if (!cancelled) setError(err?.response?.data?.detail || "Failed to load bookings");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (bookingId: string) => {
    setDeletingId(bookingId);
    setConfirmDeleteId(null);
    try {
      await deleteMyBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
      toast.success("Booking cancelled successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to cancel booking");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.25)' }}>
              <Ticket className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">My Bookings</h1>
              <p className="text-slate-500 text-sm">All your event bookings in one place</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-2xl animate-fade-up" style={{ animationFillMode: 'both' }}>
            <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-5" />
            <h3 className="font-heading font-bold text-xl text-white mb-3">No bookings yet</h3>
            <p className="text-slate-500 text-sm mb-8">Discover and book events near you</p>
            <Link to="/" className="btn-primary mx-auto">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => {
              const statusConfig = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
              const isDeleting = deletingId === booking.booking_id;
              const isPastEvent = new Date(booking.event.date) < new Date();

              return (
                <div
                  key={booking.booking_id}
                  className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 animate-fade-up ${isDeleting ? "opacity-50 scale-98 pointer-events-none" : ""
                    }`}
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Banner */}
                    <div className="relative sm:w-40 h-32 sm:h-auto flex-shrink-0 overflow-hidden bg-surface-700">
                      {booking.event.banner_url ? (
                        <img
                          src={booking.event.banner_url}
                          alt={booking.event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-indigo-900 opacity-50" />
                      )}
                      {isPastEvent && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-xs text-slate-300 font-medium px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(0,0,0,0.6)' }}>Past Event</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className={`${statusConfig.className} inline-flex items-center gap-1.5 mb-2`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                            <Link
                              to={`/event/${booking.event.id}`}
                              className="block font-heading font-bold text-white text-base hover:text-brand-300 transition-colors leading-snug"
                            >
                              {booking.event.title}
                              <ExternalLink className="inline w-3.5 h-3.5 ml-1.5 text-slate-500" />
                            </Link>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-white text-lg">₹{booking.total_amount}</p>
                            <p className="text-slate-500 text-xs">{booking.quantity}× {booking.ticket.title}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-brand-400" />
                            {formatDate(booking.event.date)} at {formatTime(booking.event.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-400" />
                            {booking.event.location}{booking.event.city ? `, ${booking.event.city}` : ""}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      {!isPastEvent && (
                        <div className="mt-4 flex items-center justify-end">
                          {confirmDeleteId === booking.booking_id ? (
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-slate-400">Cancel this booking?</span>
                              <button
                                onClick={() => handleDelete(booking.booking_id)}
                                className="px-3 py-1.5 rounded-lg text-red-400 font-medium"
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                              >
                                Yes, cancel
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-3 py-1.5 rounded-lg text-slate-400"
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                              >
                                Keep
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(booking.booking_id)}
                              disabled={isDeleting}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 transition-colors"
                              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                            >
                              {isDeleting ? (
                                <Loader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
