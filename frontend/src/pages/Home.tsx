import { useEffect, useState } from "react";
import HeroSearch from "../components/HeroSearch";
import CategoryFilter from "../components/Categoryfilter";
import EventCard from "../components/EventCard";
import CityGrid from "../components/CityGrid";
import { TrendingUp, Calendar } from "lucide-react";
import api from "../services/api";
import { useSearchParams } from "react-router-dom";

interface Ticket {
  _id: string;
  price: number;
}

interface Event {
  _id: string;
  title: string;
  category: string;
  city: string;
  venue: string;
  start_date: string;
  banner_url: string;
  tickets?: Ticket[];
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const city = searchParams.get("city");

  /* 🔥 Single source of truth */
  const fetchEvents = async (params?: { q?: string; city?: string | null }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<Event[]>("/users/search", {
        params,
      });

      const eventsWithTickets = await Promise.all(
        res.data.map(async (event) => {
          try {
            const ticketRes = await api.get<Ticket[]>(
              `/tickets/event/${event._id}`
            );
            return { ...event, tickets: ticketRes.data };
          } catch {
            return { ...event, tickets: [] };
          }
        })
      );

      setEvents(eventsWithTickets);
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  /* 📍 Fetch events when city changes */
  useEffect(() => {
    fetchEvents({ city });
  }, [city]);

  const filteredEvents =
    selectedCategory === "All"
      ? events
      : events.filter((e) => e.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔍 Search */}
      <HeroSearch
        onSearch={(q) => fetchEvents({ q, city })}
      />

      {/* 🎯 Category */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center space-x-3 mb-8">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold">Trending Events</h2>
        </div>

        {loading ? (
          <p className="text-center py-16">Loading events...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-16">{error}</p>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => {
              const price =
                event.tickets?.length
                  ? `₹${event.tickets[0].price}`
                  : "Free";

              return (
                <EventCard
                  key={event._id}
                  id={event._id}
                  title={event.title}
                  date={new Date(event.start_date).toDateString()}
                  time={new Date(event.start_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  location={event.venue}
                  city={event.city}
                  price={price}
                  image={event.banner_url}
                  category={event.category}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-14 h-14 mx-auto text-gray-400 mb-4" />
            <p>No events found</p>
          </div>
        )}
      </div>

      <CityGrid />
    </div>
  );
}
