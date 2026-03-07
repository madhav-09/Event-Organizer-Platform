import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Breadcrumbs from "../../components/Breadcrumbs";

interface Event {
  title: string;
  status: string;
  start_date: string;
  city: string;
  venue: string;
}

export default function ManageEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading event...</p>;
  if (!event)
    return <p className="p-6 text-red-500">Event not found</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: "My Events", to: "/organizer/events" },
          { label: "Manage Event" },
        ]}
      />

      <h1 className="text-3xl font-bold">{event.title}</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <Info label="Status" value={event.status} />
        <Info
          label="Start Date"
          value={new Date(event.start_date).toLocaleString()}
        />
        <Info
          label="Location"
          value={`${event.venue}, ${event.city}`}
        />

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => navigate(`/organizer/events/${id}/edit`)}
            className="px-5 py-2 bg-blue-600 text-white rounded"
          >
            Edit Event
          </button>

          <button
            onClick={() => navigate(`/event/${id}`)}
            className="px-5 py-2 bg-gray-100 rounded"
          >
            View Public Page
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
