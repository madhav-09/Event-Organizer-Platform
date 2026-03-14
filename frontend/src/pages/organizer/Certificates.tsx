import { useState, useEffect } from 'react';
import {
    Award, Send, Download, RefreshCw, Filter, Loader2, CheckCircle2,
    Users, Mic, HelpCircle, ShoppingBag, UserPlus, Trash2,
    Mail, User, Phone, Building2, Briefcase, Tag, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import {
    getMyEvents,
    generateCertificates,
    sendCertificates,
    getEventCertificates,
    downloadCertificate,
    addParticipant,
    getParticipants,
    deleteParticipant,
} from '../../services/api';
import toast from 'react-hot-toast';

type Role = 'ATTENDEE' | 'SPEAKER' | 'VOLUNTEER' | 'VENDOR';

interface Certificate {
    id: string;
    name: string;
    email: string;
    role: string;
    certificate_type: string;
    certificate_url: string;
    status: 'generated' | 'sent';
    created_at: string;
}

interface Participant {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    organization?: string;
    designation?: string;
    category?: string;
    notes?: string;
    created_at: string;
}

interface ParticipantForm {
    name: string;
    email: string;
    phone: string;
    organization: string;
    designation: string;
    category: string;
    notes: string;
}

const BLANK_FORM: ParticipantForm = {
    name: '', email: '', phone: '', organization: '', designation: '', category: '', notes: '',
};

const ROLES: { value: Role; label: string; icon: JSX.Element; color: string }[] = [
    { value: 'ATTENDEE', label: 'Attendees', color: 'rgba(108,71,236,0.15)', icon: <Users className="w-4 h-4" /> },
    { value: 'SPEAKER', label: 'Speakers', color: 'rgba(59,130,246,0.15)', icon: <Mic className="w-4 h-4" /> },
    { value: 'VOLUNTEER', label: 'Volunteers', color: 'rgba(16,185,129,0.15)', icon: <HelpCircle className="w-4 h-4" /> },
    { value: 'VENDOR', label: 'Vendors', color: 'rgba(245,158,11,0.15)', icon: <ShoppingBag className="w-4 h-4" /> },
];

const ROLE_TEXT_COLOR: Record<Role, string> = {
    ATTENDEE: '#c4b5fd',
    SPEAKER: '#93c5fd',
    VOLUNTEER: '#6ee7b7',
    VENDOR: '#fcd34d',
};

// Vendor categories for quick-pick
const VENDOR_CATEGORIES = [
    'Food & Beverage', 'Photography / Videography', 'Audio / Visual', 'Décor & Florals',
    'Entertainment', 'Technology & IT', 'Transport & Logistics', 'Printing & Merchandise',
    'Security', 'Other',
];

// Volunteer designations for quick-pick
const VOLUNTEER_DESIGNATIONS = [
    'Registration Desk', 'Stage Management', 'Guest Relations', 'Technical Support',
    'Logistics & Setup', 'Media & Documentation', 'First Aid / Medical', 'Security',
    'Usher / Floor Manager', 'Other',
];

function InputField({
    icon, label, placeholder, value, onChange, type = 'text', required = false,
}: {
    icon: JSX.Element; label: string; placeholder: string; value: string;
    onChange: (v: string) => void; type?: string; required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                {icon}{label}{required && <span className="text-red-400">*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="input-glass py-2.5 text-sm"
                required={required}
            />
        </div>
    );
}

function SelectField({
    icon, label, options, value, onChange,
}: {
    icon: JSX.Element; label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                {icon}{label}
            </label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="input-glass py-2.5 text-sm"
            >
                <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>— Select —</option>
                {options.map(o => <option key={o} value={o} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{o}</option>)}
            </select>
        </div>
    );
}

export default function Certificates() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [activeRole, setActiveRole] = useState<Role>('ATTENDEE');
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingCerts, setLoadingCerts] = useState(false);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [addingParticipant, setAddingParticipant] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [form, setForm] = useState<ParticipantForm>(BLANK_FORM);
    const isParticipantRole = activeRole === 'VOLUNTEER' || activeRole === 'VENDOR';

    const setField = (k: keyof ParticipantForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

    // Load organizer events once
    useEffect(() => {
        getMyEvents()
            .then((data: any[]) => {
                setEvents(data);
                if (data.length > 0) setSelectedEventId(data[0].event_id);
            })
            .catch(() => toast.error('Failed to load events'))
            .finally(() => setLoadingEvents(false));
    }, []);

    // Reload certs (and participants if applicable) when event or role changes
    useEffect(() => {
        if (!selectedEventId) return;
        fetchCerts();
        if (isParticipantRole) fetchParticipants(); else setParticipants([]);
    }, [selectedEventId, activeRole]);

    const fetchCerts = async () => {
        setLoadingCerts(true);
        try { setCerts(await getEventCertificates(selectedEventId, activeRole)); }
        catch { toast.error('Failed to load certificates'); }
        finally { setLoadingCerts(false); }
    };

    const fetchParticipants = async () => {
        setLoadingParticipants(true);
        try { setParticipants(await getParticipants(selectedEventId, activeRole)); }
        catch { toast.error('Failed to load participants'); }
        finally { setLoadingParticipants(false); }
    };

    const handleAdd = async () => {
        if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required'); return; }
        setAddingParticipant(true);
        try {
            await addParticipant({
                event_id: selectedEventId,
                role: activeRole as 'VOLUNTEER' | 'VENDOR',
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                organization: form.organization.trim() || undefined,
                designation: form.designation.trim() || undefined,
                category: form.category.trim() || undefined,
                notes: form.notes.trim() || undefined,
            });
            toast.success(`${activeRole === 'VOLUNTEER' ? 'Volunteer' : 'Vendor'} added!`);
            setForm(BLANK_FORM);
            await fetchParticipants();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to add participant');
        } finally {
            setAddingParticipant(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteParticipant(id);
            toast.success('Participant removed');
            setParticipants(prev => prev.filter(p => p.id !== id));
            if (expandedId === id) setExpandedId(null);
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to remove');
        } finally {
            setDeletingId(null);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await generateCertificates(selectedEventId, activeRole);
            toast.success(res.message || 'Certificates generated!');
            await fetchCerts();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Generation failed');
        } finally { setGenerating(false); }
    };

    const handleSend = async () => {
        setSending(true);
        try {
            const res = await sendCertificates(selectedEventId, activeRole);
            toast.success(res.message || 'Certificates queued!');
            await fetchCerts();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Send failed');
        } finally { setSending(false); }
    };

    const sentCount = certs.filter(c => c.status === 'sent').length;
    const genCount = certs.length;
    const roleColor = ROLE_TEXT_COLOR[activeRole];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-black text-2xl text-[var(--text-primary)] flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                            style={{ background: 'rgba(108,71,236,0.2)', border: '1px solid rgba(108,71,236,0.35)' }}>
                            🏅
                        </span>
                        Certificates
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1 text-sm pl-12">Generate &amp; distribute achievement certificates</p>
                </div>

                {selectedEventId && (
                    <div className="flex flex-wrap gap-2 pl-12 sm:pl-0">
                        <button onClick={handleGenerate} disabled={generating} className="btn-primary text-sm px-4 py-2.5 gap-2">
                            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                            {generating ? 'Generating…' : 'Generate'}
                        </button>
                        <button onClick={handleSend} disabled={sending || genCount === 0}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:scale-105"
                            style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}>
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {sending ? 'Sending…' : 'Send Emails'}
                        </button>
                        <button onClick={() => { fetchCerts(); if (isParticipantRole) fetchParticipants(); }}
                            disabled={loadingCerts}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                            title="Refresh">
                            <RefreshCw className={`w-4 h-4 ${loadingCerts ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
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
                        value={selectedEventId}
                        onChange={e => setSelectedEventId(e.target.value)}
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

            {/* Stats */}
            {selectedEventId && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Generated', value: genCount, color: '#c4b5fd', bg: 'rgba(108,71,236,0.1)' },
                        { label: 'Sent', value: sentCount, color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)' },
                        { label: 'Pending', value: genCount - sentCount, color: '#fcd34d', bg: 'rgba(245,158,11,0.1)' },
                        {
                            label: isParticipantRole ? 'Added' : 'Role',
                            value: isParticipantRole ? participants.length : activeRole,
                            color: '#93c5fd', bg: 'rgba(59,130,246,0.1)',
                        },
                    ].map(s => (
                        <div key={s.label} className="glass-card rounded-xl p-4"
                            style={{ border: `1px solid ${s.bg.replace('0.1', '0.25')}` }}>
                            <p className="text-xs text-[var(--text-muted)] mb-1">{s.label}</p>
                            <p className="font-heading font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Role Tabs */}
            <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                    <button key={r.value} onClick={() => setActiveRole(r.value)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: activeRole === r.value ? r.color.replace('0.15', '0.3') : r.color,
                            border: `1px solid ${activeRole === r.value ? ROLE_TEXT_COLOR[r.value] + '55' : 'transparent'}`,
                            color: ROLE_TEXT_COLOR[r.value],
                        }}>
                        {r.icon} {r.label}
                    </button>
                ))}
            </div>

            {/* ── Manage Participants (VOLUNTEER / VENDOR only) ───────────────────── */}
            {selectedEventId && isParticipantRole && (
                <div className="glass-card rounded-2xl overflow-hidden"
                    style={{ border: `1px solid ${roleColor}22` }}>

                    {/* Panel header */}
                    <div className="px-5 py-4 border-b flex items-center gap-3"
                        style={{ borderColor: 'var(--glass-border)', background: `${roleColor}0a` }}>
                        <UserPlus className="w-4 h-4" style={{ color: roleColor }} />
                        <span className="font-semibold text-[var(--text-primary)] text-sm">
                            Add {activeRole === 'VOLUNTEER' ? 'Volunteer' : 'Vendor'}
                        </span>
                        <span className="ml-auto text-xs text-[var(--text-secondary)] hidden sm:block">
                            Fill in details → <strong className="text-[var(--text-muted)]">Add</strong>, then <strong className="text-[var(--text-muted)]">Generate</strong> → <strong className="text-[var(--text-muted)]">Send Emails</strong>
                        </span>
                    </div>

                    {/* Form */}
                    <div className="px-5 py-5 border-b space-y-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

                        {/* Row 1 — required */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                icon={<User className="w-3.5 h-3.5" />}
                                label="Full Name" placeholder="e.g. Priya Sharma"
                                value={form.name} onChange={setField('name')} required />
                            <InputField
                                icon={<Mail className="w-3.5 h-3.5" />}
                                label="Email Address" placeholder="priya@example.com"
                                value={form.email} onChange={setField('email')} type="email" required />
                        </div>

                        {/* Row 2 — contact + org */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                icon={<Phone className="w-3.5 h-3.5" />}
                                label="Phone / WhatsApp" placeholder="+91 98765 43210"
                                value={form.phone} onChange={setField('phone')} type="tel" />
                            <InputField
                                icon={<Building2 className="w-3.5 h-3.5" />}
                                label={activeRole === 'VENDOR' ? 'Business / Company Name' : 'Organization / Institution'}
                                placeholder={activeRole === 'VENDOR' ? 'e.g. Spice Garden Catering' : 'e.g. NSS Cell, IIT Delhi'}
                                value={form.organization} onChange={setField('organization')} />
                        </div>

                        {/* Row 3 — role-specific */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {activeRole === 'VOLUNTEER' ? (
                                <SelectField
                                    icon={<Briefcase className="w-3.5 h-3.5" />}
                                    label="Designation / Area"
                                    options={VOLUNTEER_DESIGNATIONS}
                                    value={form.designation} onChange={setField('designation')} />
                            ) : (
                                <SelectField
                                    icon={<Tag className="w-3.5 h-3.5" />}
                                    label="Vendor Category"
                                    options={VENDOR_CATEGORIES}
                                    value={form.category} onChange={setField('category')} />
                            )}
                            <InputField
                                icon={activeRole === 'VOLUNTEER' ? <Tag className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                                label={activeRole === 'VOLUNTEER' ? 'Custom Designation' : 'Stall / Booth Number'}
                                placeholder={activeRole === 'VOLUNTEER' ? 'Override if not in list above' : 'e.g. A-12'}
                                value={activeRole === 'VOLUNTEER' ? form.designation : form.designation}
                                onChange={setField('designation')} />
                        </div>

                        {/* Row 4 — notes */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Notes / Remarks
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Any additional information…"
                                value={form.notes}
                                onChange={e => setField('notes')(e.target.value)}
                                className="input-glass py-2.5 text-sm resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end">
                            <button onClick={handleAdd}
                                disabled={addingParticipant || !form.name.trim() || !form.email.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:scale-105"
                                style={{ background: `${roleColor}22`, border: `1px solid ${roleColor}44` }}>
                                {addingParticipant
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <UserPlus className="w-4 h-4" style={{ color: roleColor }} />}
                                <span style={{ color: roleColor }}>
                                    {addingParticipant ? 'Adding…' : `Add ${activeRole === 'VOLUNTEER' ? 'Volunteer' : 'Vendor'}`}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Participants list */}
                    {loadingParticipants ? (
                        <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                            <span className="text-sm">Loading…</span>
                        </div>
                    ) : participants.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-slate-500 text-sm">No {activeRole === 'VOLUNTEER' ? 'volunteers' : 'vendors'} added yet.</p>
                            <p className="text-slate-600 text-xs mt-1">Fill the form above to get started.</p>
                        </div>
                    ) : (
                        <div>
                            {/* list header */}
                            <div className="px-5 py-2.5 border-b flex items-center gap-2"
                                style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {participants.length} {activeRole === 'VOLUNTEER' ? 'Volunteer' : 'Vendor'}{participants.length !== 1 ? 's' : ''} Added
                                </span>
                            </div>
                            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                {participants.map(p => {
                                    const expanded = expandedId === p.id;
                                    const hasExtra = p.phone || p.organization || p.designation || p.category || p.notes;
                                    return (
                                        <div key={p.id}>
                                            {/* Main row */}
                                            <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/2 transition-colors">
                                                {/* Avatar */}
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                    style={{ background: `${roleColor}22`, border: `1px solid ${roleColor}33` }}>
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Name + email */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                                                    <p className="text-xs text-[var(--text-secondary)] truncate">{p.email}</p>
                                                </div>

                                                {/* Secondary info pills */}
                                                <div className="hidden sm:flex items-center gap-2 shrink-0">
                                                    {p.phone && (
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> {p.phone}
                                                        </span>
                                                    )}
                                                    {(p.designation || p.category) && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full"
                                                            style={{ background: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}25` }}>
                                                            {p.designation || p.category}
                                                        </span>
                                                    )}
                                                    {p.organization && (
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" /> {p.organization}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Expand + delete */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {hasExtra && (
                                                        <button
                                                            onClick={() => setExpandedId(expanded ? null : p.id)}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                                                            title={expanded ? 'Collapse' : 'View details'}>
                                                            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        disabled={deletingId === p.id}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40"
                                                        title="Remove">
                                                        {deletingId === p.id
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <Trash2 className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded details */}
                                            {expanded && (
                                                <div className="px-5 pb-4 pt-1 grid grid-cols-2 sm:grid-cols-3 gap-3"
                                                    style={{ background: 'rgba(255,255,255,0.015)' }}>
                                                    {p.phone && (
                                                        <div>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-0.5"><Phone className="w-3 h-3" /> Phone</p>
                                                            <p className="text-sm text-white">{p.phone}</p>
                                                        </div>
                                                    )}
                                                    {p.organization && (
                                                        <div>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-0.5"><Building2 className="w-3 h-3" /> Organization</p>
                                                            <p className="text-sm text-white">{p.organization}</p>
                                                        </div>
                                                    )}
                                                    {p.designation && (
                                                        <div>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-0.5"><Briefcase className="w-3 h-3" /> Designation</p>
                                                            <p className="text-sm text-white">{p.designation}</p>
                                                        </div>
                                                    )}
                                                    {p.category && (
                                                        <div>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-0.5"><Tag className="w-3 h-3" /> Category</p>
                                                            <p className="text-sm text-white">{p.category}</p>
                                                        </div>
                                                    )}
                                                    {p.notes && (
                                                        <div className="col-span-2 sm:col-span-3">
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-0.5"><FileText className="w-3 h-3" /> Notes</p>
                                                            <p className="text-sm text-slate-300">{p.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Certs Table */}
            {!selectedEventId ? (
                <div className="glass-card rounded-2xl py-20 text-center">
                    <Award className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Select an event to manage certificates</p>
                </div>
            ) : loadingCerts ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                    <span className="text-sm">Loading certificates…</span>
                </div>
            ) : certs.length === 0 ? (
                <div className="glass-card rounded-2xl py-20 text-center">
                    <Award className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm mb-2">No certificates generated yet for this role.</p>
                    <p className="text-slate-600 text-xs">
                        {isParticipantRole
                            ? `Add ${activeRole.toLowerCase()}s above, then click "Generate".`
                            : `Click "Generate" to create certificates for all ${activeRole.toLowerCase()}s.`}
                    </p>
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b flex items-center justify-between"
                        style={{ borderColor: 'var(--glass-border)' }}>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{certs.length} certificates</span>
                        <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                            <Filter className="w-3.5 h-3.5" /> Filtered by: {activeRole}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    {['Name', 'Email', 'Type', 'Status', 'Action'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {certs.map((cert, i) => (
                                    <tr key={cert.id}
                                        className="hover:bg-[var(--glass-hover)] transition-colors"
                                        style={{ borderBottom: i < certs.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                        <td className="px-5 py-3.5 text-[var(--text-primary)] font-medium">{cert.name}</td>
                                        <td className="px-5 py-3.5 text-[var(--text-secondary)]">{cert.email}</td>
                                        <td className="px-5 py-3.5 text-[var(--text-muted)] text-xs">{cert.certificate_type}</td>
                                        <td className="px-5 py-3.5">
                                            {cert.status === 'sent' ? (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400"
                                                    style={{ background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: 6, width: 'fit-content' }}>
                                                    <CheckCircle2 className="w-3 h-3" /> Sent
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-amber-400"
                                                    style={{ background: 'rgba(245,158,11,0.1)', padding: '3px 10px', borderRadius: 6, display: 'inline-block' }}>
                                                    Generated
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <button
                                                onClick={() => downloadCertificate(cert.id, `Certificate_${cert.name}.pdf`).catch(() => toast.error('Download failed'))}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-brand-300 hover:text-brand-200 transition-colors">
                                                <Download className="w-3.5 h-3.5" /> Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
