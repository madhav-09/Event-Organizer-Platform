import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, X, Loader2, Copy, CheckCheck, AlertCircle, Globe, Calendar } from 'lucide-react';
import {
  getOrganizerDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getMyEvents,
} from '../../services/api';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscountCode {
  _id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  applies_to_ticket: string;
  usage_limit: number;
  used_count: number;
  expires_at: string | null;
  event_id: string | null;
}

interface OrgEvent {
  event_id: string;
  title: string;
}

interface DiscountForm {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  applies_to_ticket: string;
  usage_limit: number;
  expires_at: string;
  event_id: string; // '' means global (all events)
}

const EMPTY_FORM: DiscountForm = {
  code: '',
  type: 'PERCENTAGE',
  value: 10,
  applies_to_ticket: 'ALL',
  usage_limit: 100,
  expires_at: '',
  event_id: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Discounts() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState<DiscountForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ─── Load data ─────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      getOrganizerDiscounts(),
      getMyEvents(),
    ]).then(([disc, evts]) => {
      setDiscounts(disc);
      setEvents(evts);
    }).catch(() => {
      toast.error('Failed to load discounts');
    }).finally(() => setLoading(false));
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const getEventTitle = (eventId: string | null) => {
    if (!eventId) return 'All Events';
    const ev = events.find(e => e.event_id === eventId);
    return ev ? ev.title : 'Specific Event';
  };

  const formatExpiry = (val: string | null) => {
    if (!val) return 'No expiry';
    try { return new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return val; }
  };

  const isExpired = (val: string | null) => {
    if (!val) return false;
    return new Date(val) < new Date();
  };

  // ─── Modal helpers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (d: DiscountCode) => {
    setEditing(d);
    // Convert ISO expiry to date-input friendly format (YYYY-MM-DD)
    const expires = d.expires_at ? d.expires_at.slice(0, 10) : '';
    setForm({
      code: d.code,
      type: d.type,
      value: d.value,
      applies_to_ticket: d.applies_to_ticket || 'ALL',
      usage_limit: d.usage_limit,
      expires_at: expires,
      event_id: d.event_id || '',
    });
    setShowModal(true);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error('Discount code is required'); return; }
    if (!form.value || form.value <= 0) { toast.error('Value must be greater than 0'); return; }
    if (form.type === 'PERCENTAGE' && form.value > 100) { toast.error('Percentage cannot exceed 100'); return; }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.value,
        applies_to_ticket: form.applies_to_ticket || 'ALL',
        usage_limit: form.usage_limit,
        expires_at: form.expires_at || undefined,
        event_id: form.event_id || null,
      };

      if (editing) {
        await updateDiscount(editing._id, payload);
        toast.success('Discount code updated!');
        setDiscounts(prev => prev.map(d =>
          d._id === editing._id ? {
            ...d,
            ...payload,
            expires_at: form.expires_at || null,
          } : d
        ));
      } else {
        const res = await createDiscount(payload);
        toast.success('Discount code created!');
        // Refresh list to get the real document with _id
        const fresh = await getOrganizerDiscounts();
        setDiscounts(fresh);
        void res;
      }

      setShowModal(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (d: DiscountCode) => {
    if (!confirm(`Delete discount code "${d.code}"? This cannot be undone.`)) return;
    setDeleting(d._id);
    try {
      await deleteDiscount(d._id);
      setDiscounts(prev => prev.filter(x => x._id !== d._id));
      toast.success('Discount code deleted');
    } catch {
      toast.error('Failed to delete discount');
    } finally {
      setDeleting(null);
    }
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const activeCount = discounts.filter(d => !isExpired(d.expires_at)).length;
  const totalUsed = discounts.reduce((a, d) => a + (d.used_count || 0), 0);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl text-white">Discount Codes</h1>
          <p className="text-slate-500 mt-1 text-sm">Create and manage promotional codes for your events</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm px-4 py-2.5">
          <Plus className="w-4 h-4" />
          Create Discount
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Codes', value: loading ? '—' : discounts.length, color: 'rgba(108,71,236,0.2)', border: 'rgba(108,71,236,0.3)' },
          { label: 'Active Codes', value: loading ? '—' : activeCount, color: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.3)' },
          { label: 'Total Redemptions', value: loading ? '—' : totalUsed, color: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.3)' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className="glass-card rounded-2xl px-5 py-4" style={{ background: color, borderColor: border }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black text-white font-heading">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <Tag className="w-4 h-4 text-brand-400" />
          <h3 className="font-heading font-bold text-white">All Discount Codes</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <span className="text-sm">Loading discounts…</span>
          </div>
        ) : discounts.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium mb-1">No discount codes yet</p>
            <p className="text-slate-600 text-xs">Click "Create Discount" to create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Code', 'Type', 'Value', 'Event', 'Usage', 'Expires', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discounts.map((d, i) => {
                  const expired = isExpired(d.expires_at);
                  const usedCount = d.used_count || 0;
                  const usePct = d.usage_limit > 0 ? Math.min(100, Math.round((usedCount / d.usage_limit) * 100)) : 0;
                  const eventTitle = getEventTitle(d.event_id);

                  return (
                    <tr key={d._id} className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: i < discounts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>

                      {/* Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-300 text-sm tracking-widest">{d.code}</span>
                          <button
                            onClick={() => handleCopy(d.code)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                            title="Copy code"
                          >
                            {copied === d.code ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            background: d.type === 'PERCENTAGE' ? 'rgba(108,71,236,0.15)' : 'rgba(59,130,246,0.15)',
                            color: d.type === 'PERCENTAGE' ? '#c4b5fd' : '#93c5fd'
                          }}>
                          {d.type === 'PERCENTAGE' ? '% Percent' : '₹ Fixed'}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="px-5 py-4 font-bold text-white">
                        {d.type === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`}
                      </td>

                      {/* Event */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {d.event_id
                            ? <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            : <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          }
                          <span className={`text-xs font-medium truncate max-w-[120px] ${d.event_id ? 'text-amber-300' : 'text-emerald-300'}`}
                            title={eventTitle}>
                            {eventTitle}
                          </span>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="px-5 py-4 w-36">
                        <div className="w-full h-1.5 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${usePct}%` }} />
                        </div>
                        <p className="text-xs text-slate-500">{usedCount} / {d.usage_limit} used</p>
                      </td>

                      {/* Expires */}
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${expired ? 'text-red-400' : 'text-emerald-400'}`}
                          style={{ background: expired ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }}>
                          {expired ? '⚠ Expired' : formatExpiry(d.expires_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(d)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-300 hover:bg-blue-500/10 transition-colors border border-blue-500/20"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(d)}
                            disabled={deleting === d._id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                            title="Delete"
                          >
                            {deleting === d._id
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

      {/* ─── Modal ─────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(108,71,236,0.2)', border: '1px solid rgba(108,71,236,0.3)' }}>
                  <Tag className="w-4 h-4 text-brand-400" />
                </div>
                <h3 className="font-heading font-bold text-white text-lg">
                  {editing ? 'Edit Discount Code' : 'Create Discount Code'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">

              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Discount Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. EARLYBIRD20"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                  className="input-glass w-full text-sm py-2.5 font-mono tracking-widest"
                  disabled={!!editing} // Code can't change after creation (or change via edit endpoint)
                />
                {editing && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Code identifier is fixed after creation
                  </p>
                )}
              </div>

              {/* Type + Value row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' }))}
                    className="input-glass w-full text-sm py-2.5"
                  >
                    <option value="PERCENTAGE" style={{ background: '#0b0f1a' }}>Percentage (%)</option>
                    <option value="FIXED_AMOUNT" style={{ background: '#0b0f1a' }}>Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Value ({form.type === 'PERCENTAGE' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={form.type === 'PERCENTAGE' ? 100 : undefined}
                    step={form.type === 'PERCENTAGE' ? 1 : 0.01}
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                    className="input-glass w-full text-sm py-2.5"
                  />
                </div>
              </div>

              {/* Event Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Apply To Event
                </label>
                <select
                  value={form.event_id}
                  onChange={e => setForm(f => ({ ...f, event_id: e.target.value }))}
                  className="input-glass w-full text-sm py-2.5"
                >
                  <option value="" style={{ background: '#0b0f1a' }}>🌐 All Events (Global)</option>
                  {events.map(ev => (
                    <option key={ev.event_id} value={ev.event_id} style={{ background: '#0b0f1a' }}>
                      📅 {ev.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {form.event_id
                    ? 'Code will only work for the selected event'
                    : 'Code will work for all your events'}
                </p>
              </div>

              {/* Usage Limit + Expiry row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.usage_limit}
                    onChange={e => setForm(f => ({ ...f, usage_limit: Number(e.target.value) }))}
                    className="input-glass w-full text-sm py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Expires At
                  </label>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                    className="input-glass w-full text-sm py-2.5"
                  />
                </div>
              </div>

              {/* Preview */}
              {form.code && form.value > 0 && (
                <div className="rounded-xl p-3.5" style={{ background: 'rgba(108,71,236,0.08)', border: '1px solid rgba(108,71,236,0.2)' }}>
                  <p className="text-xs text-slate-500 mb-1">Preview</p>
                  <p className="text-sm text-white font-semibold">
                    Code <span className="font-mono text-brand-300 tracking-widest">{form.code || '—'}</span> gives{' '}
                    <span className="text-emerald-400 font-bold">
                      {form.type === 'PERCENTAGE' ? `${form.value}% off` : `₹${form.value} off`}
                    </span>
                    {' '}on{' '}
                    <span className="text-amber-300">
                      {form.event_id ? events.find(e => e.event_id === form.event_id)?.title ?? 'selected event' : 'all events'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.code.trim()}
                className="flex-1 btn-primary justify-center py-2.5 text-sm disabled:opacity-50 disabled:transform-none"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : editing ? 'Save Changes' : 'Create Code'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
