import { useEffect, useState } from "react";
import HeroSearch from "../components/HeroSearch";
import CategoryFilter from "../components/Categoryfilter";
import EventCard from "../components/EventCard";
import CityGrid from "../components/CityGrid";
import { TrendingUp, Calendar } from "lucide-react";
import api from "../services/api";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyWishlist, addToWishlist, removeFromWishlist } from "../services/api";
import toast from "react-hot-toast";

interface Ticket {
  id: string;
  price: number;
}

interface Event {
  id: string;
  title: string;
  category: string;
  city: string;
  venue: string;
  start_date: string;
  banner_url?: string;
  tickets?: Ticket[];
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const [searchParams] = useSearchParams();
  const city = searchParams.get("city");

  const fetchEvents = async (params?: { q?: string; city?: string | null }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<Event[]>("/users/search", { params });
      setEvents(res.data);
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents({ city });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  useEffect(() => {
    if (user) {
      getMyWishlist()
        .then((data) => {
          setWishlistIds(new Set(data.map((e: any) => e.id)));
        })
        .catch(console.error);
    } else {
      setWishlistIds(new Set());
    }
  }, [user]);

  const handleToggleWishlist = async (e: React.MouseEvent, eventId: string) => {
    if (!user) {
      toast.error("Please login to save events");
      return;
    }

    const isWishlisted = wishlistIds.has(eventId);

    // Optimistic
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isWishlisted) next.delete(eventId);
      else next.add(eventId);
      return next;
    });

    try {
      if (isWishlisted) {
        await removeFromWishlist(eventId);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(eventId);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      // Revert
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isWishlisted) next.add(eventId);
        else next.delete(eventId);
        return next;
      });
      toast.error("Failed to update wishlist");
    }
  };

  const filteredEvents =
    selectedCategory === "All"
      ? events
      : events.filter((e) => e.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSearch onSearch={(params) => fetchEvents({ q: params?.q, city })} />

      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center space-x-3 mb-6 sm:mb-8">
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <h2 className="text-2xl sm:text-3xl font-bold">Trending Events</h2>
        </div>

        {loading ? (
          <p className="text-center py-16">Loading events...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-16">{error}</p>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredEvents.map((event) => {
              const price =
                event.tickets?.length
                  ? `₹${event.tickets[0].price}`
                  : "Free";

              return (
                <EventCard
                  key={event.id}
                  id={event.id}
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
                  isWishlisted={wishlistIds.has(event.id)}
                  onToggleWishlist={(e) => handleToggleWishlist(e, event.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 sm:py-16">
            <Calendar className="w-10 h-10 sm:w-14 sm:h-14 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No events found</p>
          </div>
        )}
      </div>

      <CityGrid />
    </div>
  );
}
