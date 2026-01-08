import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import CreateEvent from "./pages/CreateEvent";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./layout/PublicLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Organizers from "./pages/admin/Organizers";
import AdminEvents from "./pages/admin/Events";
import Analytics from "./pages/admin/Analytics";
import UsersList from "./pages/admin/UsersList";

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

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
       <Route path="/admin/users" element={<UsersList />} />
      <Route
        path="/admin/organizers"
        element={
          <ProtectedRoute role="ADMIN">
            <Organizers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute role="ADMIN">
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
};

export default App;
