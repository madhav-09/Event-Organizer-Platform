import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type Props = {
  children: ReactNode;
};

const AdminLayout = ({ children }: Props) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 text-xl font-bold border-b">Admin Panel</div>
        <nav className="p-4 space-y-2">
          <NavLink
            to="/admin/events"
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            Events
          </NavLink>
          <NavLink
            to="/admin/organizers"
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            Organizers
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            Users
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
