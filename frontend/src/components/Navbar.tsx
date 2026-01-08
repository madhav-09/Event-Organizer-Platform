import { MapPin, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// const cities = [
//   "Bengaluru", "Delhi", "Mumbai", "Pune", "Hyderabad",
//   "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Chandigarh",
// ];
const roleStyles: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  ORGANIZER: "bg-purple-100 text-purple-700",
  USER: "bg-blue-100 text-blue-700",
};

// import api from "../services/api";

export default function Navbar() {
  const [selectedCity, setSelectedCity] = useState("Pune");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { user, logout } = useAuth(); // ⭐ AUTH
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

const handleCreateEvent = () => {
  // 1️⃣ User not logged in
  if (!user) {
    navigate("/login");
    return;
  }

  // 2️⃣ Normal user → apply as organizer
  if (user.role === "USER") {
    navigate("/apply-organizer");
    return;
  }

  // 3️⃣ Organizer or Admin → create event
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
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ST</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 hidden sm:block">
              Swasthya Chetna
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {/* City */}
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>{selectedCity}</span>
            </button>

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

    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
    >
      <LogOut className="w-5 h-5" />
      <span>Logout</span>
    </button>
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

    <button
      onClick={handleLogout}
      className="flex items-center px-4 py-2 text-red-600"
    >
      <LogOut className="w-5 h-5 mr-2" />
      Logout
    </button>
  </>
)}

          </div>
        )}
      </div>
    </nav>
  );
}
