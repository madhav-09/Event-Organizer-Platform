import { type ReactNode, useState, useMemo } from "react";
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

  const currentSection = useMemo(() => {
    switch (activeSection) {
      case "events":
        return {
          title: "Events",
          subtitle: "Review, publish, and manage all events on the platform.",
        };
      case "organizers":
        return {
          title: "Organizers",
          subtitle: "Verify organizer applications and manage organizer accounts.",
        };
      case "users":
        return {
          title: "Users",
          subtitle: "View and control user access, roles, and organizer status.",
        };
      case "analytics":
        return {
          title: "Analytics",
          subtitle: "Track platform performance, revenue, and engagement.",
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Overview of your admin tools and activity.",
        };
    }
  }, [activeSection]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Dark backdrop on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md flex flex-col transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="p-6 text-2xl font-bold text-gray-800 border-b flex items-center justify-between">
          Admin Panel
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <div
            onClick={() => {
              onSelectSection("events");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${activeSection === "events"
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
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${activeSection === "organizers"
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
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${activeSection === "users"
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
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${activeSection === "analytics"
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
        {/* Mobile header bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={toggleSidebar} className="text-gray-600">
            <FaBars size={22} />
          </button>
          <span className="font-semibold text-gray-800">{currentSection.title}</span>
        </div>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {currentSection.title}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {currentSection.subtitle}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Admin
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
