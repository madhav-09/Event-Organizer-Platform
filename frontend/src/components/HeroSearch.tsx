import { Search, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";

export default function HeroSearch({
  onSearch,
}: {
  onSearch: (params?: { q?: string }) => void;
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
    <section className="relative overflow-hidden flex items-center py-8 sm:py-10">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-surface-900" />
      <div className="absolute inset-0 bg-hero-gradient" />

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

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6">
        {/* Headlines */}
        <div className="text-center mb-4 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.3)', color: '#c4b5fd' }}>
            <Sparkles className="w-3 h-3" />
            Discover Events Near You
          </div>
          <h1 className="font-heading font-black text-4xl sm:text-6xl text-white leading-tight">
            Find Your Next{' '}
            <span className="gradient-text">Unforgettable</span>{' '}
            Experience
          </h1>
        </div>

        {/* Search Box */}
        <div className="relative animate-fade-up" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
          <div className="glass-card rounded-2xl p-2 shadow-glow">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center flex-1 gap-3 px-4">
                <Search className="w-5 h-5 flex-shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search events, venues, cities..."
                  className="flex-1 bg-transparent py-3 outline-none text-white placeholder-slate-500 text-base"
                  autoComplete="off"
                />
                {loading && (
                  <div className="w-4 h-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin flex-shrink-0" />
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                className="btn-primary w-full sm:w-auto px-7 py-3 text-sm"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 animate-slide-down"
              style={{
                background: 'rgba(18, 24, 39, 0.95)',
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}>
              {suggestions.map((item, i) => (
                <button
                  key={`${item}-${i}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSearch(item)}
                  className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <Search className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
