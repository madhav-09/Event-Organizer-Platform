import { Search } from "lucide-react";
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

    if (abortRef.current) {
      abortRef.current.abort();
    }
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
        // Only apply suggestions if this response is still for the current query (avoid race)
        if (queryRef.current.trim() === currentQuery) {
          const data = Array.isArray(res.data) ? res.data : [];
          setSuggestions(data);
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
        if (queryRef.current.trim() === currentQuery) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) {
        abortRef.current.abort();
      }
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
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Discover Events Near You
        </h1>

        <div className="relative bg-white rounded-2xl shadow-lg p-4">
          <div className="flex">
            <Search className="w-5 h-5 text-gray-400 mt-4 ml-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search events, venues, cities..."
              className="flex-1 px-4 py-3 outline-none"
              autoComplete="off"
            />
            <button
              onClick={() => handleSearch()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl"
            >
              Search
            </button>
          </div>

          {suggestions.length > 0 && (
            <div
              className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl shadow-md z-50 border border-gray-200 max-h-60 overflow-auto"
            >
              {suggestions.map((item, i) => (
                <button
                  key={`${item}-${i}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSearch(item)}
                  className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 first:rounded-t-xl last:rounded-b-xl"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
