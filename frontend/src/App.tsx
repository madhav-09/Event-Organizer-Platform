import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import CreateEvent from "./pages/CreateEvent";
import ApplyOrganizer from "./pages/ApplyOrganizer";

import MyBookings from "./pages/MyBookings";
import MyEvents from "./pages/MyEvents";

import OrganizerDashboard from "./pages/OrganizerDashboard";
import ManageEvent from "./pages/organizer/ManageEvent";
import EditEvent from "./pages/organizer/EditEvent";
import EventBookings from "./pages/organizer/EventBookings";

import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./layout/PublicLayout";

const App = () => {
  const { user } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            borderRadius: "12px",
            padding: "14px 18px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#f1f5f9" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" },
          },
        }}
      />
    <Routes>
      {/* ================= AUTH ================= */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />

      {/* ================= PUBLIC ================= */}
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

      {/* ================= USER ================= */}
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* ================= ORGANIZER ================= */}
      <Route
        path="/organizer/events"
        element={
          <ProtectedRoute role="ORGANIZER">
            <MyEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/events/:id"
        element={
          <ProtectedRoute role="ORGANIZER">
            <ManageEvent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/events/:id/edit"
        element={
          <ProtectedRoute role="ORGANIZER">
            <EditEvent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/dashboard/*"
        element={
          <ProtectedRoute role="ORGANIZER">
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/events/:eventId/bookings"
        element={<EventBookings />}
      />


      {/* ================= ADMIN ================= */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </>
  );
};

export default App;
