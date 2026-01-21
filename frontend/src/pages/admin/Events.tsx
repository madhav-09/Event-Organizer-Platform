import { useEffect, useState } from "react";
import api from "../../services/api";

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
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Events</h2>

      {loading ? (
        <p className="text-gray-600">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No events available</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{e.title}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span
                      className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        e.status === "PUBLISHED"
                          ? "text-green-900"
                          : "text-orange-900"
                      } `}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-0 opacity-50 rounded-full ${
                          e.status === "PUBLISHED"
                            ? "bg-green-200"
                            : "bg-orange-200"
                        }`}
                      ></span>
                      <span className="relative">{e.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {e.status !== "PUBLISHED" && (
                      <button
                        onClick={() => publish(e._id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        Publish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
