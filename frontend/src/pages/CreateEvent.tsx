import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* ================= TYPES ================= */

type EventStatus = "DRAFT" | "PUBLISHED";
type EventType = "ONLINE" | "OFFLINE" | "HYBRID";

interface CreateEventPayload {
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  type: EventType;
  city: string;
  venue: string;
  start_date: string;
  end_date: string;
  banner_url: string;
  status: EventStatus;
}

interface CreateTicketPayload {
  event_id: string;
  title: string;
  price: number;
  quantity: number;
}

/* ================= API ================= */

type CreateEventResponse = {
  event_id: string;
  message: string;

};

const createEvent = (payload: CreateEventPayload) =>
  api.post<CreateEventResponse>("/events/", payload);

const createTicket = (payload: CreateTicketPayload) =>
  api.post("/tickets/", payload);

/* ================= COMPONENT ================= */

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const [eventData, setEventData] = useState<
    Omit<CreateEventPayload, "banner_url" | "status">
  >({
    organizer_id: user!.id, // ✅ force ensured (user must be logged in)
    title: "",
    description: "",
    category: "",
    type: "ONLINE",
    city: "",
    venue: "",
    start_date: "",
    end_date: "",
  });

  const [ticket, setTicket] = useState<Omit<CreateTicketPayload, "event_id">>({
    title: "",
    price: 0,
    quantity: 0,
  });

  /* OPTIONAL image upload */
  const uploadImage = async (): Promise<string> => {
    if (!image) return "";
    const formData = new FormData();
    formData.append("file", image);

    const res = await api.post<{ url: string }>("/upload", formData);
    return res.data.url;
  };

  const handleSubmit = async (status: EventStatus) => {
    try {
      setLoading(true);

      const banner_url = image ? await uploadImage() : "";

      // 1️⃣ Create Event
      const eventRes = await createEvent({
        ...eventData,
        banner_url,
        status,
      });

      const eventId = eventRes.data.event_id;

      // 2️⃣ Create Ticket
      await createTicket({
        event_id: eventId,
        ...ticket,
      });

      navigate(`/events/${eventId}`);
    } catch (err) {
      console.error(err);
      alert("Event creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10">
          Create Your Event
        </h1>

        {/* BASIC INFO */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <input
            className="w-full mb-4 border p-3 rounded"
            placeholder="Event Title"
            value={eventData.title}
            onChange={(e) =>
              setEventData({ ...eventData, title: e.target.value })
            }
          />

          <textarea
            className="w-full mb-4 border p-3 rounded"
            placeholder="Description"
            value={eventData.description}
            onChange={(e) =>
              setEventData({ ...eventData, description: e.target.value })
            }
          />

          <select
            className="w-full mb-4 border p-3 rounded"
            value={eventData.category}
            onChange={(e) =>
              setEventData({ ...eventData, category: e.target.value })
            }
          >
            <option value="">Select Category</option>
            <option>Music</option>
            <option>Comedy</option>
            <option>Workshop</option>
            <option>Conference</option>
          </select>

          <select
            className="w-full border p-3 rounded"
            value={eventData.type}
            onChange={(e) =>
              setEventData({
                ...eventData,
                type: e.target.value as EventType,
              })
            }
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        {/* DATE & LOCATION */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <input
            type="datetime-local"
            className="w-full mb-4 border p-3 rounded"
            onChange={(e) =>
              setEventData({ ...eventData, start_date: e.target.value })
            }
          />

          <input
            type="datetime-local"
            className="w-full mb-4 border p-3 rounded"
            onChange={(e) =>
              setEventData({ ...eventData, end_date: e.target.value })
            }
          />

          <input
            className="w-full mb-4 border p-3 rounded"
            placeholder="Venue"
            value={eventData.venue}
            onChange={(e) =>
              setEventData({ ...eventData, venue: e.target.value })
            }
          />

          <input
            className="w-full border p-3 rounded"
            placeholder="City"
            value={eventData.city}
            onChange={(e) =>
              setEventData({ ...eventData, city: e.target.value })
            }
          />
        </div>

        {/* TICKET */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <input
            className="w-full mb-4 border p-3 rounded"
            placeholder="Ticket Title"
            value={ticket.title}
            onChange={(e) =>
              setTicket({ ...ticket, title: e.target.value })
            }
          />

          <input
            type="number"
            className="w-full mb-4 border p-3 rounded"
            placeholder="Price"
            value={ticket.price}
            onChange={(e) =>
              setTicket({ ...ticket, price: Number(e.target.value) })
            }
          />

          <input
            type="number"
            className="w-full border p-3 rounded"
            placeholder="Quantity"
            value={ticket.quantity}
            onChange={(e) =>
              setTicket({ ...ticket, quantity: Number(e.target.value) })
            }
          />
        </div>

        {/* IMAGE */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8 text-center">
          <input
            type="file"
            hidden
            id="event-image"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <label
            htmlFor="event-image"
            className="cursor-pointer text-blue-600"
          >
            Upload Event Image
          </label>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => handleSubmit("DRAFT")}
            className="px-6 py-3 border rounded"
          >
            Save as Draft
          </button>

          <button
            disabled={loading}
            onClick={() => handleSubmit("PUBLISHED")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded"
          >
            {loading ? "Publishing..." : "Publish Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
