import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { Save, Trash2, ArrowLeft, Info, Calendar, Image as ImageIcon } from "lucide-react";
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

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent animate-spin rounded-full" />
    </div>
  );

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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="font-heading font-black text-3xl text-white">Edit Event</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={del}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Event
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Basic Details" icon={<Info className="w-4 h-4" />}>
              <Input label="Event Title" value={event.title} onChange={(v: string) => setEvent({ ...event, title: v })} placeholder="e.g. Annual Music Festival" />
              <Textarea label="Event Description" value={event.description} onChange={(v: string) => setEvent({ ...event, description: v })} placeholder="Tell us about your event..." />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Category" value={event.category} onChange={(v: string) => setEvent({ ...event, category: v })} placeholder="e.g. Music" />
                <Input label="Event Type" value={event.type} onChange={(v: string) => setEvent({ ...event, type: v })} placeholder="ONLINE / OFFLINE" />
              </div>
              <Input label="Tags (comma-separated)" value={event.tags?.join(", ") ?? ""} onChange={(v: string) => setEvent({ ...event, tags: v.split(",").map((t: string) => t.trim()).filter(Boolean) })} placeholder="music, live, concert" />
            </FormSection>

            <FormSection title="Date & Venue" icon={<Calendar className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-4">
                <Input type="datetime-local" label="Starts" value={event.start_date} onChange={(v: string) => setEvent({ ...event, start_date: v })} />
                <Input type="datetime-local" label="Ends" value={event.end_date} onChange={(v: string) => setEvent({ ...event, end_date: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" value={event.city} onChange={(v: string) => setEvent({ ...event, city: v })} />
                <Input label="Venue / Platform" value={event.venue} onChange={(v: string) => setEvent({ ...event, venue: v })} />
              </div>
            </FormSection>
          </div>

          {/* Sidebar Form */}
          <div className="space-y-6">
            <FormSection title="Visuals & Visibility" icon={<ImageIcon className="w-4 h-4" />}>
              <Input label="Banner URL" value={event.banner_url || ""} onChange={(v: string) => setEvent({ ...event, banner_url: v })} placeholder="https://..." />
              {event.banner_url && (
                <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <img src={event.banner_url} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                <select
                  className="input-glass w-full text-sm py-2.5 bg-surface-900"
                  value={event.status}
                  onChange={(e) => setEvent({ ...event, status: e.target.value })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </FormSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, icon, children }: any) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-5 border-white/5 shadow-glow">
      <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20">
          {icon}
        </div>
        <h2 className="font-heading font-bold text-sm text-white uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-glass w-full text-sm py-2.5"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className="input-glass w-full text-sm py-3 resize-none"
      />
    </div>
  );
}
