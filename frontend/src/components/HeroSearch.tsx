import { Search, Sparkles, Users, MapPin, ShoppingBag, UserPlus, Trophy, Handshake } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

export default function HeroSearch({
  onSearch,
  stats,
}: {
  onSearch: (params?: { q?: string }) => void;
  stats: any;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    const currentQuery = query.trim();

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/users/suggestions", {
          params: { q: currentQuery },
          signal,
        });
        if (queryRef.current.trim() === currentQuery) {
          setSuggestions(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err: unknown) {
        const isCancel =
          err instanceof Error &&
          (err.name === "CanceledError" || err.name === "AbortError") ||
          (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "ERR_CANCELED");
        if (!isCancel && queryRef.current.trim() === currentQuery) {
          setSuggestions([]);
        }
      } finally {
        if (queryRef.current.trim() === currentQuery) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  const handleSearch = (value?: string) => {
    const q = value ?? query;
    if (!q.trim()) return;
    setQuery(q);
    onSearch({ q: q.trim() });
    setSuggestions([]);
  };

  return (
    <section className="relative flex items-center py-12 sm:py-20" style={{ zIndex: 50 }}>
      {/* Background Wrapper with overflow-hidden */}
      <div className="absolute inset-0 overflow-hidden z-0 rounded-b-[2.5rem]">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-[var(--bg-secondary)]" />
        <div className="absolute inset-0 bg-hero-gradient opacity-60 dark:opacity-100" />

        {/* Subtle blobs */}
        <div className="absolute top-[-20%] left-[-5%] w-72 h-72 rounded-full opacity-20 animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(108,71,236,0.6) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-5%] w-72 h-72 rounded-full opacity-15 animate-blob-delay"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)' }} />

        {/* Dotted grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Stats (Desktop only) */}
          <div className="hidden lg:flex flex-col gap-6 w-48">
            {[
              { label: "Total Events", value: stats.total_events, icon: Trophy, color: "text-amber-400" },
              { label: "Organizers", value: stats.total_organizers, icon: Users, color: "text-blue-400" },
              { label: "Cities", value: stats.total_cities, icon: MapPin, color: "text-emerald-400" }
            ].map((s, idx) => (
              <motion.div key={s.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                className="glass-card p-3 rounded-2xl border border-[var(--glass-border)] flex items-center gap-3 group hover:border-brand-500/30 transition-all">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--glass-border)] group-hover:scale-110 transition-transform">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <div className="text-lg font-black text-[var(--text-primary)] leading-none">{s.value}+</div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Central Search Content */}
          <div className="flex-1 max-w-2xl w-full">
            <div className="text-center mb-10 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.3)', color: '#c4b5fd' }}>
                <Sparkles className="w-3 h-3" />
                Discover Events Near You
              </div>
              <h1 className="font-heading font-black text-4xl sm:text-6xl text-[var(--text-primary)] leading-tight mb-6">
                Find Your Next{' '}
                <span className="gradient-text">Unforgettable</span>{' '}
                Experience
              </h1>
            </div>

            {/* Search Box */}
            <div className="relative animate-fade-up" style={{ animationDelay: '80ms' }}>
              <div className="glass-card rounded-3xl p-2.5 shadow-2xl border border-[var(--glass-border)]">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center flex-1 gap-3 px-4">
                    <Search className="w-5 h-5 flex-shrink-0 text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search events, venues, cities..."
                      className="flex-1 bg-transparent py-4 outline-none text-[var(--text-primary)] placeholder-slate-500 text-lg"
                      autoComplete="off"
                    />
                    {loading && (
                      <div className="w-5 h-5 rounded-full border-2 border-brand-400 border-t-transparent animate-spin flex-shrink-0" />
                    )}
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    className="btn-primary w-full sm:w-auto px-8 py-4 text-base font-bold shadow-glow"
                  >
                    <Search className="w-5 h-5" />
                    Search Now
                  </button>
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-3 rounded-[2rem] overflow-hidden z-50 animate-slide-down"
                  style={{
                    background: 'rgba(18, 24, 39, 0.98)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(30px)',
                    boxShadow: '0 25px 70px rgba(0,0,0,0.6)',
                  }}>
                  {suggestions.map((item, i) => (
                    <button
                      key={`${item}-${i}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSearch(item)}
                      className="flex items-center gap-3 w-full text-left px-6 py-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-hover)] transition-colors border-b border-[var(--glass-border)] last:border-0"
                    >
                      <Search className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Stats (Desktop only) */}
          <div className="hidden lg:flex flex-col gap-6 w-48">
            {[
              { label: "Vendors", value: stats.total_vendors, icon: ShoppingBag, color: "text-brand-400" },
              { label: "Volunteers", value: stats.total_volunteers, icon: UserPlus, color: "text-pink-400" },
              { label: "Sponsors", value: stats.total_sponsors, icon: Handshake, color: "text-purple-400" }
            ].map((s, idx) => (
              <motion.div key={s.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (idx + 3) * 0.1 }}
                className="glass-card p-3 rounded-2xl border border-[var(--glass-border)] flex items-center gap-3 group hover:border-brand-500/30 transition-all text-right flex-row-reverse">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--glass-border)] group-hover:scale-110 transition-transform">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <div className="text-lg font-black text-[var(--text-primary)] leading-none">{s.value}+</div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Stats (Visible only on mobile) */}
          <div className="grid grid-cols-2 gap-3 w-full lg:hidden">
            {[
              { label: "Events", value: stats.total_events, icon: Trophy, color: "text-amber-400" },
              { label: "Organizers", value: stats.total_organizers, icon: Users, color: "text-blue-400" },
              { label: "Cities", value: stats.total_cities, icon: MapPin, color: "text-emerald-400" },
              { label: "Vendors", value: stats.total_vendors, icon: ShoppingBag, color: "text-brand-400" },
              { label: "Volunteers", value: stats.total_volunteers, icon: UserPlus, color: "text-pink-400" },
              { label: "Sponsors", value: stats.total_sponsors, icon: Handshake, color: "text-purple-400" }
            ].map((s, idx) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="glass-card p-3 rounded-xl border border-[var(--glass-border)] flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                  <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
                <div>
                  <div className="text-base font-black text-[var(--text-primary)] leading-none">{s.value}+</div>
                  <div className="text-[9px] font-bold text-[var(--text-status-pending-text)] uppercase tracking-tight">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
