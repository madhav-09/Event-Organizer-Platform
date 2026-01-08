import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";

type Event = {
  _id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
};

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events").then(res => {
      setEvents(res.data);
      setLoading(false);
    });
  }, []);

  const publish = async (id: string) => {
    await api.put(`/admin/events/${id}/publish`);
    setEvents(prev =>
      prev.map(e => (e._id === id ? { ...e, status: "PUBLISHED" } : e))
    );
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Events</h2>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No events available</p>
      ) : (
        <div className="space-y-4">
          {events.map(e => (
            <div
              key={e._id}
              className="border rounded-lg p-4 flex justify-between items-center bg-white shadow"
            >
              <div>
                <p className="font-semibold text-lg">{e.title}</p>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      e.status === "PUBLISHED"
                        ? "text-green-600 font-medium"
                        : "text-orange-600 font-medium"
                    }
                  >
                    {e.status}
                  </span>
                </p>
              </div>

              {e.status !== "PUBLISHED" && (
                <button
                  onClick={() => publish(e._id)}
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Publish
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEvents;
