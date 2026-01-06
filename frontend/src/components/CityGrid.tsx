import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const cities = [
  { name: 'Bengaluru', events: 209, image: 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg' },
  { name: 'Delhi', events: 323, image: 'https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg' },
  { name: 'Mumbai', events: 153, image: 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg' },
  { name: 'Pune', events: 187, image: 'https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg' },
  { name: 'Hyderabad', events: 142, image: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg' },
  { name: 'Chennai', events: 119, image: 'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg' },
  { name: 'Kolkata', events: 98, image: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg' },
  { name: 'Ahmedabad', events: 76, image: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg' },
];

export default function CityGrid() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Browse Events by City
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover exciting events happening in cities across India
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <Link
              key={city.name}
              to={`/city/${city.name.toLowerCase()}`}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <h3 className="text-2xl font-bold text-white">{city.name}</h3>
                  </div>
                  <p className="text-blue-200 font-medium">
                    {city.events} Events
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
