import { useEffect, useState } from "react";
import api from "../../services/api";

type Event = {
  _id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
};

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    api.get("/events").then(res => setEvents(res.data));
  }, []);

  const publish = async (id: string) => {
    await api.put(`/admin/events/${id}/publish`);
    setEvents(e =>
      e.map(ev =>
        ev._id === id ? { ...ev, status: "PUBLISHED" } : ev
      )
    );
  };

  return (
    <>
      <h2>Events</h2>

      {events.map(e => (
        <div key={e._id}>
          <h4>{e.title}</h4>
          <p>Status: {e.status}</p>
          {e.status !== "PUBLISHED" && (
            <button onClick={() => publish(e._id)}>Publish</button>
          )}
        </div>
      ))}
    </>
  );
};

export default AdminEvents;
