import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* ================= TYPES ================= */

type EventStatus = "DRAFT" | "PUBLISHED";
type EventType = "ONLINE" | "OFFLINE" | "HYBRID";

interface CreateEventPayload {
  organizer_id: string;
  title: string;
  short_description: string;
  description: string;
  category: string;
  tags: string[];
  type: EventType;
  city: string;
  venue: string;
  online_link?: string;
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

const createEvent = (payload: CreateEventPayload) =>
  api.post<{ event_id: string }>("/events/", payload);

const createTicket = (payload: CreateTicketPayload) =>
  api.post("/tickets/", payload);

/* ================= COMPONENT ================= */

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isFree, setIsFree] = useState(true);

  const [eventData, setEventData] = useState<
    Omit<CreateEventPayload, "banner_url" | "status">
  >({
    organizer_id: user?.id || "",
    title: "",
    short_description: "",
    description: "",
    category: "",
    tags: [],
    type: "ONLINE",
    city: "",
    venue: "",
    online_link: "",
    start_date: "",
    end_date: "",
  });

  const [ticket, setTicket] = useState<Omit<CreateTicketPayload, "event_id">>({
    title: "General Admission",
    price: 0,
    quantity: 100,
  });

  /* ================= VALIDATION ================= */

  const canGoNext = useMemo(() => {
    if (step === 1)
      return (
        eventData.title.trim() &&
        eventData.short_description.trim() &&
        eventData.category
      );

    if (step === 2) {
      if (!eventData.start_date || !eventData.end_date) return false;
      if (new Date(eventData.end_date) <= new Date(eventData.start_date))
        return false;

      if (eventData.type !== "ONLINE" && !eventData.venue.trim())
        return false;

      if (eventData.type !== "OFFLINE" && !eventData.online_link?.trim())
        return false;

      return !!eventData.city.trim();
    }

    if (step === 3) {
      if (!ticket.title.trim()) return false;
      if (ticket.quantity <= 0) return false;
      if (!isFree && ticket.price <= 0) return false;
      return true;
    }

    if (step === 4) return !!image;

    return true;
  }, [step, eventData, ticket, isFree, image]);

  /* ================= IMAGE UPLOAD ================= */

  const uploadImage = async (): Promise<string> => {
    if (!image) return "";
    const fd = new FormData();
    fd.append("file", image);
    const res = await api.post<{ url: string }>("/upload", fd);
    return res.data.url;
  };

  /* ================= SUBMIT ================= */

  const handlePublish = async () => {
    try {
      setLoading(true);
      setError(null);

      const banner_url = await uploadImage();

      const eventRes = await createEvent({
        ...eventData,
        banner_url,
        status: "PUBLISHED",
      });

      await createTicket({
        event_id: eventRes.data.event_id,
        ...ticket,
        price: isFree ? 0 : ticket.price,
      });

      navigate(`/event/${eventRes.data.event_id}`);
    } catch {
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6">
          Create Event
        </h1>

        <Stepper step={step} />

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <Section title="Event Basics">
            <Label text="Event Title" required />
            <Input
              placeholder="Eg: Startup Pitch Night Pune"
              value={eventData.title}
              onChange={(v) =>
                setEventData({ ...eventData, title: v })
              }
            />
            <Hint text="Shown on event cards and search results" />

            <Label text="Short Description" required />
            <Input
              placeholder="One-line summary (max 120 characters)"
              value={eventData.short_description}
              onChange={(v) =>
                setEventData({
                  ...eventData,
                  short_description: v,
                })
              }
            />

            <Label text="Detailed Description" />
            <Textarea
              placeholder="Describe the event, agenda, speakers, rules, etc."
              value={eventData.description}
              onChange={(v) =>
                setEventData({ ...eventData, description: v })
              }
            />

            <Label text="Category" required />
            <Select
              value={eventData.category}
              onChange={(v) =>
                setEventData({ ...eventData, category: v })
              }
              options={["Music", "Comedy", "Workshop", "Conference"]}
            />

            <Label text="Tags" />
            <Input
              placeholder="startup, networking, tech"
              onChange={(v) =>
                setEventData({
                  ...eventData,
                  tags: v.split(",").map((t) => t.trim()),
                })
              }
            />
            <Hint text="Helps improve event discoverability" />
          </Section>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Section title="Date & Location">
            <Label text="Start Date & Time" required />
            <Input
              type="datetime-local"
              onChange={(v) =>
                setEventData({ ...eventData, start_date: v })
              }
            />

            <Label text="End Date & Time" required />
            <Input
              type="datetime-local"
              onChange={(v) =>
                setEventData({ ...eventData, end_date: v })
              }
            />

            <Label text="Event Type" />
            <Select
              value={eventData.type}
              onChange={(v) =>
                setEventData({
                  ...eventData,
                  type: v as EventType,
                })
              }
              options={["ONLINE", "OFFLINE", "HYBRID"]}
            />

            {eventData.type !== "ONLINE" && (
              <>
                <Label text="Venue" required />
                <Input
                  placeholder="Venue name & address"
                  value={eventData.venue}
                  onChange={(v) =>
                    setEventData({ ...eventData, venue: v })
                  }
                />
              </>
            )}

            {eventData.type !== "OFFLINE" && (
              <>
                <Label text="Online Event Link" required />
                <Input
                  placeholder="Zoom / Google Meet / YouTube link"
                  value={eventData.online_link}
                  onChange={(v) =>
                    setEventData({
                      ...eventData,
                      online_link: v,
                    })
                  }
                />
              </>
            )}

            <Label text="City" required />
            <Input
              placeholder="Eg: Pune"
              value={eventData.city}
              onChange={(v) =>
                setEventData({ ...eventData, city: v })
              }
            />
          </Section>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Section title="Tickets & Pricing">
            <div className="flex gap-2 mb-6">
              {["Free", "Paid"].map((t) => (
                <button
                  key={t}
                  onClick={() => setIsFree(t === "Free")}
                  className={`flex-1 py-2 rounded-lg font-medium ${(t === "Free") === isFree
                      ? "bg-blue-600 text-white"
                      : "border bg-white"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Label text="Ticket Name" required />
            <Input
              value={ticket.title}
              onChange={(v) =>
                setTicket({ ...ticket, title: v })
              }
            />

            {!isFree && (
              <>
                <Label text="Price (₹)" required />
                <Input
                  type="number"
                  value={ticket.price}
                  onChange={(v) =>
                    setTicket({
                      ...ticket,
                      price: Number(v),
                    })
                  }
                />
              </>
            )}

            <Label text="Total Quantity" required />
            <Input
              type="number"
              value={ticket.quantity}
              onChange={(v) =>
                setTicket({
                  ...ticket,
                  quantity: Number(v),
                })
              }
            />
          </Section>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <Section title="Event Banner">
            <div className="border-2 border-dashed rounded-xl p-6 text-center">
              <input
                type="file"
                hidden
                id="event-image"
                onChange={(e) =>
                  setImage(e.target.files?.[0] || null)
                }
              />
              <label
                htmlFor="event-image"
                className="cursor-pointer text-blue-600 font-medium"
              >
                Upload Event Banner (16:9 recommended)
              </label>

              {image && (
                <img
                  src={URL.createObjectURL(image)}
                  className="mt-6 rounded-xl max-h-64 mx-auto"
                />
              )}
            </div>
          </Section>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 sm:mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-full sm:w-auto px-6 py-3 border rounded-lg"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext}
              className="w-full sm:w-auto ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={loading || !canGoNext}
              className="w-full sm:w-auto ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
            >
              {loading ? "Publishing..." : "Publish Event"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Stepper({ step }: { step: number }) {
  const steps = ["Basics", "Location", "Tickets", "Media"];
  return (
    <div className="flex justify-between mb-8 sm:mb-10 text-xs sm:text-sm overflow-x-auto">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`flex-1 text-center min-w-0 px-1 ${step === i + 1
              ? "font-semibold text-blue-600"
              : "text-gray-400"
            }`}
        >
          <span className="hidden xs:inline">{i + 1}. </span>{s}
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Label({
  text,
  required,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <label className="block font-medium mb-1">
      {text} {required && <span className="text-red-600">*</span>}
    </label>
  );
}

function Hint({ text }: { text: string }) {
  return <p className="text-sm text-gray-500 mb-4">{text}</p>;
}

function Input({ onChange, ...props }: any) {
  return (
    <input
      {...props}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mb-4 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    />
  );
}

function Textarea({ onChange, ...props }: any) {
  return (
    <textarea
      {...props}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mb-4 border p-3 rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
    />
  );
}

function Select({ value, onChange, options }: any) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mb-4 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value="">Select</option>
      {options.map((o: string) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
