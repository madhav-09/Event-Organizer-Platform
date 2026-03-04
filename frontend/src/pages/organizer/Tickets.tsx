import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Ticket, X, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface TicketType {
  _id: string;
  name: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  availableFrom: string;
  availableTo: string;
}

const EMPTY_FORM: Omit<TicketType, '_id' | 'quantitySold'> = {
  name: '',
  price: 0,
  quantityTotal: 100,
  availableFrom: '',
  availableTo: '',
};

const dummyTicketTypes: TicketType[] = [
  { _id: 't1', name: 'Early Bird', price: 499, quantityTotal: 100, quantitySold: 40, availableFrom: '2026-01-01', availableTo: '2026-02-28' },
  { _id: 't2', name: 'General Admission', price: 999, quantityTotal: 500, quantitySold: 120, availableFrom: '2026-03-01', availableTo: '2026-03-14' },
  { _id: 't3', name: 'VIP Pass', price: 2499, quantityTotal: 50, quantitySold: 15, availableFrom: '2026-01-01', availableTo: '2026-03-14' },
];

const ACCENT_COLORS = [
  { bg: 'rgba(108,71,236,0.15)', border: 'rgba(108,71,236,0.3)', text: '#c4b5fd' },
  { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' },
];

export default function Tickets() {
  const { id: eventId } = useParams<{ id: string }>();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TicketType | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulate API load
    setTimeout(() => {
      setTickets(dummyTicketTypes);
      setLoading(false);
    }, 600);
  }, [eventId]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (t: TicketType) => {
    setEditing(t);
    setForm({ name: t.name, price: t.price, quantityTotal: t.quantityTotal, availableFrom: t.availableFrom, availableTo: t.availableTo });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setTickets(prev => prev.filter(t => t._id !== id));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      if (editing) {
        setTickets(prev => prev.map(t => t._id === editing._id ? { ...t, ...form } : t));
      } else {
        setTickets(prev => [...prev, { _id: `t${Date.now()}`, ...form, quantitySold: 0 }]);
      }
      setSaving(false);
      setShowModal(false);
    }, 500);
  };

  const totalSold = tickets.reduce((a, t) => a + t.quantitySold, 0);
  const totalCapacity = tickets.reduce((a, t) => a + t.quantityTotal, 0);
  const totalRevenue = tickets.reduce((a, t) => a + t.price * t.quantitySold, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl text-white">Ticket Types</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage ticket tiers, pricing, and availability</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm px-4 py-2.5">
          <Plus className="w-4 h-4" />
          Add Ticket Type
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sold', value: loading ? '—' : totalSold, accent: 'rgba(108,71,236,0.15)', border: 'rgba(108,71,236,0.25)', color: '#c4b5fd' },
          { label: 'Total Capacity', value: loading ? '—' : totalCapacity, accent: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.25)', color: '#93c5fd' },
          { label: 'Revenue', value: loading ? '—' : `₹${totalRevenue.toLocaleString()}`, accent: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.25)', color: '#fcd34d' },
        ].map(({ label, value, accent, border, color }) => (
          <div key={label} className="glass-card rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black text-white font-heading">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <Ticket className="w-4 h-4 text-brand-400" />
          <h3 className="font-heading font-bold text-white">Ticket Types</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <span className="text-sm">Loading tickets…</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No ticket types yet. Add your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Ticket Name', 'Price', 'Sold / Total', 'Progress', 'Availability', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => {
                  const pct = Math.round((t.quantitySold / t.quantityTotal) * 100);
                  const ac = ACCENT_COLORS[i % ACCENT_COLORS.length];
                  return (
                    <tr key={t._id} className="transition-colors hover:bg-white/3"
                      style={{ borderBottom: i < tickets.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: ac.bg, border: `1px solid ${ac.border}` }}>
                            <Ticket className="w-3.5 h-3.5" style={{ color: ac.text }} />
                          </div>
                          <span className="font-semibold text-white">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-brand-300">₹{t.price.toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-300">{t.quantitySold} / {t.quantityTotal}</td>
                      <td className="px-5 py-4 w-32">
                        <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${ac.text}, ${ac.border.replace('0.3', '0.8')})` }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{pct}% sold</p>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        <span>{t.availableFrom}</span>
                        <span className="mx-1 text-slate-600">→</span>
                        <span>{t.availableTo}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(t)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-300 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(t._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-white text-lg">
                {editing ? 'Edit Ticket Type' : 'Add Ticket Type'}
              </h3>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {([
                { label: 'Ticket Name', key: 'name', type: 'text', placeholder: 'e.g. VIP Pass' },
                { label: 'Price (₹)', key: 'price', type: 'number', placeholder: '999' },
                { label: 'Total Quantity', key: 'quantityTotal', type: 'number', placeholder: '100' },
                { label: 'Available From', key: 'availableFrom', type: 'date', placeholder: '' },
                { label: 'Available To', key: 'availableTo', type: 'date', placeholder: '' },
              ] as { label: string; key: keyof typeof form; type: string; placeholder: string }[]).map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key] as string | number}
                    onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="input-glass w-full text-sm py-2.5"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 btn-primary justify-center py-2.5 text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editing ? 'Save Changes' : 'Add Ticket')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
