import { useEffect, useState } from "react";
import HeroSearch from "../components/HeroSearch";
import CategoryFilter from "../components/Categoryfilter";
import EventCard from "../components/EventCard";
import CityGrid from "../components/CityGrid";
import { TrendingUp, Calendar, ArrowRight } from "lucide-react";
import api from "../services/api";
import { useSearchParams, Link } from "react-router-dom";
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

function EventCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
      <div className="h-48 shimmer" style={{ background: 'var(--btn-secondary-bg)' }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded-lg shimmer" style={{ background: 'var(--btn-secondary-bg)', width: '70%' }} />
        <div className="h-3 rounded-lg shimmer" style={{ background: 'var(--btn-secondary-bg)', width: '50%' }} />
        <div className="h-3 rounded-lg shimmer" style={{ background: 'var(--btn-secondary-bg)', width: '60%' }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const [searchParams] = useSearchParams();
  const city = searchParams.get("city");

  const fetchEvents = async (params?: { q?: string; city?: string | null; show_past?: boolean }) => {
    setLoading(true);
    try {
      const res = await api.get<Event[]>("/users/search", { params });
      setEvents(res.data);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents({ city, show_past: showPast });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, showPast]);

  useEffect(() => {
    if (user) {
      getMyWishlist()
        .then((data) => setWishlistIds(new Set(data.map((e: any) => e.id))))
        .catch(console.error);
    } else {
      setWishlistIds(new Set());
    }
  }, [user]);

  const handleToggleWishlist = async (_e: React.MouseEvent, eventId: string) => {
    if (!user) {
      toast.error("Please login to save events");
      return;
    }
    const isWishlisted = wishlistIds.has(eventId);
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
        toast.success("Saved to wishlist");
      }
    } catch {
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <HeroSearch onSearch={(params) => fetchEvents({ q: params?.q, city, show_past: showPast })} />
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Events section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.25)' }}>
                <TrendingUp className="w-4 h-4 text-brand-400" />
              </div>
              <span className="text-brand-400 text-sm font-semibold uppercase tracking-widest">
                {showPast ? "Past Events" : "Live Events"}
              </span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-[var(--text-primary)]">
              {showPast ? "Memory" : "Trending"} <span className="gradient-text">{showPast ? "Lane" : "Now"}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPast(!showPast)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: showPast ? 'rgba(108,71,236,0.1)' : 'var(--btn-secondary-bg)',
                border: `1px solid ${showPast ? 'rgba(108,71,236,0.3)' : 'var(--glass-border)'}`,
                color: showPast ? 'var(--brand)' : 'var(--text-secondary)'
              }}
            >
              <Calendar className="w-4 h-4" />
              {showPast ? "Show Live Events" : "View Past Events"}
            </button>
            
            {!loading && filteredEvents.length > 0 && (
              <Link to="/" className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEvents.map((event, i) => {
              const price = event.tickets?.length ? `₹${event.tickets[0].price}` : "Free";
              return (
                <div
                  key={event.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                >
                  <EventCard
                    id={event.id}
                    title={event.title}
                    date={new Date(event.start_date).toDateString()}
                    time={new Date(event.start_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    location={event.venue}
                    city={event.city}
                    price={price}
                    image={event.banner_url}
                    category={event.category}
                    isWishlisted={wishlistIds.has(event.id)}
                    onToggleWishlist={(e) => handleToggleWishlist(e, event.id)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Calendar className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
            <h3 className="text-[var(--text-primary)] font-heading font-bold text-xl mb-2">No events found</h3>
            <p className="text-[var(--text-secondary)] text-sm">Try a different category or city</p>
          </div>
        )}
      </section>

      <CityGrid />
    </div>
  );
}
