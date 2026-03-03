import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Ticket, Heart, AlertCircle, Loader } from "lucide-react";
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
    tickets: Array<{
        id: string;
        title: string;
        price: number;
        quantity: number;
        sold: number;
    }>;
}

export default function MyWishlist() {
    const [events, setEvents] = useState<EventWithTickets[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getMyWishlist()
            .then((data) => {
                if (!cancelled) {
                    setEvents(data || []);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err?.response?.data?.detail || "Failed to load wishlist");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleRemove = async (eventId: string, title: string) => {
        try {
            setRemovingId(eventId);
            await removeFromWishlist(eventId);
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
            toast.success(`Removed ${title} from wishlist`);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to remove from wishlist");
        } finally {
            if (removingId === eventId) setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center py-20 text-red-600">
                <AlertCircle className="w-6 h-6 mr-2" />
                {error}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <Heart className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 max-w-sm mb-6">
                    You haven't saved any events yet. Browse events and click the heart icon to save them for later!
                </p>
                <Link
                    to="/"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                    Discover Events
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <Heart className="w-8 h-8 mr-3 text-red-500 fill-red-500" />
                My Wishlist
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => {
                    const isRemoving = removingId === event.id;
                    const minPrice =
                        event.tickets?.length > 0
                            ? Math.min(...event.tickets.map((t) => t.price))
                            : 0;

                    return (
                        <div
                            key={event.id}
                            className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col group ${isRemoving ? "opacity-50 pointer-events-none" : ""
                                }`}
                        >
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                {event.banner_url ? (
                                    <img
                                        src={event.banner_url}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <Calendar size={48} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex space-x-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRemove(event.id, event.title);
                                        }}
                                        className="p-2 rounded-full bg-white text-red-500 shadow hover:bg-red-50 transition"
                                        title="Remove from wishlist"
                                    >
                                        <Heart className="w-4 h-4 fill-red-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5 text-blue-600 font-medium text-sm mb-2">
                                        <Calendar size={14} />
                                        <span>{new Date(event.start_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                                    </div>

                                    <Link to={`/event/${event.id}`}>
                                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {event.title}
                                        </h3>
                                    </Link>

                                    <div className="flex flex-col gap-1.5 text-sm text-gray-500 mb-4">
                                        <div className="flex items-start gap-1.5">
                                            <MapPin size={14} className="mt-0.5 shrink-0" />
                                            <span className="line-clamp-1">
                                                {event.venue}, {event.city}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between">
                                    <div className="font-semibold text-gray-900">
                                        {minPrice === 0 ? "Free" : `From ₹${minPrice}`}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Ticket size={14} className="mr-1" />
                                        {event.tickets?.length || 0} types
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
