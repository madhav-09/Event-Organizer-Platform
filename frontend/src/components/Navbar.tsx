import { MapPin, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const cities = [
  'Bengaluru', 'Delhi', 'Mumbai', 'Pune', 'Hyderabad',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh'
];

export default function Navbar() {
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 hidden sm:block">Townscript</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{selectedCity}</span>
              </button>

              {showCityDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCityDropdown(false)}
                  />
                  <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                    <div className="px-4 py-2 text-sm text-gray-500 font-medium">Select City</div>
                    <div className="max-h-80 overflow-y-auto">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setShowCityDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors ${
                            selectedCity === city ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              to="/create-event"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Create Event
            </Link>

            <Link
              to="/login"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Login</span>
            </Link>
          </div>

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {showMobileMenu && (
          <div className="md:hidden pb-4 space-y-2">
            <div className="relative">
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{selectedCity}</span>
              </button>

              {showCityDropdown && (
                <div className="mt-2 bg-gray-50 rounded-lg p-2">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setShowCityDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded hover:bg-white transition-colors ${
                        selectedCity === city ? 'bg-white text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/create-event"
              className="block w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg text-center"
            >
              Create Event
            </Link>

            <Link
              to="/login"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Login</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
