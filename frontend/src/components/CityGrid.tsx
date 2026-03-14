import { useEffect, useState } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";

interface CityItem {
  name: string;
  events: number;
  image: string | null;
}

function CityCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden shimmer"
      style={{ background: 'rgba(255,255,255,0.04)', aspectRatio: '4/3' }} />
  );
}

export default function CityGrid() {
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<CityItem[]>("/users/cities")
      .then((res) => setCities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Failed to load cities"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(108,71,236,0.15), transparent)',
        }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Browse by Location
            </p>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)]">
              Events in Your{" "}
              <span className="gradient-text">City</span>
            </h2>
          </div>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm">
            Discover exciting events happening across India's vibrant cities.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => <CityCardSkeleton key={i} />)}
          </div>
        ) : error || cities.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">{error || "No cities with events yet."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cities.map((city, i) => (
              <Link
                key={city.name}
                to={`/?city=${encodeURIComponent(city.name)}`}
                className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 animate-fade-up"
                style={{
                  animationDelay: `${i * 80}ms`,
                  animationFillMode: 'both',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={city.image || DEFAULT_IMAGE}
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-brand-300" />
                      <h3 className="text-xl font-heading font-bold text-white">
                        {city.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-brand-300 text-sm font-medium">
                        {city.events} {city.events === 1 ? "Event" : "Events"}
                      </p>
                      <ArrowRight className="w-5 h-5 text-brand-300 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Hover border glow */}
                  <div className="absolute inset-0 rounded-2xl border border-brand-500/0 group-hover:border-brand-500/30 transition-colors duration-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
