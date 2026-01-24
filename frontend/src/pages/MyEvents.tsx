import { useEffect, useState } from "react";
import { FaEye, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getMyEvents } from "../services/api";

interface OrganizerEvent {
  event_id: string;
  title: string;
  date: string;
  location: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  total_bookings: number;
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PUBLISHED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function MyEvents() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading events...</p>;
  if (!events.length)
    return <p className="p-6 text-gray-500">No events created yet</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Events</h1>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              {[
                "Event Title",
                "Date & Time",
                "Location",
                "Status",
                "Bookings",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-5 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {events.map((e) => (
              <tr
                key={e.event_id}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-5 py-4 font-medium">{e.title}</td>

                <td className="px-5 py-4">
                  {new Date(e.date).toLocaleString()}
                </td>

                <td className="px-5 py-4">{e.location}</td>

                <td className="px-5 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[e.status]}`}
                  >
                    {e.status}
                  </span>
                </td>

                <td className="px-5 py-4">{e.total_bookings}</td>

                <td className="px-5 py-4">
                  <div className="flex gap-4">
                    <button
                      title="Manage Event"
                      onClick={() =>
                        navigate(`/organizer/events/${e.event_id}`)
                      }
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FaEye />
                    </button>

                    <button
                      title="Edit Event"
                      onClick={() =>
                        navigate(`/organizer/events/${e.event_id}/edit`)
                      }
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
