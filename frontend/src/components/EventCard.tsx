import { Calendar, MapPin, Clock, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo, useMemo } from "react";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://13.202.85.18:8000";

const CATEGORY_COLORS: Record<string, string> = {
  Music: "from-pink-500 to-rose-600",
  Comedy: "from-yellow-500 to-orange-500",
  Workshop: "from-emerald-500 to-teal-600",
  Conference: "from-blue-500 to-indigo-600",
  Art: "from-purple-500 to-violet-600",
  Sports: "from-red-500 to-orange-600",
  Food: "from-amber-500 to-yellow-500",
  All: "from-brand-500 to-indigo-600",
};

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  price: string;
  image?: string;
  category: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (e: React.MouseEvent) => void;
}

function EventCard(props: EventCardProps) {
  const {
    id, title, date, time, location, city, price, image, category,
    isWishlisted = false, onToggleWishlist,
  } = props;

  const navigate = useNavigate();

  const imageSrc = useMemo(() => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `${BACKEND_URL}${image}`;
  }, [image]);

  const catGradient = CATEGORY_COLORS[category] || "from-brand-500 to-indigo-600";

  return (
    <div
      onClick={() => navigate(`/event/${id}`)}
      className="event-card group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-surface-700">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          /* Gradient placeholder */
          <div className={`absolute inset-0 bg-gradient-to-br ${catGradient} opacity-30`} />
        )}

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Top badges */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${catGradient}`}>
            {category}
          </span>
        </div>

        {/* Wishlist button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(e);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
            style={{
              background: isWishlisted
                ? "rgba(239,68,68,0.25)"
                : "rgba(0,0,0,0.4)",
              border: `1px solid ${isWishlisted ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.2)"}`,
              backdropFilter: "blur(8px)",
            }}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-white"
                }`}
            />
          </button>
        )}

        {/* Price tag */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 rounded-lg text-sm font-bold text-white"
            style={{
              background: "rgba(108, 71, 236, 0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(108, 71, 236, 0.4)",
            }}>
            {price}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-heading font-bold text-[var(--text-primary)] text-base leading-snug mb-3 line-clamp-2 group-hover:text-brand-300 transition-colors duration-200">
          {title}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            <span>{date}</span>
            <Clock className="w-3.5 h-3.5 ml-1 flex-shrink-0" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            <span className="line-clamp-1">{location}, {city}</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-4">
        <div className="h-px bg-white/5 mb-3" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/event/${id}`);
          }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-glow-sm"
          style={{
            background: "linear-gradient(135deg, rgba(108,71,236,0.8) 0%, rgba(79,70,229,0.8) 100%)",
            border: "1px solid rgba(108,71,236,0.4)",
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

export default memo(EventCard);
