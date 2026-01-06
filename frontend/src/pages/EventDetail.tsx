import { useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Share2, Heart, Users, Tag, Info } from 'lucide-react';
import { useState } from 'react';

export default function EventDetail() {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState('');

  const event = {
    id: id,
    title: 'Sunburn Arena ft. Alan Walker',
    date: 'Saturday, 15 February 2026',
    time: '6:00 PM - 11:00 PM',
    location: 'Phoenix Marketcity, Viman Nagar',
    city: 'Pune',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    category: 'Music',
    description:
      'Get ready for an electrifying night with world-renowned DJ Alan Walker! Experience his biggest hits including "Faded," "Alone," and "Darkside" performed live. This is a concert experience you won\'t want to miss!',
    organizer: 'Sunburn Events',
    tickets: [
      { id: '1', name: 'Early Bird', price: 1999, available: 50 },
      { id: '2', name: 'General Admission', price: 2499, available: 200 },
      { id: '3', name: 'VIP Pass', price: 4999, available: 25 },
      { id: '4', name: 'Fan Pit', price: 5999, available: 15 },
    ],
    totalAttendees: 2000,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[400px] sm:h-[500px] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full mb-4">
              {event.category}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-white">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{event.totalAttendees}+ attending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                      }`}
                    />
                  </button>
                  <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{event.date}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
                  <MapPin className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{event.location}</p>
                    <p className="text-gray-600">{event.city}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About This Event</h3>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Organized By</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">S</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{event.organizer}</p>
                    <p className="text-gray-600">Verified Organizer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Tickets</h3>

              <div className="space-y-3 mb-6">
                {event.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedTicket === ticket.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                      <p className="text-xl font-bold text-blue-600">₹{ticket.price}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{ticket.available} available</span>
                      {ticket.available < 50 && (
                        <span className="text-red-600 font-medium flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          Selling Fast!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                disabled={!selectedTicket}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedTicket
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedTicket ? 'Proceed to Checkout' : 'Select a Ticket'}
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Your tickets will be sent to your email immediately after purchase. Please arrive 30 minutes before the event starts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
