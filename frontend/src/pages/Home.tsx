import { useEffect, useState } from 'react';
import axios from 'axios';
import HeroSearch from '../components/HeroSearch';
import CategoryFilter from '../components/Categoryfilter';
import EventCard from '../components/EventCard';
import CityGrid from '../components/CityGrid';
import { TrendingUp, Calendar } from 'lucide-react';

interface Ticket {
  _id: string;
  event_id: string;
  title: string;
  price: number;
  quantity: number;
  sold: number;
  created_at: string;
}

interface Event {
  _id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  city: string;
  venue: string;
  start_date: string;
  end_date: string;
  banner_url: string;
  status: string;
  created_at: string;
  tickets?: Ticket[];
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch events and their tickets
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get<Event[]>('http://127.0.0.1:8000/events/');
        const eventsData = res.data;

        const eventsWithTickets = await Promise.all(
          eventsData.map(async (event) => {
            try {
              const ticketRes = await axios.get<Ticket[]>(
                `http://127.0.0.1:8000/tickets/event/${event._id}`
              );
              return { ...event, tickets: ticketRes.data };
            } catch (ticketErr: unknown) {
              // Log the ticket fetching error
              console.error('Error fetching tickets for', event.title, ticketErr);
              return { ...event, tickets: [] };
            }
          })
        );

        setEvents(eventsWithTickets);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const data = err.response?.data as { detail?: string };
          setError(data?.detail || err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Something went wrong while fetching events');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents =
    selectedCategory === 'All'
      ? events
      : events.filter((event) => event.category === selectedCategory);

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

        {loading ? (
          <p className="text-center text-gray-600 py-16">Loading events...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-16">{error}</p>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {filteredEvents.map((event) => {
              const price =
                event.tickets && event.tickets.length > 0
                  ? `₹${event.tickets[0].price}`
                  : 'Free';
              const date = new Date(event.start_date).toDateString();
              const time = new Date(event.start_date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <EventCard
                  key={event._id}
                  id={event._id}
                  title={event.title}
                  date={date}
                  time={time}
                  location={event.venue}
                  city={event.city}
                  price={price}
                  image={event.banner_url}
                  category={event.category}
                />
              );
            })}
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
