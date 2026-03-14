import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Ticket, X, Loader2, ChevronDown } from 'lucide-react';
import {
  getMyEvents,
  getTicketsByEvent,
  createTicket as apiCreateTicket,
  updateTicket as apiUpdateTicket,
  deleteTicket as apiDeleteTicket,
} from '../../services/api';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BackendTicket {
  _id: string;
  event_id: string;
  title: string;
  price: number;
  quantity: number;
  sold: number;
  created_at?: string;
}

interface OrgEvent {
  event_id: string;
  title: string;
}

interface TicketForm {
  title: string;
  price: number;
  quantity: number;
}

const EMPTY_FORM: TicketForm = { title: '', price: 0, quantity: 100 };

const ACCENT_COLORS = [
  { bg: 'rgba(108,71,236,0.15)', border: 'rgba(108,71,236,0.3)', text: '#c4b5fd' },
  { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Tickets() {
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [tickets, setTickets] = useState<BackendTicket[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BackendTicket | null>(null);
  const [form, setForm] = useState<TicketForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ─── Load Events ──────────────────────────────────────────────────────────

  useEffect(() => {
    getMyEvents()
      .then((evts: OrgEvent[]) => {
        setEvents(evts);
        if (evts.length > 0) setSelectedEventId(evts[0].event_id);
      })
      .catch(() => toast.error('Failed to load your events'))
      .finally(() => setEventsLoading(false));
  }, []);

  // ─── Load Tickets when event changes ──────────────────────────────────────

  const loadTickets = useCallback(async (eventId: string) => {
    if (!eventId) { setTickets([]); return; }
    setTicketsLoading(true);
    try {
      const data = await getTicketsByEvent(eventId);
      setTickets(data ?? []);
    } catch {
      toast.error('Failed to load tickets');
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) loadTickets(selectedEventId);
  }, [selectedEventId, loadTickets]);

  // ─── Modal helpers ────────────────────────────────────────────────────────

  const openAdd = () => {
    if (!selectedEventId) { toast.error('Please select an event first'); return; }
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (t: BackendTicket) => {
    setEditing(t);
    setForm({ title: t.title, price: t.price, quantity: t.quantity });
    setShowModal(true);
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Ticket name is required'); return; }
    if (form.price < 0) { toast.error('Price must be 0 or more'); return; }
    if (form.quantity < 1) { toast.error('Quantity must be at least 1'); return; }
    if (!selectedEventId) { toast.error('No event selected'); return; }

    setSaving(true);
    try {
      if (editing) {
        // update requires event_id in the payload (backend re-validates ownership)
        await apiUpdateTicket(editing._id, {
          event_id: editing.event_id,
          title: form.title,
          price: form.price,
          quantity: form.quantity,
        });
        toast.success('Ticket type updated!');
        setTickets(prev => prev.map(t =>
          t._id === editing._id
            ? { ...t, title: form.title, price: form.price, quantity: form.quantity }
            : t
        ));
      } else {
        await apiCreateTicket({
          event_id: selectedEventId,
          title: form.title.trim(),
          price: form.price,
          quantity: form.quantity,
        });
        toast.success('Ticket type created!');
        // Refresh full list to get the real _id
        await loadTickets(selectedEventId);
      }
      setShowModal(false);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d?.msg ?? String(d)).join(', ')
        : (typeof detail === 'string' ? detail : 'Failed to save ticket');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: BackendTicket) => {
    if (!confirm(`Delete ticket type "${t.title}"? This cannot be undone.`)) return;
    setDeleting(t._id);
    try {
      await apiDeleteTicket(t._id);
      setTickets(prev => prev.filter(x => x._id !== t._id));
      toast.success('Ticket type deleted');
    } catch {
      toast.error('Failed to delete ticket');
    } finally {
      setDeleting(null);
    }
  };

  // ─── Stats ───────────────────────────────────────────────────────────────

  const totalSold = tickets.reduce((a, t) => a + (t.sold || 0), 0);
  const totalCapacity = tickets.reduce((a, t) => a + t.quantity, 0);
  const totalRevenue = tickets.reduce((a, t) => a + t.price * (t.sold || 0), 0);

  const selectedEvent = events.find(e => e.event_id === selectedEventId);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl text-[var(--text-primary)]">Ticket Types</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">Manage ticket tiers and pricing for each event</p>
        </div>
        <button onClick={openAdd} disabled={!selectedEventId || eventsLoading}
          className="btn-primary text-sm px-4 py-2.5 disabled:opacity-40 disabled:transform-none">
          <Plus className="w-4 h-4" />
          Add Ticket Type
        </button>
      </div>

      {/* Event Selector */}
      <div className="glass-card rounded-2xl px-5 py-4">
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Select Event
        </label>
        {eventsLoading ? (
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading events…
          </div>
        ) : events.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-sm">No events found. Create an event first.</p>
        ) : (
          <div className="relative w-full max-w-xs">
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="input-glass w-full text-sm py-2.5 pr-9 appearance-none"
            >
              {events.map(ev => (
                <option key={ev.event_id} value={ev.event_id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {ev.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sold', value: ticketsLoading ? '—' : totalSold, accent: 'rgba(108,71,236,0.15)', border: 'rgba(108,71,236,0.25)' },
          { label: 'Total Capacity', value: ticketsLoading ? '—' : totalCapacity, accent: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.25)' },
          { label: 'Revenue', value: ticketsLoading ? '—' : `₹${totalRevenue.toLocaleString('en-IN')}`, accent: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.25)' },
        ].map(({ label, value, accent, border }) => (
          <div key={label} className="glass-card rounded-2xl px-5 py-4"
            style={{ background: accent, borderColor: border }}>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black text-[var(--text-primary)] font-heading">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--glass-border)' }}>
          <Ticket className="w-4 h-4 text-brand-400" />
          <h3 className="font-heading font-bold text-[var(--text-primary)]">
            Ticket Types {selectedEvent ? `— ${selectedEvent.title}` : ''}
          </h3>
        </div>

        {!selectedEventId ? (
          <div className="py-16 text-center">
            <ChevronDown className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)] text-sm">Select an event above to see its ticket types</p>
          </div>
        ) : ticketsLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-[var(--text-muted)]">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <span className="text-sm">Loading tickets…</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-primary)] text-sm font-medium mb-1">No ticket types yet</p>
            <p className="text-[var(--text-secondary)] text-xs">Click "Add Ticket Type" to create your first one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  {['Ticket Name', 'Price', 'Sold / Total', 'Progress', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => {
                  const sold = t.sold || 0;
                  const pct = t.quantity > 0 ? Math.min(100, Math.round((sold / t.quantity) * 100)) : 0;
                  const ac = ACCENT_COLORS[i % ACCENT_COLORS.length];
                  return (
                    <tr key={t._id} className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: i < tickets.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>

                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: ac.bg, border: `1px solid ${ac.border}` }}>
                            <Ticket className="w-3.5 h-3.5" style={{ color: ac.text }} />
                          </div>
                          <span className="font-semibold text-[var(--text-primary)]">{t.title}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 font-bold text-brand-300">
                        {t.price === 0 ? (
                          <span className="text-emerald-400 font-bold">Free</span>
                        ) : (
                          `₹${t.price.toLocaleString('en-IN')}`
                        )}
                      </td>

                      {/* Sold / Total */}
                      <td className="px-5 py-4 text-[var(--text-secondary)]">{sold} / {t.quantity}</td>

                      {/* Progress */}
                      <td className="px-5 py-4 w-36">
                        <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--glass-hover)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: ac.text }} />
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{pct}% sold</p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(t)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-300 hover:bg-blue-500/10 transition-colors border border-blue-500/20"
                            title="Edit">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t)}
                            disabled={deleting === t._id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
                            style={{ background: 'var(--glass-hover)' }}
                            title="Delete">
                            {deleting === t._id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Modal ─────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(108,71,236,0.2)', border: '1px solid rgba(108,71,236,0.3)' }}>
                  <Ticket className="w-4 h-4 text-brand-400" />
                </div>
                <h3 className="font-heading font-bold text-[var(--text-primary)] text-lg">
                  {editing ? 'Edit Ticket Type' : 'Add Ticket Type'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                style={{ background: 'var(--glass-hover)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event context */}
            {selectedEvent && (
              <div className="rounded-xl px-3 py-2 text-xs text-[var(--text-secondary)]"
                style={{ background: 'var(--glass-hover)', border: '1px solid var(--glass-border)' }}>
                📅 Event: <span className="text-[var(--text-primary)] font-semibold">{selectedEvent.title}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Ticket Name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Ticket Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP Pass, General Admission"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input-glass w-full text-sm py-2.5"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Price (₹) — enter 0 for free
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 499"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="input-glass w-full text-sm py-2.5"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Total Quantity *
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 100"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  className="input-glass w-full text-sm py-2.5"
                />
              </div>

              {/* Preview */}
              {form.title && (
                <div className="rounded-xl p-3.5" style={{ background: 'rgba(108,71,236,0.08)', border: '1px solid rgba(108,71,236,0.2)' }}>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Preview</p>
                  <p className="text-sm text-[var(--text-primary)] font-semibold">
                    <span className="text-brand-300">{form.title || '—'}</span>
                    {' — '}
                    <span className="text-emerald-400">{form.price === 0 ? 'Free' : `₹${form.price.toLocaleString('en-IN')}`}</span>
                    <span className="text-[var(--text-muted)] font-normal"> · {form.quantity} seats</span>
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                style={{ background: 'var(--glass-hover)', border: '1px solid var(--glass-border)' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.title.trim()}
                className="flex-1 btn-primary justify-center py-2.5 text-sm disabled:opacity-50 disabled:transform-none">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : (editing ? 'Save Changes' : 'Add Ticket')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
