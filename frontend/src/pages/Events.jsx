import { useEffect, useState } from "react";
import api from "../api/axios";

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/events").then(res => setEvents(res.data));
  }, []);

  return (
    <>
      <h1>Events</h1>
      {events.map(e => (
        <div key={e._id}>
          <h3>{e.title}</h3>
          <p>{e.description}</p>
        </div>
      ))}
    </>
  );
};

export default Events;
