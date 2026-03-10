import { useState, useEffect } from 'react';
import { Send, Users, CheckCircle, Clock, Loader2, Mail, AlertCircle } from 'lucide-react';
import { getMyEvents, sendEmailBlast, getEmailBlastHistory } from '../../services/api';

interface OrganizerEvent {
    event_id: string;
    title: string;
}

interface SentEmail {
    id: string;
    subject: string;
    target: string;
    sent_at: string;
    recipients: number;
    failed?: number;
    event_title?: string;
}

const TARGET_OPTIONS = [
    { value: 'all', label: 'All Attendees', icon: Users },
    { value: 'checked_in', label: 'Checked In', icon: CheckCircle },
    { value: 'not_checked_in', label: 'Not Checked In', icon: Clock },
];

export default function EmailBlast() {
    const [events, setEvents] = useState<OrganizerEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [target, setTarget] = useState('all');
    const [sending, setSending] = useState(false);
    const [sentStatus, setSentStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [sentHistory, setSentHistory] = useState<SentEmail[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Load events and history on mount
    useEffect(() => {
        (async () => {
            try {
                const evts = await getMyEvents();
                setEvents(evts);
                if (evts.length > 0) setSelectedEvent(evts[0].event_id);
            } catch {
                // ignore
            } finally {
                setLoadingEvents(false);
            }
        })();

        (async () => {
            try {
                const history = await getEmailBlastHistory();
                setSentHistory(history);
            } catch {
                // ignore
            } finally {
                setLoadingHistory(false);
            }
        })();
    }, []);

    const handleSend = async () => {
        if (!subject.trim() || !body.trim() || !selectedEvent) return;
        setSending(true);
        setSentStatus('idle');
        try {
            const result = await sendEmailBlast({
                event_id: selectedEvent,
                target,
                subject,
                body,
            });
            setSentStatus('success');
            setStatusMessage(result.message || `Sent to ${result.recipients} recipient(s)`);
            setSubject('');
            setBody('');
            // Refresh history
            const history = await getEmailBlastHistory();
            setSentHistory(history);
            setTimeout(() => setSentStatus('idle'), 4000);
        } catch (err: any) {
            setSentStatus('error');
            setStatusMessage(
                err?.response?.data?.detail || 'Failed to send email blast. Please try again.'
            );
            setTimeout(() => setSentStatus('idle'), 5000);
        } finally {
            setSending(false);
        }
    };

    const canSend = !sending && sentStatus !== 'success' && subject.trim() && body.trim() && selectedEvent;

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
                        {/* Status Banner */}
                        {sentStatus === 'success' && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                {statusMessage}
                            </div>
                        )}
                        {sentStatus === 'error' && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {statusMessage}
                            </div>
                        )}

                        {/* Event */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Event</label>
                            {loadingEvents ? (
                                <div className="input-glass w-full py-2.5 text-sm text-slate-500 flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading events…
                                </div>
                            ) : events.length === 0 ? (
                                <p className="text-slate-500 text-sm">No events found. Create an event first.</p>
                            ) : (
                                <select
                                    value={selectedEvent}
                                    onChange={e => setSelectedEvent(e.target.value)}
                                    className="input-glass w-full text-sm py-2.5"
                                >
                                    {events.map(ev => (
                                        <option key={ev.event_id} value={ev.event_id} style={{ background: '#0b0f1a' }}>
                                            {ev.title}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Target Audience */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Send To</label>
                            <div className="grid grid-cols-3 gap-2">
                                {TARGET_OPTIONS.map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTarget(value)}
                                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all ${target === value
                                            ? 'text-brand-300 border border-brand-500/40'
                                            : 'text-slate-500 border border-white/8 hover:text-slate-300'
                                            }`}
                                        style={{ background: target === value ? 'rgba(108,71,236,0.15)' : 'rgba(255,255,255,0.04)' }}
                                    >
                                        <Icon className={`w-4 h-4 ${target === value ? 'text-brand-400' : 'text-slate-600'}`} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                            <input
                                type="text"
                                placeholder="e.g. Important update about your ticket"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="input-glass w-full text-sm py-2.5"
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                            <textarea
                                rows={8}
                                placeholder="Write your message here…"
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                className="input-glass w-full text-sm py-2.5 resize-none"
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={!canSend}
                            className={`w-full btn-primary justify-center py-3 text-sm font-semibold transition-all ${sentStatus === 'success' ? '!bg-emerald-600' : ''
                                }`}
                        >
                            {sending ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                            ) : sentStatus === 'success' ? (
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
                        {loadingHistory ? (
                            <div className="py-10 flex justify-center text-slate-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                        ) : sentHistory.length === 0 ? (
                            <div className="py-10 text-center text-slate-500 text-sm">No emails sent yet</div>
                        ) : sentHistory.map(email => (
                            <div key={email.id} className="px-5 py-4 hover:bg-white/3 transition-colors">
                                <p className="font-semibold text-white text-sm truncate">{email.subject}</p>
                                {email.event_title && (
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{email.event_title}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <span className="text-xs text-brand-400">{email.target}</span>
                                    <span className="text-xs text-slate-500">·</span>
                                    <span className="text-xs text-slate-500">{email.recipients} sent</span>
                                    {email.failed ? (
                                        <>
                                            <span className="text-xs text-slate-500">·</span>
                                            <span className="text-xs text-red-400">{email.failed} failed</span>
                                        </>
                                    ) : null}
                                </div>
                                <p className="text-xs text-slate-600 mt-1">{new Date(email.sent_at).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
