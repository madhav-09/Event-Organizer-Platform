import { ReactNode, useState } from "react";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUsers,
  FaInfoCircle,
  FaTicketAlt,
  FaWpforms,
  FaTags,
  FaCog,
  FaPlusCircle,
  FaArrowLeft,
} from "react-icons/fa";

type Props = {
  children: ReactNode;
  activeSection: string;
  onSelectSection: (section: string) => void;
};

const OrganizerLayout = ({ children, activeSection, onSelectSection }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-4 bg-white shadow-md">
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
          <FaArrowLeft className="inline-block mr-2 cursor-pointer" /> Event Name
        </div>
        <nav className="p-4 space-y-2">
          <div
            onClick={() => {
              onSelectSection("overview");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "overview"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaTachometerAlt className="mr-3" />
            Overview
          </div>
          <div
            onClick={() => {
              onSelectSection("attendees");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "attendees"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaUsers className="mr-3" />
            Attendees
          </div>
          <div
            onClick={() => {
              onSelectSection("details");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "details"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaInfoCircle className="mr-3" />
            Details
          </div>
          <div
            onClick={() => {
              onSelectSection("tickets");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "tickets"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaTicketAlt className="mr-3" />
            Tickets
          </div>
          <div
            onClick={() => {
              onSelectSection("forms");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "forms"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaWpforms className="mr-3" />
            Forms
          </div>
          <div
            onClick={() => {
              onSelectSection("discounts");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "discounts"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaTags className="mr-3" />
            Discounts
          </div>
          <div
            onClick={() => {
              onSelectSection("settings");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "settings"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaCog className="mr-3" />
            Settings
          </div>
          <div
            onClick={() => {
              onSelectSection("add-ons");
              setIsSidebarOpen(false);
            }}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSection === "add-ons"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaPlusCircle className="mr-3" />
            Add-ons
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-white shadow-md">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-semibold text-gray-800">Hamstring...</h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
              Event is Offline
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              <FaTimes className="mr-2" /> Copy Event Link
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              <FaTimes className="mr-2" /> Preview Event
            </button>
            {/* Placeholder for user/event actions */}
            <div className="text-gray-600">Actions</div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default OrganizerLayout;
