import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get(`/events/${id}`).then(res => setEvent(res.data));
    api.get(`/tickets/event/${id}`).then(res => setTickets(res.data));
  }, [id]);

  if (!event) return <p>Loading...</p>;

  return (
    <>
      <h2>{event.title}</h2>
      <p>{event.description}</p>

      <h3>Tickets</h3>
      {tickets.map(t => (
        <TicketCard key={t._id} ticket={t} />
      ))}
    </>
  );
};

export default EventDetails;
