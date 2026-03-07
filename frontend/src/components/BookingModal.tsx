import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

interface Ticket {
  id: string;
  title: string;
  price: number;
  quantity: number;
  sold: number;
}

interface Props {
  ticket: Ticket;
  eventId: string;
  onClose: () => void;
}

export default function BookingModal({ ticket, eventId, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const available = ticket.quantity - ticket.sold;
  const total = qty * ticket.price;

  const handleBooking = async () => {
    try {
      setLoading(true);

      // ✅ FIX: send event_id + status
      const bookingRes = await api.post("/bookings/", {
        event_id: eventId,
        ticket_id: ticket.id,
        quantity: qty,
        status: "PENDING",
      });

      const bookingId = bookingRes.data.booking_id;

      const orderRes = await api.post(
        `/payments/create-order/${bookingId}`
      );

      const options = {
        key: orderRes.data.key,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Event Booking",
        description: ticket.title,
        order_id: orderRes.data.order_id,
        handler: async (response: any) => {
          await api.post("/payments/verify", {
            booking_id: bookingId,
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });

          toast.success("Booking confirmed! Check your email for tickets.");
          onClose();
        },
      };

      // @ts-ignore
      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      toast.error("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-bold">{ticket.title}</h2>

        <p>
          ₹{ticket.price} × {qty} = <b>₹{total}</b>
        </p>

        <div className="flex items-center gap-3">
          <label>Quantity</label>
          <input
            type="number"
            min={1}
            max={available}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="border px-3 py-1 rounded w-20"
          />
          <span className="text-sm text-gray-500">
            {available} left
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleBooking}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Processing..." : "Pay & Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
