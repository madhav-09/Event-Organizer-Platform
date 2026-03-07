import { useState } from 'react';
import { Send, Users, CheckCircle, Clock, Loader2, Mail, ChevronDown } from 'lucide-react';

interface SentEmail {
    id: string;
    subject: string;
    target: string;
    sentAt: string;
    recipients: number;
}

const DUMMY_EVENTS = [
    { id: 'e1', title: 'Tech Summit 2026' },
    { id: 'e2', title: 'Startup Pitch Night' },
];

const DUMMY_SENT: SentEmail[] = [
    { id: 's1', subject: 'Event Reminder – Tomorrow is the big day!', target: 'All Attendees', sentAt: '2026-03-01T10:00:00Z', recipients: 320 },
    { id: 's2', subject: 'Check-in instructions for VIP attendees', target: 'Checked In', sentAt: '2026-03-02T09:30:00Z', recipients: 45 },
    { id: 's3', subject: 'You still haven\'t checked in – don\'t miss out!', target: 'Not Checked In', sentAt: '2026-03-02T14:00:00Z', recipients: 275 },
];

const TARGET_OPTIONS = [
    { value: 'all', label: 'All Attendees', icon: Users },
    { value: 'checked_in', label: 'Checked In', icon: CheckCircle },
    { value: 'not_checked_in', label: 'Not Checked In', icon: Clock },
];

export default function EmailBlast() {
    const [selectedEvent, setSelectedEvent] = useState('e1');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [target, setTarget] = useState('all');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [sentHistory, setSentHistory] = useState<SentEmail[]>(DUMMY_SENT);

    const handleSend = () => {
        if (!subject.trim() || !body.trim()) return;
        setSending(true);
        setTimeout(() => {
            const newEntry: SentEmail = {
                id: `s${Date.now()}`,
                subject,
                target: TARGET_OPTIONS.find(t => t.value === target)?.label || 'All Attendees',
                sentAt: new Date().toISOString(),
                recipients: Math.floor(Math.random() * 200) + 50,
            };
            setSentHistory(prev => [newEntry, ...prev]);
            setSending(false);
            setSent(true);
            setSubject('');
            setBody('');
            setTimeout(() => setSent(false), 3000);
        }, 1500);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-heading font-black text-2xl text-white">Email Blast</h1>
                <p className="text-slate-500 mt-1 text-sm">Send announcements and updates to your event attendees</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* Compose Panel */}
                <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <Mail className="w-4 h-4 text-brand-400" />
                        <h3 className="font-heading font-bold text-white">Compose Message</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        {/* Event */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Event</label>
                            <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="input-glass w-full text-sm py-2.5">
                                {DUMMY_EVENTS.map(ev => <option key={ev.id} value={ev.id} style={{ background: '#0b0f1a' }}>{ev.title}</option>)}
                            </select>
                        </div>

                        {/* Target Audience */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Send To</label>
                            <div className="grid grid-cols-3 gap-2">
                                {TARGET_OPTIONS.map(({ value, label, icon: Icon }) => (
                                    <button key={value} onClick={() => setTarget(value)}
                                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all ${target === value
                                                ? 'text-brand-300 border border-brand-500/40'
                                                : 'text-slate-500 border border-white/8 hover:text-slate-300'
                                            }`}
                                        style={{ background: target === value ? 'rgba(108,71,236,0.15)' : 'rgba(255,255,255,0.04)' }}>
                                        <Icon className={`w-4 h-4 ${target === value ? 'text-brand-400' : 'text-slate-600'}`} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                            <input type="text" placeholder="e.g. Important update about your ticket" value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="input-glass w-full text-sm py-2.5" />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                            <textarea rows={8} placeholder="Write your message here…" value={body}
                                onChange={e => setBody(e.target.value)}
                                className="input-glass w-full text-sm py-2.5 resize-none" />
                        </div>

                        {/* Send Button */}
                        <button onClick={handleSend} disabled={sending || sent || !subject.trim() || !body.trim()}
                            className={`w-full btn-primary justify-center py-3 text-sm font-semibold transition-all ${sent ? '!bg-emerald-600' : ''
                                }`}>
                            {sending ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                            ) : sent ? (
                                <><CheckCircle className="w-4 h-4" /> Email Sent Successfully!</>
                            ) : (
                                <><Send className="w-4 h-4" /> Send Email Blast</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sent History */}
                <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <Clock className="w-4 h-4 text-brand-400" />
                        <h3 className="font-heading font-bold text-white">Sent History</h3>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        {sentHistory.length === 0 ? (
                            <div className="py-10 text-center text-slate-500 text-sm">No emails sent yet</div>
                        ) : sentHistory.map(email => (
                            <div key={email.id} className="px-5 py-4 hover:bg-white/3 transition-colors">
                                <p className="font-semibold text-white text-sm truncate">{email.subject}</p>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <span className="text-xs text-brand-400">{email.target}</span>
                                    <span className="text-xs text-slate-500">·</span>
                                    <span className="text-xs text-slate-500">{email.recipients} recipients</span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">{new Date(email.sentAt).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
