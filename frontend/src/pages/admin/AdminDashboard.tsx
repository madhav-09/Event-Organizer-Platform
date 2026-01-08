import { Routes, Route } from "react-router-dom";
import AdminEvents from "./Events";
import Organizers from "./Organizers";
import UsersList from "./UsersList";

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/organizers" element={<Organizers />} />
      <Route path="/admin/users" element={<UsersList />} />
    </Routes>
  );
}

export default AdminRoutes;
