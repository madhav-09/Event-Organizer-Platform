import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { FaSave, FaTrash } from "react-icons/fa";
import Breadcrumbs from "../../components/Breadcrumbs";

interface EventForm {
  title: string;
  description: string;
  category: string;
  tags: string[];
  start_date: string;
  end_date: string;
  city: string;
  venue: string;
  online_link?: string;
}

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    api.get(`/events/${id}`).then((res) =>
      setEvent({
        ...res.data,
        tags: Array.isArray(res.data.tags) ? res.data.tags : [],
      })
    );
  }, [id]);

  if (!event) return <p className="p-6">Loading...</p>;

  const save = async () => {
    setSaving(true);
    await api.put(`/events/${id}`, event);
    setSaving(false);
    alert("Event updated");
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
        <Input
          label="Tags"
          value={event.tags.join(", ")}
          onChange={(v) =>
            setEvent({ ...event, tags: v.split(",").map((t) => t.trim()) })
          }
        />
      </Section>

      <Section title="Date & Location">
        <Input type="datetime-local" label="Start Date" value={event.start_date} onChange={(v) => setEvent({ ...event, start_date: v })} />
        <Input type="datetime-local" label="End Date" value={event.end_date} onChange={(v) => setEvent({ ...event, end_date: v })} />
        <Input label="City" value={event.city} onChange={(v) => setEvent({ ...event, city: v })} />
        <Input label="Venue" value={event.venue} onChange={(v) => setEvent({ ...event, venue: v })} />
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

function Input({ label, value, onChange, type = "text" }: any) {
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

function Textarea({ label, value, onChange }: any) {
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
