import { useParams } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Users, Tag, Info, Heart, ChevronUp, ChevronDown, CheckCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getMyWishlist, addToWishlist, removeFromWishlist } from "../services/api";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme?: { color?: string };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface Ticket {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  sold: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  venue: string;
  start_date: string;
  end_date: string;
  banner_url: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, ticketRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/tickets/event/${id}`),
        ]);
        setEvent(eventRes.data);
        setTickets(ticketRes.data);
      } catch {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (user && event) {
      getMyWishlist()
        .then((data) => setIsWishlisted(data.some((e: any) => String(e.id) === String(event._id))))
        .catch(console.error);
    }
  }, [user, event]);

  const handleToggleWishlist = async () => {
    if (!user) { toast.error("Please login to save events"); return; }
    if (!event) return;
    const cur = isWishlisted;
    setIsWishlisted(!cur);
    try {
      if (cur) { await removeFromWishlist(event._id); toast.success("Removed from wishlist"); }
      else { await addToWishlist(event._id); toast.success("Added to wishlist"); }
    } catch {
      setIsWishlisted(cur);
      toast.error("Failed to update wishlist");
    }
  };

  const handleCheckout = async () => {
    if (!selectedTicket) return;
    const available = selectedTicket.quantity - selectedTicket.sold;
    if (quantity < 1 || quantity > available) return;
    try {
      setProcessing(true);
      const bookingRes = await api.post("/bookings/", {
        event_id: String(event!._id),
        ticket_id: String(selectedTicket._id),
        quantity,
      });
      const bookingId = bookingRes.data.booking_id;
      const orderRes = await api.post(`/payments/create-order/${bookingId}`);
      const { order_id, key, amount } = orderRes.data;
      const options: RazorpayOptions = {
        key, amount, currency: "INR",
        name: "Event Organizer",
        description: event!.title,
        order_id,
        handler: async (response) => {
          await api.post("/payments/verify", {
            booking_id: bookingId,
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          toast.success("Payment successful! Ticket sent to your email.");
        },
        theme: { color: "#6c47ec" },
      };
      new window.Razorpay(options).open();
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    const avail = ticket.quantity - ticket.sold;
    setQuantity((q) => (q > avail ? Math.max(1, avail) : q));
  };

  const available = selectedTicket ? selectedTicket.quantity - selectedTicket.sold : 0;
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="h-64 sm:h-96 shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-2/3 rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-4 w-full rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-4 w-full rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-red-400">{error || "Event not found"}</p>
      </div>
    );
  }

  const date = new Date(event.start_date).toDateString();
  const time = new Date(event.start_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const totalAttending = tickets.reduce((a, b) => a + b.sold, 0);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero Banner */}
      <div className="relative h-56 sm:h-80 md:h-[480px] overflow-hidden">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 to-indigo-900 opacity-60" />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-6 left-4 sm:bottom-10 sm:left-10 right-16 sm:right-20">
          <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold text-white mb-3"
            style={{ background: 'rgba(108,71,236,0.85)', border: '1px solid rgba(108,71,236,0.4)' }}>
            {event.category}
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-white leading-tight mb-3 text-shadow-lg">
            {event.title}
          </h1>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Users className="w-4 h-4 text-brand-300" />
            <span>{totalAttending} attending</span>
          </div>
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-5 right-5 sm:top-8 sm:right-8 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{
            background: isWishlisted ? "rgba(239,68,68,0.25)" : "rgba(0,0,0,0.4)",
            border: `1px solid ${isWishlisted ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)"}`,
            backdropFilter: "blur(12px)",
          }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-5 h-5 transition-all ${isWishlisted ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6 lg:gap-8 px-4 sm:px-6 py-8">
        {/* Left — Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Meta */}
          <div className="glass-card rounded-2xl p-6 animate-fade-up" style={{ animationFillMode: 'both' }}>
            <h2 className="font-heading font-bold text-white text-xl mb-5">Event Details</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Calendar, label: "Date", value: date },
                { icon: Clock, label: "Time", value: time },
                { icon: MapPin, label: "Venue", value: `${event.venue}, ${event.city}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.2)' }}>
                    <Icon className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="glass-card rounded-2xl p-6 animate-fade-up delay-100" style={{ animationFillMode: 'both' }}>
            <h2 className="font-heading font-bold text-white text-xl mb-4">About This Event</h2>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        </div>

        {/* Right — Booking Sidebar */}
        <div className="animate-fade-up delay-200" style={{ animationFillMode: 'both' }}>
          <div className="glass-card rounded-2xl p-5 lg:sticky lg:top-8">
            <h3 className="font-heading font-bold text-white text-lg mb-4">Select Ticket</h3>

            <div className="space-y-2.5 mb-5">
              {tickets.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No tickets available</p>
              )}
              {tickets.map((ticket) => {
                const avail = ticket.quantity - ticket.sold;
                const isSelected = selectedTicket?._id === ticket._id;
                return (
                  <div
                    key={ticket._id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${isSelected
                        ? "border-brand-500/50"
                        : "border-white/8 hover:border-white/15"
                      }`}
                    style={{
                      background: isSelected
                        ? "rgba(108,71,236,0.15)"
                        : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white font-medium text-sm flex items-center gap-2">
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-brand-400" />}
                        {ticket.title}
                      </span>
                      <span className="text-brand-300 font-bold text-sm">₹{ticket.price}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{avail} left</span>
                      {avail < 50 && avail > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Tag className="w-3 h-3" />
                          Selling fast
                        </span>
                      )}
                      {avail === 0 && (
                        <span className="text-red-400">Sold out</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity */}
            {selectedTicket && (
              <div className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-30 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <span className="text-white font-bold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                      disabled={quantity >= available}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-30 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-500 text-xs">{available} tickets available</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <span className="text-slate-400 text-sm">Total</span>
                  <span className="text-white font-bold text-xl">₹{totalPrice}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              disabled={!selectedTicket || processing || quantity < 1 || quantity > available}
              onClick={handleCheckout}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {processing ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                selectedTicket && quantity > 0
                  ? `Proceed to Pay ₹${totalPrice}`
                  : "Select a Ticket"
              )}
            </button>

            {/* Info */}
            <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brand-400" />
              <span>Tickets will be sent to your email after successful payment.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
