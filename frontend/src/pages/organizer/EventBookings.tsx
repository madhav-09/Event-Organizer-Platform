import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Calendar, User, Mail, Hash, CheckCircle2, Clock } from "lucide-react";
import { getEventBookings } from "../../services/api";

interface EventBooking {
  booking_id: string;
  user: {
    name: string;
    email: string;
  };
  ticket: string;
  quantity: number;
  status: "CONFIRMED" | "PENDING";
  created_at: string;
}

const statusStyle: Record<string, { bg: string, text: string, icon: JSX.Element }> = {
  CONFIRMED: {
    bg: 'rgba(16,185,129,0.1)',
    text: '#6ee7b7',
    icon: <CheckCircle2 className="w-3 h-3" />
  },
  PENDING: {
    bg: 'rgba(245,158,11,0.1)',
    text: '#fcd34d',
    icon: <Clock className="w-3 h-3" />
  },
};

export default function EventBookings() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    getEventBookings(eventId)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <div className="min-h-screen space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="font-heading font-black text-2xl text-white">Event Bookings</h1>
            </div>
            <p className="text-slate-500 text-sm pl-12">Manage and track all participant registrations</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            <p className="text-sm">Loading bookings...</p>
          </div>
        ) : !bookings.length ? (
          <div className="glass-card rounded-2xl py-20 text-center">
            <Ticket className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-white font-heading font-bold text-xl mb-2">No bookings yet</h3>
            <p className="text-slate-500 text-sm">When participants book tickets, they'll appear here.</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden shadow-glow">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{bookings.length} Total Registrations</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {[
                      { label: "User", icon: <User className="w-3 h-3" /> },
                      { label: "Email", icon: <Mail className="w-3 h-3" /> },
                      { label: "Ticket", icon: <Ticket className="w-3 h-3" /> },
                      { label: "Qty", icon: <Hash className="w-3 h-3" /> },
                      { label: "Status", icon: null },
                      { label: "Booked On", icon: <Calendar className="w-3 h-3" /> },
                    ].map((h) => (
                      <th key={h.label} className="px-5 py-4 text-left">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {h.icon}
                          {h.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((b, i) => (
                    <tr
                      key={b.booking_id}
                      className="hover:bg-white/3 transition-colors duration-150"
                      style={{ borderBottom: i < bookings.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <td className="px-5 py-4 font-bold text-white">
                        {b.user.name}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {b.user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-300 text-xs font-medium border border-brand-500/20">
                          {b.ticket}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-white font-medium">
                        {b.quantity}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            background: statusStyle[b.status]?.bg || 'rgba(255,255,255,0.05)',
                            color: statusStyle[b.status]?.text || '#94a3b8'
                          }}
                        >
                          {statusStyle[b.status]?.icon}
                          {b.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {new Date(b.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
