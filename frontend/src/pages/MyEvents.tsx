import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyEvents,
  getEventTickets,
  updateEvent,
  deleteEvent,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../services/api";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiUsers,
  FiTag,
  FiCalendar,
  FiMapPin,
  FiX,
  FiSave,
  FiCheck,
} from "react-icons/fi";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Shape returned by GET /organizers/me/events  */
interface OrgEvent {
  event_id: string;
  title: string;
  date: string;       // ISO string from Mongo
  location: string;   // city string
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  total_bookings: number;
}

/** Full event shape from GET /events/{id} — used in the edit modal */
interface FullEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  start_date: string;
  end_date: string;
  city: string;
  venue: string;
  status: string;
}

/** Ticket from GET /tickets/event/{id} */
interface Ticket {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  sold: number;
  event_id: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatDate(raw: any): string {
  if (!raw) return "—";
  // Handle Mongo datetime objects like { $date: "..." } or plain ISO strings
  const iso = typeof raw === "object" && raw.$date ? raw.$date : raw;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 hover:bg-white transition-colors";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyEvents() {
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<FullEvent | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    getMyEvents().then(setEvents).finally(() => setLoading(false));
  };

  const handleToggleStatus = async (ev: OrgEvent) => {
    const next = ev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await updateEvent(ev.event_id, { status: next });
    setEvents((prev) =>
      prev.map((e) => (e.event_id === ev.event_id ? { ...e, status: next } : e))
    );
    toast.success(`Event ${next === "PUBLISHED" ? "published" : "unpublished"}`);
  };

