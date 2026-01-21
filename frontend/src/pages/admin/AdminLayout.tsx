import { ReactNode, useState } from "react";
import {
  FaCalendarAlt,
  FaUsers,
  FaUserTie,
  FaChartBar,
  FaBars,
  FaTimes,
} from "react-icons/fa";

type Props = {
  children: ReactNode;
  activeSection: string;
  onSelectSection: (section: string) => void;
};

const AdminLayout = ({ children, activeSection, onSelectSection }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-4">
        <button onClick={toggleSidebar} className="text-gray-600">
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="p-6 text-2xl font-bold text-gray-800 border-b">
          Admin Panel
        </div>
        <nav className="p-4 space-y-2">
          <div
            onClick={() => {
              onSelectSection("events");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "events"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaCalendarAlt className="mr-3" />
            Events
          </div>
          <div
            onClick={() => {
              onSelectSection("organizers");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "organizers"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaUserTie className="mr-3" />
            Organizers
          </div>
          <div
            onClick={() => {
              onSelectSection("users");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "users"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaUsers className="mr-3" />
            Users
          </div>
          <div
            onClick={() => {
              onSelectSection("analytics");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "analytics"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaChartBar className="mr-3" />
            Analytics
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-white shadow-md">
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
          {/* User Profile/Logout - Can add more here */}
          <div className="text-gray-600">Admin User</div>
        </header>

        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
