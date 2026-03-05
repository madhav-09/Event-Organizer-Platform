import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { FaSave, FaTrash } from "react-icons/fa";
import Breadcrumbs from "../../components/Breadcrumbs";
import toast from "react-hot-toast";

interface EventForm {
  title: string;
  description: string;
  category: string;
  tags: string[];
  type: string;
  start_date: string;
  end_date: string;
  city: string;
  venue: string;
  banner_url?: string;
  status?: string;
}

function toDateTimeLocal(isoOrDateTime: string): string {
  if (!isoOrDateTime) return "";
  try {
    const d = new Date(isoOrDateTime);
    if (Number.isNaN(d.getTime())) return isoOrDateTime;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return isoOrDateTime;
  }
}

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    api.get(`/events/${id}`)
      .then((res) => {
        setEvent({
          title: res.data.title ?? "",
          description: res.data.description ?? "",
          category: res.data.category ?? "",
          tags: res.data.tags ?? [],
          type: res.data.type ?? "OFFLINE",
          start_date: toDateTimeLocal(res.data.start_date),
          end_date: toDateTimeLocal(res.data.end_date),
          city: res.data.city ?? "",
          venue: res.data.venue ?? "",
          banner_url: res.data.banner_url ?? "",
          status: res.data.status ?? "DRAFT",
        });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.detail || "Failed to load event");
      });
  }, [id]);

  if (!event) return <p className="p-6">Loading...</p>;

  const save = async () => {
    setSaving(true);
    try {
      if (!id) return;
      await api.put(`/events/${id}`,
        {
          title: event.title,
          description: event.description,
          category: event.category,
          tags: event.tags,
          type: event.type,
          start_date: event.start_date ? new Date(event.start_date).toISOString() : undefined,
          end_date: event.end_date ? new Date(event.end_date).toISOString() : undefined,
          city: event.city,
          venue: event.venue,
          banner_url: event.banner_url,
          status: event.status,
        }
      );
      toast.success("Event updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/events/${id}`);
    navigate("/organizer/events");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: "My Events", to: "/organizer/events" },
          { label: "Manage Event", to: `/organizer/events/${id}` },
          { label: "Edit Event" },
        ]}
      />

      <h1 className="text-3xl font-bold">Edit Event</h1>

      <Section title="Basic Info">
        <Input label="Title" value={event.title} onChange={(v) => setEvent({ ...event, title: v })} />
        <Textarea label="Description" value={event.description} onChange={(v) => setEvent({ ...event, description: v })} />
        <Input label="Category" value={event.category} onChange={(v) => setEvent({ ...event, category: v })} />
        <Input label="Tags (comma-separated)" value={event.tags?.join(", ") ?? ""} onChange={(v) => setEvent({ ...event, tags: v.split(",").map(t => t.trim()).filter(Boolean) })} />
        <Input label="Type (ONLINE/OFFLINE/HYBRID)" value={event.type} onChange={(v) => setEvent({ ...event, type: v })} />
      </Section>

      <Section title="Date & Location">
        <Input type="datetime-local" label="Start Date" value={event.start_date} onChange={(v) => setEvent({ ...event, start_date: v })} />
        <Input type="datetime-local" label="End Date" value={event.end_date} onChange={(v) => setEvent({ ...event, end_date: v })} />
        <Input label="City" value={event.city} onChange={(v) => setEvent({ ...event, city: v })} />
        <Input label="Venue" value={event.venue} onChange={(v) => setEvent({ ...event, venue: v })} />
        <Input label="Banner URL" value={event.banner_url || ""} onChange={(v) => setEvent({ ...event, banner_url: v })} />
        <Input label="Status (DRAFT/PUBLISHED)" value={event.status || ""} onChange={(v) => setEvent({ ...event, status: v })} />
      </Section>

      <div className="flex justify-between">
        <button
          onClick={del}
          className="bg-red-600 text-white px-5 py-2 rounded"
        >
          <FaTrash /> Delete
        </button>

        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          <FaSave /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

/* UI helpers */

function Section({ title, children }: any) {
  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="font-semibold text-xl">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}
