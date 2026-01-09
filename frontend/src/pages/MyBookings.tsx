import { useEffect, useState } from "react";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { getMyBookings } from "../services/api";

interface Booking {
  booking_id: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
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
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading bookings...</p>;

  if (!bookings.length)
    return <p className="p-6 text-gray-500">No bookings found</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>

      {bookings.map((b) => (
        <div
          key={b.booking_id}
          className="border rounded-xl p-5 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold">{b.event.title}</h2>
            <span
              className={`px-3 py-1 text-xs rounded-full ${statusStyles[b.status]}`}
            >
              {b.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar size={16} />{" "}
              {new Date(b.event.date).toLocaleString()}
            </span>

            <span className="flex items-center gap-1">
              <MapPin size={16} /> {b.event.location}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Ticket size={16} />
            <span>{b.ticket.title}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span>Quantity: {b.quantity}</span>
            <span className="font-semibold">
              ₹{b.total_amount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
