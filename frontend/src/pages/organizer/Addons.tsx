import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Box, X, Loader2, ChevronDown, Image as ImageIcon } from 'lucide-react';
import {
  getMyEvents,
  getEventAddons,
  createEventAddon,
  deleteAddon as apiDeleteAddon,
} from '../../services/api';
import toast from 'react-hot-toast';

interface BackendAddon {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
  image_url?: string;
  created_at: string;
}

interface OrgEvent {
  event_id: string;
  title: string;
}

interface AddonForm {
  name: string;
  description: string;
  price: number;
  total_quantity: number;
  image_url: string;
}

const EMPTY_FORM: AddonForm = { name: '', description: '', price: 0, total_quantity: 50, image_url: '' };

const ACCENT_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd' },
  { bg: 'rgba(108,71,236,0.15)', border: 'rgba(108,71,236,0.3)', text: '#c4b5fd' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' },
];

export default function Addons() {
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [addons, setAddons] = useState<BackendAddon[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddonForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getMyEvents()
      .then((evts: OrgEvent[]) => {
        setEvents(evts);
        if (evts.length > 0) setSelectedEventId(evts[0].event_id);
      })
      .catch(() => toast.error('Failed to load your events'))
      .finally(() => setEventsLoading(false));
  }, []);

  const loadAddons = useCallback(async (eventId: string) => {
    if (!eventId) { setAddons([]); return; }
    setAddonsLoading(true);
    try {
      const data = await getEventAddons(eventId);
      setAddons(data ?? []);
    } catch {
      toast.error('Failed to load add-ons');
      setAddons([]);
    } finally {
      setAddonsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) loadAddons(selectedEventId);
  }, [selectedEventId, loadAddons]);

  const openAdd = () => {
    if (!selectedEventId) { toast.error('Please select an event first'); return; }
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (form.price < 0) { toast.error('Price must be 0 or more'); return; }
    if (!selectedEventId) { toast.error('No event selected'); return; }

    setSaving(true);
    try {
      await createEventAddon(selectedEventId, {
        ...form,
        name: form.name.trim(),
      });
      toast.success('Add-on created!');
      loadAddons(selectedEventId);
      setShowModal(false);
    } catch (e: any) {
      toast.error('Failed to save add-on');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addon: BackendAddon) => {
    if (!confirm(`Delete "${addon.name}"?`)) return;
    setDeleting(addon.id);
    try {
      await apiDeleteAddon(addon.id);
      setAddons(prev => prev.filter(x => x.id !== addon.id));
      toast.success('Add-on deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const selectedEvent = events.find(e => e.event_id === selectedEventId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl text-[var(--text-primary)]">Add-ons & Merch</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">Create and manage event merchandise, parking passes, or extras</p>
        </div>
        <button onClick={openAdd} disabled={!selectedEventId || eventsLoading}
          className="btn-primary text-sm px-4 py-2.5">
          <Plus className="w-4 h-4" />
          Create Add-on
        </button>
      </div>

      <div className="glass-card rounded-2xl px-5 py-4">
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Select Event
        </label>
        {eventsLoading ? (
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
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

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--glass-border)' }}>
          <Box className="w-4 h-4 text-brand-400" />
          <h3 className="font-heading font-bold text-[var(--text-primary)]">
            Available Add-ons {selectedEvent ? `— ${selectedEvent.title}` : ''}
          </h3>
        </div>

        {addonsLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-[var(--text-muted)]">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <span className="text-sm">Loading add-ons…</span>
          </div>
        ) : addons.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-secondary)]">
            <Box className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No items created for this event yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  {['Item', 'Price', 'Stock (Sold/Total)', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {addons.map((a, i) => (
                  <tr key={a.id} className="transition-colors hover:bg-[var(--glass-hover)] border-b border-[var(--glass-border)]">
                    <td className="px-5 py-4 font-semibold text-[var(--text-primary)]">{a.name}</td>
                    <td className="px-5 py-4 text-brand-300">₹{a.price}</td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">{a.sold_quantity} / {a.total_quantity}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleDelete(a)} disabled={deleting === a.id}
                        className="p-2 rounded-lg bg-[var(--glass-hover)] text-[var(--text-muted)] hover:text-red-400 transition-colors">
                        {deleting === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-5">
            <h3 className="font-heading font-bold text-[var(--text-primary)] text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-400" /> Create New Add-on
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 px-1">Item Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-glass w-full text-sm py-2.5" placeholder="e.g. Event T-Shirt" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 px-1">Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="input-glass w-full text-sm py-2.5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 px-1">Total Stock</label>
                  <input type="number" value={form.total_quantity} onChange={e => setForm(f => ({ ...f, total_quantity: Number(e.target.value) }))} className="input-glass w-full text-sm py-2.5" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 px-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-glass w-full text-sm py-2.5 h-20" placeholder="Size, color, inclusions..." />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-widest">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center py-2.5 text-xs font-black uppercase tracking-widest">
                {saving ? 'Creating...' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
