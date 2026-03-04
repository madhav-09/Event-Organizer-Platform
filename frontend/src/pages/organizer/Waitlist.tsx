import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Loader2, ClipboardList, Search } from 'lucide-react';

interface WaitlistEntry {
    _id: string;
    name: string;
    email: string;
    ticketType: string;
    joinedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REMOVED';
}

const DUMMY_EVENTS = [
    { id: 'e1', title: 'Tech Summit 2026' },
    { id: 'e2', title: 'Startup Pitch Night' },
];

const DUMMY_WAITLIST: WaitlistEntry[] = [
    { _id: 'w1', name: 'Priya Sharma', email: 'priya@example.com', ticketType: 'VIP Pass', joinedAt: '2026-02-28T10:30:00Z', status: 'PENDING' },
    { _id: 'w2', name: 'Aryan Mehta', email: 'aryan@example.com', ticketType: 'General Admission', joinedAt: '2026-03-01T08:15:00Z', status: 'PENDING' },
    { _id: 'w3', name: 'Sneha Patel', email: 'sneha@example.com', ticketType: 'Early Bird', joinedAt: '2026-03-01T14:00:00Z', status: 'APPROVED' },
    { _id: 'w4', name: 'Rohan Gupta', email: 'rohan@example.com', ticketType: 'VIP Pass', joinedAt: '2026-03-02T09:45:00Z', status: 'PENDING' },
    { _id: 'w5', name: 'Kavya Nair', email: 'kavya@example.com', ticketType: 'General Admission', joinedAt: '2026-03-02T16:20:00Z', status: 'REMOVED' },
];

export default function Waitlist() {
    const [selectedEvent, setSelectedEvent] = useState('e1');
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        setTimeout(() => { setEntries(DUMMY_WAITLIST); setLoading(false); }, 600);
    }, [selectedEvent]);

    const handleApprove = (id: string) => setEntries(prev => prev.map(e => e._id === id ? { ...e, status: 'APPROVED' } : e));
    const handleRemove = (id: string) => setEntries(prev => prev.map(e => e._id === id ? { ...e, status: 'REMOVED' } : e));

    const filtered = entries.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    );

    const pendingCount = entries.filter(e => e.status === 'PENDING').length;
    const approvedCount = entries.filter(e => e.status === 'APPROVED').length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-black text-2xl text-white">Waitlist</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage attendees waiting for a spot</p>
                </div>
            </div>

            {/* Event Selector + Search */}
            <div className="glass-card rounded-2xl px-5 py-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Filter by Event</label>
                    <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="input-glass w-full text-sm py-2.5">
                        {DUMMY_EVENTS.map(ev => <option key={ev.id} value={ev.id} style={{ background: '#0b0f1a' }}>{ev.title}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Search by name or email…" value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input-glass w-full text-sm py-2.5 pl-9" />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Waitlisted', value: entries.length, accent: 'rgba(108,71,236,0.15)', color: '#c4b5fd' },
                    { label: 'Pending Approval', value: pendingCount, accent: 'rgba(245,158,11,0.15)', color: '#fcd34d' },
                    { label: 'Approved', value: approvedCount, accent: 'rgba(16,185,129,0.15)', color: '#6ee7b7' },
                ].map(({ label, value, accent, color }) => (
                    <div key={label} className="glass-card rounded-2xl px-5 py-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-2xl font-black text-white font-heading">{loading ? '—' : value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <ClipboardList className="w-4 h-4 text-brand-400" />
                    <h3 className="font-heading font-bold text-white">Waitlist Entries</h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                        <span className="text-sm">Loading waitlist…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No entries found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                    {['Attendee', 'Ticket Type', 'Joined At', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((entry, i) => (
                                    <tr key={entry._id} className="transition-colors hover:bg-white/3"
                                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-white">{entry.name}</p>
                                            <p className="text-xs text-slate-500">{entry.email}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-300">{entry.ticketType}</td>
                                        <td className="px-5 py-4 text-slate-400 text-xs">{new Date(entry.joinedAt).toLocaleString()}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${entry.status === 'APPROVED' ? 'text-emerald-400' :
                                                    entry.status === 'REMOVED' ? 'text-red-400' : 'text-amber-400'
                                                }`} style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {entry.status === 'PENDING' && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleApprove(entry._id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 transition-colors"
                                                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                    </button>
                                                    <button onClick={() => handleRemove(entry._id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 transition-colors"
                                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                        <XCircle className="w-3.5 h-3.5" /> Remove
                                                    </button>
                                                </div>
                                            )}
                                            {entry.status !== 'PENDING' && (
                                                <span className="text-xs text-slate-600 italic">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