  const handleDelete = async (ev: OrgEvent) => {
    if (!confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    try {
      await deleteEvent(ev.event_id);
      setEvents((prev) => prev.filter((e) => e.event_id !== ev.event_id));
      toast.success("Event deleted");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const handleOpenEdit = async (ev: OrgEvent) => {
    setEditLoading(true);
    try {
      const res = await api.get(`/events/${ev.event_id}`);
      setEditingEvent(res.data);
    } catch {
      toast.error("Could not load event details");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveEdit = async (updated: FullEvent) => {
    await updateEvent(updated.id, {
      title: updated.title,
      description: updated.description,
      category: updated.category,
      tags: updated.tags,
      start_date: updated.start_date,
      end_date: updated.end_date,
      city: updated.city,
      venue: updated.venue,
    });
    // Sync the title in the list
    setEvents((prev) =>
      prev.map((e) =>
        e.event_id === updated.id ? { ...e, title: updated.title, location: updated.city } : e
      )
    );
    setEditingEvent(null);
    toast.success("Event updated");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mr-3" />
        Loading events…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {events.length} event{events.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <button
          onClick={() => navigate("/create-event")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <FiPlus size={16} /> New Event
        </button>
      </div>

      {/* No events */}
      {!events.length && (
        <div className="text-center py-20 text-gray-400">
          <FiCalendar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No events yet</p>
          <p className="text-sm mt-1">Click "New Event" to create your first one.</p>
        </div>
      )}

      {/* Event Cards */}
      <div className="space-y-4">
        {events.map((ev) => (
          <EventCard
            key={ev.event_id}
            event={ev}
            isExpanded={expandedId === ev.event_id}
            onToggleExpand={() =>
              setExpandedId(expandedId === ev.event_id ? null : ev.event_id)
            }
            onEdit={() => handleOpenEdit(ev)}
            onDelete={() => handleDelete(ev)}
            onToggleStatus={() => handleToggleStatus(ev)}
            onViewBookings={() => navigate(`/organizer/events/${ev.event_id}/bookings`)}
          />
        ))}
      </div>

      {/* Edit loading overlay */}
      {editLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl px-8 py-6 shadow-xl flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
            <span className="text-sm text-gray-700">Loading event…</span>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({
  event, isExpanded, onToggleExpand, onEdit, onDelete, onToggleStatus, onViewBookings,
}: {
  event: OrgEvent;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onViewBookings: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex flex-wrap items-start gap-3">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[event.status] ?? "bg-gray-100 text-gray-600"}`}>
                {event.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 truncate">{event.title}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FiCalendar size={12} /> {formatDate(event.date)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <FiMapPin size={12} /> {event.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FiUsers size={12} /> {event.total_bookings} booking{event.total_bookings !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onToggleStatus}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${event.status === "PUBLISHED"
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                }`}
            >
              {event.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </button>
            <button onClick={onViewBookings} title="View Bookings" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <FiEye size={16} />
            </button>
            <button onClick={onEdit} title="Edit Event" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <FiEdit2 size={16} />
            </button>
            <button onClick={onDelete} title="Delete Event" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <FiTrash2 size={16} />
            </button>
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
            >
              <FiTag size={13} /> Tickets {isExpanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <TicketManager eventId={event.event_id} />
        </div>
      )}
    </div>
  );
}

// ─── Ticket Manager ───────────────────────────────────────────────────────────

const BLANK_FORM = () => ({ title: "", price: 0, quantity: 100 });

function TicketManager({ eventId }: { eventId: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState(BLANK_FORM());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEventTickets(eventId).then(setTickets).finally(() => setLoading(false));
  }, [eventId]);

  const openAdd = () => { setEditingTicket(null); setForm(BLANK_FORM()); setShowForm(true); };
  const openEdit = (t: Ticket) => { setEditingTicket(t); setForm({ title: t.title, price: t.price, quantity: t.quantity }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Ticket name required"); return; }
    setSaving(true);
    try {
      if (editingTicket) {
        await updateTicket(editingTicket._id, { ...form, event_id: eventId });
        setTickets((prev) => prev.map((t) => t._id === editingTicket._id ? { ...t, ...form } : t));
        toast.success("Ticket updated");
      } else {
        await createTicket({ ...form, event_id: eventId });
        const fresh = await getEventTickets(eventId);
        setTickets(fresh);
        toast.success("Ticket added");
      }
      setShowForm(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to save ticket");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: Ticket) => {
    if (!confirm(`Delete ticket "${t.title}"?`)) return;
    await deleteTicket(t._id);
    setTickets((prev) => prev.filter((x) => x._id !== t._id));
    toast.success("Ticket deleted");
  };

  if (loading) return <p className="text-sm text-gray-400 py-2">Loading tickets…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Ticket Types ({tickets.length})</h3>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <FiPlus size={13} /> Add Ticket
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-indigo-100 rounded-xl p-4 space-y-3 shadow-sm">
          <p className="text-sm font-semibold text-gray-800">{editingTicket ? "Edit Ticket" : "New Ticket Type"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="text-xs text-gray-500 mb-1 block">Ticket Name *</label>
              <input className={inputCls} placeholder="e.g. General Admission, VIP, Early Bird" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Price (₹)</label>
              <input type="number" min={0} className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Total Quantity</label>
              <input type="number" min={1} className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <FiSave size={12} /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {!tickets.length && !showForm && (
        <p className="text-sm text-gray-400 py-2">No ticket types yet. Click "Add Ticket" to create one.</p>
      )}

      <div className="space-y-2">
        {tickets.map((t) => {
          const pct = t.quantity > 0 ? Math.min(100, Math.round(((t.sold ?? 0) / t.quantity) * 100)) : 0;
          return (
            <div key={t._id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-800">{t.title}</span>
                  <span className="text-xs text-indigo-600 font-bold">₹{t.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{t.sold ?? 0}/{t.quantity} sold</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(t)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Edit Event Modal ─────────────────────────────────────────────────────────

function EditEventModal({ event, onClose, onSave }: {
  event: FullEvent;
  onClose: () => void;
  onSave: (ev: FullEvent) => Promise<void>;
}) {
  const [form, setForm] = useState<FullEvent>({ ...event });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof FullEvent, val: any) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  // Convert ISO to datetime-local compatible string safely
  const toLocal = (iso: string) => {
    try { return new Date(iso).toISOString().slice(0, 16); } catch { return ""; }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Event</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><FiX size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <Section title="Basic Info">
            <Field label="Event Title">
              <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </Field>
            <Field label="Description">
              <textarea className={`${inputCls} resize-none`} rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <input className={inputCls} value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} />
              </Field>
              <Field label="Tags (comma-separated)">
                <input className={inputCls} value={form.tags?.join(", ") ?? ""} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
              </Field>
            </div>
          </Section>

          <Section title="Date & Location">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date & Time">
                <input type="datetime-local" className={inputCls} value={toLocal(form.start_date)} onChange={(e) => set("start_date", e.target.value)} />
              </Field>
              <Field label="End Date & Time">
                <input type="datetime-local" className={inputCls} value={toLocal(form.end_date)} onChange={(e) => set("end_date", e.target.value)} />
              </Field>
              <Field label="City">
                <input className={inputCls} value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="Venue">
                <input className={inputCls} value={form.venue ?? ""} onChange={(e) => set("venue", e.target.value)} />
              </Field>
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FiCheck size={15} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
