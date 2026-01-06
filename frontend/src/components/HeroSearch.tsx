import { Search, Calendar, MapPin, Filter } from 'lucide-react';
import { useState } from 'react';

export default function HeroSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const popularSearches = ['Music', 'Comedy', 'Workshop', 'Conference', 'Festival', 'Nightlife'];

  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Discover Events Happening
            <br />
            <span className="text-blue-200">Near You</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Find and book tickets for concerts, workshops, conferences and more
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for events, categories, venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center justify-center px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                </button>

                <button className="flex-1 lg:flex-none px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
                  Search Events
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select className="w-full pl-12 pr-4 py-3 text-gray-900 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-500 outline-none appearance-none cursor-pointer">
                    <option>All Dates</option>
                    <option>Today</option>
                    <option>Tomorrow</option>
                    <option>This Weekend</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select className="w-full pl-12 pr-4 py-3 text-gray-900 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-500 outline-none appearance-none cursor-pointer">
                    <option>All Venues</option>
                    <option>Online Events</option>
                    <option>Offline Events</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-blue-100 mb-3 text-sm">Popular Searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularSearches.map((search) => (
                <button
                  key={search}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
