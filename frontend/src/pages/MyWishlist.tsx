import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Ticket, Heart, Loader, Sparkles } from "lucide-react";
import { getMyWishlist, removeFromWishlist } from "../services/api";
import toast from "react-hot-toast";

interface EventWithTickets {
    id: string;
    title: string;
    description: string;
    capacity: number;
    city: string;
    venue: string;
    start_date: string;
    status: string;
    banner_url?: string;
    organizer_id: string;
    tickets: Array<{ id: string; title: string; price: number; quantity: number; sold: number }>;
}

function WishlistSkeleton() {
    return (
        <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-44" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="p-4 space-y-3">
                <div className="h-4 rounded-lg w-2/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="h-3 rounded-lg w-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
        </div>
    );
}

export default function MyWishlist() {
    const [events, setEvents] = useState<EventWithTickets[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getMyWishlist()
            .then((data) => { if (!cancelled) { setEvents(data || []); } })
            .catch((err) => { if (!cancelled) toast.error(err?.response?.data?.detail || "Failed to load wishlist"); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const handleRemove = async (eventId: string, title: string) => {
        try {
            setRemovingId(eventId);
            await removeFromWishlist(eventId);
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
            toast.success(`Removed "${title}" from wishlist`);
        } catch {
            toast.error("Failed to remove from wishlist");
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 animate-fade-up" style={{ animationFillMode: 'both' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>
                            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                        </div>
                        <div>
                            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">My Wishlist</h1>
                            <p className="text-slate-500 text-sm">Events you've saved for later</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map((i) => <WishlistSkeleton key={i} />)}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-24 glass-card rounded-2xl animate-fade-up" style={{ animationFillMode: 'both' }}>
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <Heart className="w-20 h-20 text-slate-700" />
                            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-brand-400 animate-pulse" />
                        </div>
                        <h3 className="font-heading font-bold text-xl text-white mb-3">Your wishlist is empty</h3>
                        <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                            Browse events and click the ♡ heart icon to save them here for later.
                        </p>
                        <Link to="/" className="btn-primary mx-auto">
                            Discover Events
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {events.map((event, i) => {
                            const isRemoving = removingId === event.id;
                            const minPrice = event.tickets?.length > 0
                                ? Math.min(...event.tickets.map((t) => t.price))
                                : 0;

                            return (
                                <div
                                    key={event.id}
                                    className={`event-card group animate-fade-up ${isRemoving ? "opacity-40 pointer-events-none" : ""}`}
                                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                                >
                                    {/* Image */}
                                    <div className="relative h-44 overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                                        {event.banner_url ? (
                                            <img src={event.banner_url} alt={event.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-indigo-900 opacity-30" />
                                        )}
                                        <div className="absolute inset-0 bg-black/20" />

                                        {/* Remove (heart) button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRemove(event.id, event.title); }}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
                                            style={{ background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.4)', backdropFilter: 'blur(8px)' }}
                                            title="Remove from wishlist"
                                        >
                                            {isRemoving ? (
                                                <Loader className="w-4 h-4 text-red-400 animate-spin" />
                                            ) : (
                                                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(event.start_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                                        </div>

                                        <Link to={`/event/${event.id}`}>
                                            <h3 className="font-heading font-bold text-white text-base leading-snug mb-2 line-clamp-2 group-hover:text-brand-300 transition-colors">
                                                {event.title}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                                            <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                            <span className="line-clamp-1">{event.venue}, {event.city}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <span className="font-bold text-white text-sm">
                                                {minPrice === 0 ? "Free" : `From ₹${minPrice}`}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Ticket className="w-3.5 h-3.5" />
                                                {event.tickets?.length || 0} types
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
