import { useState } from 'react';
import HeroSearch from '../components/HeroSearch';
import CategoryFilter from '../components/Categoryfilter';
import EventCard from '../components/EventCard';
import CityGrid from '../components/CityGrid';
import { TrendingUp, Calendar } from 'lucide-react';

const mockEvents = [
  {
    id: '1',
    title: 'Sunburn Arena ft. Alan Walker',
    date: 'Sat, 15 Feb 2026',
    time: '6:00 PM',
    location: 'Phoenix Marketcity',
    city: 'Pune',
    price: '₹1,999',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    category: 'Music',
  },
  {
    id: '2',
    title: 'Stand-Up Comedy Night with Kenny Sebastian',
    date: 'Fri, 21 Feb 2026',
    time: '8:00 PM',
    location: 'The Comedy Theatre',
    city: 'Bengaluru',
    price: '₹499',
    image: 'https://images.pexels.com/photos/2263410/pexels-photo-2263410.jpeg',
    category: 'Comedy',
  },
  {
    id: '3',
    title: 'Digital Marketing Workshop 2026',
    date: 'Sun, 23 Feb 2026',
    time: '10:00 AM',
    location: 'WeWork Prestige',
    city: 'Mumbai',
    price: '₹799',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    category: 'Workshop',
  },
  {
    id: '4',
    title: 'India Tech Summit 2026',
    date: 'Mon, 24 Feb 2026',
    time: '9:00 AM',
    location: 'Hyderabad Convention Center',
    city: 'Hyderabad',
    price: '₹2,999',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    category: 'Conference',
  },
  {
    id: '5',
    title: 'NH7 Weekender Music Festival',
    date: 'Sat, 1 Mar 2026',
    time: '4:00 PM',
    location: 'Mahalaxmi Race Course',
    city: 'Mumbai',
    price: '₹3,499',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
    category: 'Music',
  },
  {
    id: '6',
    title: 'Food & Wine Festival Delhi',
    date: 'Sun, 2 Mar 2026',
    time: '12:00 PM',
    location: 'Jawaharlal Nehru Stadium',
    city: 'Delhi',
    price: '₹599',
    image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
    category: 'Food',
  },
  {
    id: '7',
    title: 'Art Exhibition: Modern Perspectives',
    date: 'Thu, 27 Feb 2026',
    time: '11:00 AM',
    location: 'National Gallery of Modern Art',
    city: 'Bengaluru',
    price: 'Free',
    image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg',
    category: 'Art',
  },
  {
    id: '8',
    title: 'IPL 2026: Mumbai vs Bangalore',
    date: 'Sat, 8 Mar 2026',
    time: '7:30 PM',
    location: 'Wankhede Stadium',
    city: 'Mumbai',
    price: '₹1,200',
    image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg',
    category: 'Sports',
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredEvents =
    selectedCategory === 'All'
      ? mockEvents
      : mockEvents.filter((event) => event.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSearch />
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Trending Events</h2>
          </div>
          <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>

      <CityGrid />

      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Host Your Event?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Create and manage events with ease. Reach thousands of potential attendees.
          </p>
          <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
            Create Your Event Now
          </button>
        </div>
      </div>
    </div>
  );
}
