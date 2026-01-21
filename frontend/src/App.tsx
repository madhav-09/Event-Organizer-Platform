import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MyBookings from "./pages/MyBookings";
import MyEvents from "./pages/MyEvents";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import CreateEvent from "./pages/CreateEvent";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./layout/PublicLayout";
import ApplyOrganizer from "./pages/ApplyOrganizer";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />

      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />

        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/apply-organizer" element={<ApplyOrganizer />} />

      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/organizer/events" element={<MyEvents />} />


      {/* Admin */}
      <Route
        path="/admin/*" // Use a wildcard to catch all sub-paths under /admin
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/organizer/events" element={<MyEvents />} />

      {/* Organizer */}
      <Route
        path="/organizer/dashboard/*"
        element={
          <ProtectedRoute role="ORGANIZER">
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
