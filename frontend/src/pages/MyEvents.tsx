import { useEffect, useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { getMyEvents } from "../services/api";

interface OrganizerEvent {
  event_id: string;
  title: string;
  date: string;
  location: string;
  status: string;
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

  useEffect(() => {
    getMyEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading events...</p>;

  if (!events.length)
    return <p className="p-6 text-gray-500">No events created yet</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Events</h1>

      {events.map((e) => (
        <div
          key={e.event_id}
          className="border rounded-xl p-5 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold">{e.title}</h2>
            <span
              className={`px-3 py-1 text-xs rounded-full ${statusStyles[e.status]}`}
            >
              {e.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar size={16} />{" "}
              {new Date(e.date).toLocaleString()}
            </span>

            <span className="flex items-center gap-1">
              <MapPin size={16} /> {e.location}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Users size={16} />
            Total Bookings: {e.total_bookings}
          </div>
        </div>
      ))}
    </div>
  );
}
