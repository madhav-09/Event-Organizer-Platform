import { useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
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
  theme?: {
    color?: string;
  };
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await api.get(`/events/${id}`);
        const ticketRes = await api.get(`/tickets/event/${id}`);
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

  if (loading)
    return <p className="text-center py-20">Loading event...</p>;

  if (error || !event)
    return <p className="text-center py-20 text-red-500">{error}</p>;

  const date = new Date(event.start_date).toDateString();
  const time = new Date(event.start_date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCheckout = async () => {
    if (!selectedTicket) return;

    const available = selectedTicket.quantity - selectedTicket.sold;
    if (quantity < 1 || quantity > available) return;

    try {
      setProcessing(true);

      const bookingPayload = {
        event_id: String(event._id),
        ticket_id: String(selectedTicket._id),
        quantity,
      };

      const bookingRes = await api.post(
        "/bookings/",
        bookingPayload
      );

      const bookingId = bookingRes.data.booking_id;

      const orderRes = await api.post(
        `/payments/create-order/${bookingId}`
      );

      const { order_id, key, amount } = orderRes.data;

      const options: RazorpayOptions = {
        key,
        amount,
        currency: "INR",
        name: "Event Organizer",
        description: event.title,
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
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    const available = ticket.quantity - ticket.sold;
    setQuantity((q) => (q > available ? Math.max(1, available) : q));
  };

  const available = selectedTicket ? selectedTicket.quantity - selectedTicket.sold : 0;
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-[400px]">
        <img src={event.banner_url} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute bottom-8 left-8 text-white">
          <span className="bg-blue-600 px-4 py-2 rounded-full">
            {event.category}
          </span>
          <h1 className="text-4xl font-bold mt-4">{event.title}</h1>
          <div className="flex items-center mt-3 space-x-2">
            <Users />
            <span>
              {tickets.reduce((a, b) => a + b.sold, 0)} attending
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 px-6 py-10">
        {/* Left */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-4">Event Details</h2>

          <div className="space-y-4">
            <div className="flex space-x-3">
              <Calendar /> <span>{date}</span>
            </div>
            <div className="flex space-x-3">
              <Clock /> <span>{time}</span>
            </div>
            <div className="flex space-x-3">
              <MapPin />
              <span>
                {event.venue}, {event.city}
              </span>
            </div>
          </div>

          <p className="mt-6 text-gray-700">{event.description}</p>
        </div>

        {/* Right */}
        <div className="bg-white p-6 rounded-xl shadow sticky top-24">
          <h3 className="text-xl font-bold mb-4">Select Ticket</h3>

          <div className="space-y-3">
            {tickets.map((ticket) => {
              const avail = ticket.quantity - ticket.sold;

              return (
                <div
                  key={ticket._id}
                  onClick={() => handleSelectTicket(ticket)}
                  className={`p-4 border rounded-xl cursor-pointer ${
                    selectedTicket?._id === ticket._id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{ticket.title}</span>
                    <span className="font-bold">₹{ticket.price}</span>
                  </div>
                  <div className="text-sm mt-1">
                    {avail} available
                    {avail < 50 && (
                      <span className="text-red-600 ml-2">
                        <Tag className="inline w-4 h-4" /> Selling fast
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTicket && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-lg border border-gray-300 bg-white font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={available}
                    value={quantity}
                    aria-label="Number of tickets"
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) setQuantity(Math.max(1, Math.min(available, v)));
                    }}
                    className="w-14 text-center border border-gray-300 rounded-lg py-1.5 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                    disabled={quantity >= available}
                    className="w-9 h-9 rounded-lg border border-gray-300 bg-white font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {available} tickets left
              </p>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          )}

          <button
            disabled={!selectedTicket || processing || quantity < 1 || quantity > available}
            onClick={handleCheckout}
            className={`w-full mt-6 py-4 rounded-xl font-bold ${
              selectedTicket && quantity >= 1 && quantity <= available
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {processing ? "Processing..." : quantity > 1 ? `Proceed to Pay ₹${totalPrice}` : "Proceed to Checkout"}
          </button>

          <div className="mt-4 flex space-x-2 text-sm text-blue-600">
            <Info />
            <span>Tickets will be emailed after payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
