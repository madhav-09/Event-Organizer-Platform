import { type ReactNode, useState } from "react";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaArrowLeft,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type Props = {
  children: ReactNode;
  activeSection: string;
  onSelectSection: (section: string) => void;
};

const OrganizerLayout = ({
  children,
  activeSection,
  onSelectSection,
}: Props) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Dark backdrop on mobile when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r flex flex-col transform ${open ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-200`}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Swasthya Chetna</div>
            <button
              onClick={() => navigate("/")}
              className="mt-1 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
            >
              <FaArrowLeft size={12} />
              Back to Home
            </button>
          </div>
          {/* Close button inside sidebar (mobile) */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
          <SidebarItem
            label="Overview"
            icon={<FaTachometerAlt />}
            active={activeSection === "overview"}
            onClick={() => {
              onSelectSection("overview");
              setOpen(false);
            }}
          />
          <SidebarItem
            label="My Events"
            icon={<FaCalendarAlt />}
            active={activeSection === "events"}
            onClick={() => {
              onSelectSection("events");
              setOpen(false);
            }}
          />
          <SidebarItem
            label="Attendees"
            icon={<FaUsers />}
            active={activeSection === "attendees"}
            onClick={() => {
              onSelectSection("attendees");
              setOpen(false);
            }}
          />
          <SidebarItem
            label="My Profile"
            icon={<FaUserCircle />}
            active={activeSection === "profile"}
            onClick={() => {
              onSelectSection("profile");
              setOpen(false);
            }}
          />
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b">
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <FaBars size={20} />
          </button>
          <span className="font-semibold text-gray-800">Organizer Dashboard</span>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-md cursor-pointer text-sm font-medium transition-colors ${active
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-gray-100"
      }`}
  >
    {icon}
    {label}
  </div>
);

export default OrganizerLayout;
