import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const statusStyle: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
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

  if (loading) {
    return <p className="p-6">Loading bookings...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">Event Bookings</h1>
      </div>

      {!bookings.length ? (
        <p className="text-gray-500">No bookings yet</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                {[
                  "User",
                  "Email",
                  "Ticket",
                  "Quantity",
                  "Status",
                  "Booked On",
                ].map((h) => (
                  <th key={h} className="px-5 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.booking_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {b.user.name}
                  </td>

                  <td className="px-5 py-4">
                    {b.user.email}
                  </td>

                  <td className="px-5 py-4">
                    {b.ticket}
                  </td>

                  <td className="px-5 py-4">
                    {b.quantity}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
