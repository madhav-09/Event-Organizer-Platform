import { useState, useEffect } from "react";
import api, { getEventAddons } from "../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaMinus, FaBoxOpen } from "react-icons/fa";

interface Ticket {
  id: string;
  title: string;
  price: number;
  quantity: number;
  sold: number;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
}

interface Props {
  ticket: Ticket;
  eventId: string;
  onClose: () => void;
}

export default function BookingModal({ ticket, eventId, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const data = await getEventAddons(eventId);
        setAddons(data);
      } catch (err) {
        console.error("Failed to fetch addons:", err);
      }
    };
    fetchAddons();
  }, [eventId]);

  const available = ticket.quantity - ticket.sold;

  const addonsTotal = Object.entries(selectedAddons).reduce((acc, [id, count]) => {
    const addon = addons.find(a => a.id === id);
    return acc + (addon ? addon.price * count : 0);
  }, 0);

  const total = (qty * ticket.price) + addonsTotal;

  const handleBooking = async () => {
    try {
      setLoading(true);

      const addonPayload = Object.entries(selectedAddons)
        .filter(([_, count]) => count > 0)
        .map(([id, count]) => ({ addon_id: id, quantity: count }));

      const bookingRes = await api.post("/bookings/", {
        event_id: eventId,
        ticket_id: ticket.id,
        quantity: qty,
        addons: addonPayload,
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
        description: `${ticket.title} ${addonPayload.length > 0 ? "+ Add-ons" : ""}`,
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

  const updateAddonQty = (id: string, delta: number) => {
    const addon = addons.find(a => a.id === id);
    if (!addon) return;

    setSelectedAddons(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(current + delta, addon.total_quantity - addon.sold_quantity));
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{ticket.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-600 font-medium">Ticket Price</p>
            <p className="text-lg font-bold text-blue-900">₹{ticket.price}</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-md shadow-sm border border-blue-100">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
            >
              <FaMinus size={12} />
            </button>
            <span className="font-bold w-6 text-center">{qty}</span>
            <button
              onClick={() => setQty(Math.min(available, qty + 1))}
              className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
            >
              <FaPlus size={12} />
            </button>
          </div>
        </div>

        {addons.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FaBoxOpen /> Add-ons / Merchandise
            </h3>
            <div className="space-y-2">
              {addons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{addon.name}</p>
                    <p className="text-sm text-green-600 font-medium">₹{addon.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateAddonQty(addon.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded border hover:bg-gray-100"
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="font-medium text-sm w-4 text-center">{selectedAddons[addon.id] || 0}</span>
                    <button
                      onClick={() => updateAddonQty(addon.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded border hover:bg-gray-100"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Amount</span>
            <span className="text-2xl font-black text-gray-900">₹{total}</span>
          </div>

          <button
            onClick={handleBooking}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : `Pay ₹${total} & Book`}
          </button>
        </div>
      </div>
    </div>
  );
}
