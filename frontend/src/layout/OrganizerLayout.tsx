import { ReactNode, useState } from "react";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaArrowLeft,
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
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Mobile menu */}
      <div className="md:hidden p-4 bg-white border-b">
        <button onClick={() => setOpen(!open)}>
          {open ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform`}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b">
          <div className="text-lg font-semibold">Swasthya Chetna</div>
          <button
            onClick={() => navigate("/")}
            className="mt-2 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
          >
            <FaArrowLeft size={12} />
            Back to Home
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-1">
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
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
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
    className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer text-sm font-medium ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    {icon}
    {label}
  </div>
);

export default OrganizerLayout;
