import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, MapPin, User, CalendarDays, X, Loader2 } from 'lucide-react';
import { getMyEvents, updateEventAgenda } from '../../services/api';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface AgendaItem {
    _id: string; // The backend expects "_id" as string
    title: string;
    startTime: string;
    endTime: string;
    speaker: string;
    room: string;
    description: string;
    type: 'TALK' | 'WORKSHOP' | 'BREAK' | 'PANEL';
}

const TYPE_COLORS: Record<AgendaItem['type'], { bg: string; border: string; text: string; label: string }> = {
    TALK: { bg: 'rgba(108,71,236,0.15)', border: 'rgba(108,71,236,0.3)', text: '#c4b5fd', label: 'Talk' },
    WORKSHOP: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd', label: 'Workshop' },
    PANEL: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d', label: 'Panel' },
    BREAK: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#6ee7b7', label: 'Break' },
};

const EMPTY_FORM: Omit<AgendaItem, '_id'> = {
    title: '', startTime: '', endTime: '', speaker: '', room: '', description: '', type: 'TALK',
};

export default function Agenda() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventObj, setSelectedEventObj] = useState<any>(null);
    const [items, setItems] = useState<AgendaItem[]>([]);

    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingAgenda, setLoadingAgenda] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<AgendaItem | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    // Initial load: Fetch organizer's events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getMyEvents();
                setEvents(data);
                if (data.length > 0) {
                    await selectAndLoadEvent(data[0].event_id);
                }
            } catch (error) {
                toast.error("Failed to load events");
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchEvents();
    }, []);

    const selectAndLoadEvent = async (eventId: string) => {
        try {
            setLoadingAgenda(true);
            const res = await api.get(`/events/${eventId}`);
            setSelectedEventObj(res.data);
            setItems(res.data.agenda || []);
        } catch (error) {
            toast.error("Failed to load event details");
        } finally {
            setLoadingAgenda(false);
        }
    };

    const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        selectAndLoadEvent(id);
    };

    const sortedItems = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));

    const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (item: AgendaItem) => { setEditing(item); setForm({ ...item }); setShowModal(true); };

    const handleDelete = async (id: string) => {
        if (!selectedEventObj) return;
        const confirmDelete = window.confirm("Are you sure you want to delete this session?");
        if (!confirmDelete) return;

        const newItems = items.filter(i => i._id !== id);

        try {
            await updateEventAgenda(selectedEventObj.id, newItems);
            setItems(newItems);
            toast.success("Session deleted successfully");
        } catch (e) {
            toast.error("Failed to delete session");
        }
    };

    const handleSave = async () => {
        if (!selectedEventObj) return;
        if (!form.title || !form.startTime || !form.endTime) {
            toast.error("Title, start time, and end time are required.");
            return;
        }

        setSaving(true);
        let updatedItems: AgendaItem[];

        if (editing) {
            updatedItems = items.map(i => i._id === editing._id ? { ...i, ...form } : i);
        } else {
            const newItem: AgendaItem = { ...form, _id: `a${Date.now()}` };
            updatedItems = [...items, newItem];
        }

        try {
            await updateEventAgenda(selectedEventObj.id, updatedItems);
            setItems(updatedItems);
            toast.success(editing ? "Session updated" : "Session added");
            setShowModal(false);
        } catch (e) {
            toast.error("Failed to save session");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-black text-2xl text-[var(--text-primary)]">Agenda & Schedule</h1>
                    <p className="text-[var(--text-secondary)] mt-1 text-sm">Plan and organize your event timeline</p>
                </div>
                {selectedEventObj && (
                    <button onClick={openAdd} className="btn-primary text-sm px-4 py-2.5">
                        <Plus className="w-4 h-4" /> Add Session
                    </button>
                )}
            </div>

            {/* Event Selector */}
            <div className="glass-card rounded-2xl px-5 py-4">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Event</label>
                {loadingEvents ? (
                    <div className="input-glass w-full md:w-96 py-2.5 text-sm text-[var(--text-muted)] flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading events…
                    </div>
                ) : events.length === 0 ? (
                    <p className="text-[var(--text-secondary)] text-sm">No events found. Create an event first.</p>
                ) : (
                    <select
                        value={selectedEventObj?.id || ''}
                        onChange={handleEventSelect}
                        className="input-glass w-full md:w-96 text-sm py-2.5"
                    >
                        {events.map(ev => (
                            <option key={ev.event_id} value={ev.event_id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                                {ev.title}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {loadingAgenda ? (
                <div className="flex items-center justify-center py-16 gap-3 text-[var(--text-muted)]">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                    <span className="text-sm">Loading agenda…</span>
                </div>
            ) : (!selectedEventObj) ? null : sortedItems.length === 0 ? (
                <div className="glass-card rounded-2xl py-16 text-center">
                    <CalendarDays className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-[var(--text-secondary)] text-sm">No sessions yet. Add the first one!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedItems.map((item) => {
                        const colors = TYPE_COLORS[item.type];
                        return (
                            <div key={item._id} className="glass-card rounded-2xl p-5 flex gap-5 items-start group">
                                {/* Time column */}
                                <div className="w-24 flex-shrink-0 text-center">
                                    <p className="font-heading font-bold text-[var(--text-primary)] text-sm">{item.startTime}</p>
                                    <div className="h-px my-1.5" style={{ background: 'var(--glass-border)' }} />
                                    <p className="text-xs text-[var(--text-secondary)]">{item.endTime}</p>
                                </div>

                                {/* Left connector */}
                                <div className="flex flex-col items-center pt-1 flex-shrink-0">
                                    <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: colors.text, background: colors.bg }} />
                                    <div className="w-px flex-1 mt-1" style={{ background: 'var(--glass-border)', minHeight: '40px' }} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                                                    {colors.label}
                                                </span>
                                                <h3 className="font-heading font-bold text-[var(--text-primary)] text-sm">{item.title}</h3>
                                            </div>
                                            {item.description && <p className="text-xs text-[var(--text-secondary)] mb-2">{item.description}</p>}
                                            <div className="flex items-center gap-4 flex-wrap mt-1">
                                                {item.speaker && (
                                                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                                        <User className="w-3 h-3" /> {item.speaker}
                                                    </span>
                                                )}
                                                {item.room && (
                                                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                                        <MapPin className="w-3 h-3" /> {item.room}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                                    <Clock className="w-3 h-3" /> {item.startTime} – {item.endTime}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-brand-300 transition-colors" style={{ background: 'var(--glass-hover)' }}>
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-colors" style={{ background: 'var(--glass-hover)' }}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card rounded-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="font-heading font-bold text-[var(--text-primary)] text-lg">{editing ? 'Edit Session' : 'Add Session'}</h3>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]" style={{ background: 'var(--glass-hover)' }}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Session Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Opening Keynote" className="input-glass w-full text-sm py-2.5" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Type *</label>
                                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AgendaItem['type'] }))} className="input-glass w-full text-sm py-2.5">
                                    {Object.entries(TYPE_COLORS).map(([k, v]) => <option key={k} value={k} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{v.label}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Start Time *</label>
                                    <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="input-glass w-full text-sm py-2.5" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">End Time *</label>
                                    <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="input-glass w-full text-sm py-2.5" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Speaker</label>
                                <input type="text" value={form.speaker} onChange={e => setForm(f => ({ ...f, speaker: e.target.value }))} placeholder="Speaker name (optional)" className="input-glass w-full text-sm py-2.5" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Room / Venue</label>
                                <input type="text" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="e.g. Main Hall" className="input-glass w-full text-sm py-2.5" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Description</label>
                                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" className="input-glass w-full text-sm py-2.5 resize-none" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)]" style={{ background: 'var(--glass-hover)', border: '1px solid var(--glass-border)' }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center py-2.5 text-sm">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editing ? 'Save Changes' : 'Add Session')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
