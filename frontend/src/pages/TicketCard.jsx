import { useState } from "react";
import api from "../api/axios";

const TicketCard = ({ ticket }) => {
  const [qty, setQty] = useState(1);

  const book = async () => {
    const res = await api.post("/bookings", {
      ticket_id: ticket._id,
      quantity: qty
    });

    alert("Booking created. Proceed to payment.");
    console.log(res.data);
  };

  return (
    <div>
      <h4>{ticket.title}</h4>
      <p>₹{ticket.price}</p>
      <input
        type="number"
        min="1"
        value={qty}
        onChange={e => setQty(e.target.value)}
      />
      <button onClick={book}>Book</button>
    </div>
  );
};

export default TicketCard;
