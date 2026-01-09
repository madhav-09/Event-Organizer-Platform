import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function HeroSearch({
  onSearch,
}: {
  onSearch: (params?: { q?: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/users/suggestions", {
          params: { q: query },
        });
        setSuggestions(res.data);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (value?: string) => {
    const q = value ?? query;
    if (!q.trim()) return;

    onSearch({ q });
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
            />
            <button
              onClick={() => handleSearch()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl"
            >
              Search
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute w-full bg-white mt-2 rounded-xl shadow-md z-50">
              {suggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(item)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
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
