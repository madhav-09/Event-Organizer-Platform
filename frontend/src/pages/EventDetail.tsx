import { useParams } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

const BACKEND_URL = "http://127.0.0.1:8000";

interface Ticket {
  id: string;
  title: string;
  price: number;
  quantity: number;
  sold: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  venue: string;
  start_date: string;
  end_date: string;
  banner_url?: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid event");
      setLoading(false);
      return;
    }

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

  if (loading) return <p className="text-center py-20">Loading event...</p>;
  if (error || !event)
    return <p className="text-center py-20 text-red-500">{error}</p>;

  const date = new Date(event.start_date).toDateString();
  const time = new Date(event.start_date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const bannerSrc = event.banner_url
    ? event.banner_url.startsWith("http")
      ? event.banner_url
      : `${BACKEND_URL}${event.banner_url}`
    : "/placeholder-event.jpg";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNER */}
      <div className="relative h-[400px]">
        <img
          src={bannerSrc}
          alt={event.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/placeholder-event.jpg";
          }}
          className="w-full h-full object-cover"
        />
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

      {/* DETAILS */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white p-6 rounded-xl shadow">
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

          <p className="mt-6 text-gray-700">{event.description}</p>
        </div>
      </div>
    </div>
  );
}
