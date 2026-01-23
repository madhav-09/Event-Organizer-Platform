import { Calendar, MapPin, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { memo, useMemo, useState } from "react";

const BACKEND_URL = "http://127.0.0.1:8000";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  price: string;
  image?: string;
  category: string;
}

function EventCard({
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

  // ✅ memoized image source (VERY IMPORTANT)
  const imageSrc = useMemo(() => {
    if (!image) return "/placeholder-event.jpg";
    if (image.startsWith("http")) return image;
    return `${BACKEND_URL}${image}`;
  }, [image]);

  return (
    <Link to={`/event/${id}`} className="h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
        {/* IMAGE */}
        <div className="relative overflow-hidden h-56">
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/placeholder-event.jpg";
            }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* FAVORITE */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite((prev) => !prev);
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600"
                }`}
              />
            </button>
          </div>

          {/* CATEGORY */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
              {category}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {title}
          </h3>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              <span>{date}</span>
              <Clock className="w-4 h-4 ml-4 mr-2 text-blue-600" />
              <span>{time}</span>
            </div>

            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
              <span className="line-clamp-1">
                {location}, {city}
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Starting from
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {price}
              </p>
            </div>

            <button
              onClick={(e) => e.preventDefault()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(EventCard); // ✅ prevents re-render storm
