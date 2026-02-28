import { MapPin, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";

const roleStyles: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  ORGANIZER: "bg-purple-100 text-purple-700",
  USER: "bg-blue-100 text-blue-700",
};
const popularCities = [
  "Pune",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Ahmedabad",
];

export default function Navbar() {
  // const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCity = searchParams.get("city") || "Pune";

  const handleCitySelect = (city: string) => {
    setSearchParams((prev) => {
      prev.set("city", city);
      return prev;
    });

    setShowCityDropdown(false);
    navigate(`/?city=${city}`);
  };

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateEvent = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "USER") {
      navigate("/apply-organizer");
      return;
    }

    navigate("/create-event");
  };


  <button
  onClick={handleCreateEvent}
  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
>
  Create Event
</button>


  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
  <img
    src={logo}
    alt="Swasthya Chetna Logo"
    className="w-10 h-10 object-contain"
  />
  <span className="text-2xl font-bold text-gray-900 hidden sm:block">
    Swasthya Chetna
  </span>
</Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {/* City */}
            {/* City */}
<div className="relative">
  <button
    onClick={() => setShowCityDropdown(!showCityDropdown)}
    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
  >
    <MapPin className="w-5 h-5 text-blue-600" />
    <span>{selectedCity}</span>
  </button>

  {showCityDropdown && (
    <div className="absolute mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
      {popularCities.map((city) => (
        <button
          key={city}
          onClick={() => handleCitySelect(city)}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          {city}
        </button>
      ))}
    </div>
  )}
</div>


<button
  onClick={handleCreateEvent}
  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
>
  Create Event
</button>


            {/* AUTH BUTTON */}
{!user ? (
  <Link
    to="/login"
    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
  >
    <User className="w-5 h-5" />
    <span>Login</span>
  </Link>
) : (
  <div className="flex items-center space-x-3">
    {/* ROLE BADGE */}
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${roleStyles[user.role]}`}
    >
      {user.role}
    </span>

    {/* ADMIN QUICK LINK */}
    {user.role === "ADMIN" && (
      <Link
        to="/admin/events"
        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
      >
        Admin Panel
      </Link>
    )}

<div className="relative">
  <button
    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
    className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
  >
    <User className="w-5 h-5" />
  </button>

  {showProfileDropdown && (
    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
      
      {/* USER → My Bookings */}
      {user.role === "USER" && (
        <Link
          to="/my-bookings"
          onClick={() => setShowProfileDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          My Bookings
        </Link>
      )}

      {/* ORGANIZER → My Events */}
      {user.role === "ORGANIZER" && (
        <Link
          to="/organizer/dashboard/overview"
          onClick={() => setShowProfileDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          Organizer Dashboard
        </Link>
      )}
      {user.role === "ORGANIZER" && (
        <Link
          to="/organizer/events"
          onClick={() => setShowProfileDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          My Events
        </Link>
      )}

      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
      >
        Logout
      </button>
    </div>
  )}
</div>

  </div>
)}

          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2"
          >
            {showMobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 space-y-2">
<button
  onClick={handleCreateEvent}
  className="block w-full text-left px-4 py-2"
>
  Create Event
</button>


            {!user ? (
  <Link to="/login" className="flex items-center px-4 py-2">
    <User className="w-5 h-5 mr-2" />
    Login
  </Link>
) : (
  <>
    <div className="px-4 py-2">
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${roleStyles[user.role]}`}
      >
        {user.role}
      </span>
    </div>

    {user.role === "ADMIN" && (
      <Link
        to="/admin"
        className="block px-4 py-2 text-gray-700"
      >
        Admin Panel
      </Link>
    )}

   <div className="relative">
  <button
    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
    className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
  >
    <User className="w-5 h-5" />
  </button>

  {showProfileDropdown && (
    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
      
      {/* USER → My Bookings */}
      {user.role === "USER" && (
        <Link
          to="/my-bookings"
          onClick={() => setShowProfileDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          My Bookings
        </Link>
      )}

      {/* ORGANIZER → My Events */}
      {user.role === "ORGANIZER" && (
        <Link
          to="/organizer/dashboard/overview"
          onClick={() => setShowProfileDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          Organizer Dashboard
        </Link>
      )}
      {user.role === "ORGANIZER" && (
        <Link
          to="/organizer/events"
          onClick={() => setShowProfileDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          My Events
        </Link>
      )}

      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
      >
        Logout
      </button>
    </div>
  )}
</div>

  </>
)}

          </div>
        )}
      </div>
    </nav>
  );
}
