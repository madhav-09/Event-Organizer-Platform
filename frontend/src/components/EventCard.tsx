import { Calendar, MapPin, Clock, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo, useMemo, useState } from "react";

const BACKEND_URL = "https://event-organizer-platform.onrender.com";

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

function EventCard(props: EventCardProps) {
  const {
    id,
    title,
    date,
    time,
    location,
    city,
    price,
    image,
    category,
  } = props;

  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const imageSrc = useMemo(() => {
    if (!image) return "/placeholder-event.jpg";
    if (image.startsWith("http")) return image;
    return `${BACKEND_URL}${image}`;
  }, [image]);

  return (
    <div
      onClick={() => navigate(`/event/${id}`)}
      className="h-full cursor-pointer"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all h-full flex flex-col">
        {/* IMAGE */}
        <div className="relative h-44 sm:h-56">
          <img
            src={imageSrc}
            alt={title}
            onError={(e) =>
            ((e.target as HTMLImageElement).src =
              "/placeholder-event.jpg")
            }
            className="w-full h-full object-cover"
          />

          {/* FAVORITE */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite((p) => !p);
            }}
            className="absolute top-4 right-4 p-2 bg-white rounded-full"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600"
                }`}
            />
          </button>

          <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
            {category}
          </span>
        </div>

        {/* CONTENT */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg sm:text-xl font-bold mb-3 line-clamp-2">{title}</h3>

          <div className="text-sm text-gray-600 space-y-2 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {date}
              <Clock className="w-4 h-4 ml-4 mr-2" />
              {time}
            </div>

            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {location}, {city}
            </div>
          </div>

          <div className="mt-auto flex justify-between items-center pt-4 border-t">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {price}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/event/${id}`);
              }}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base whitespace-nowrap"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(EventCard);
