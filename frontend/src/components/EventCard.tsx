import { Calendar, MapPin, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  price: string;
  image: string;
  category: string;
}

export default function EventCard({
  id,
  title,
  date,
  time,
  location,
  city,
  price,
  image,
  category,
}: EventCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link to={`/event/${id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
          </div>
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
              {category}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              <span>{date}</span>
              <Clock className="w-4 h-4 ml-4 mr-2 text-blue-600" />
              <span>{time}</span>
            </div>

            <div className="flex items-start text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
              <span className="line-clamp-1">{location}, {city}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Starting from</p>
              <p className="text-2xl font-bold text-blue-600">{price}</p>
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
