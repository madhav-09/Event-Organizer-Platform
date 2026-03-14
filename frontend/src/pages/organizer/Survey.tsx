import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Star, MessageSquare, List, BarChart3, X, Loader2, ChevronDown } from 'lucide-react';
import {
    getMyEvents,
    getOrganizerSurvey,
    saveOrganizerSurvey,
    getSurveyResponses
} from '../../services/api';
import toast from 'react-hot-toast';

type QuestionType = 'TEXT' | 'RATING' | 'MULTIPLE_CHOICE';

interface Question {
    id: string;      // Note: backend uses 'id' inside the questions array
    text: string;
    type: QuestionType;
    options: string[];
}

interface ResponseAnswer {
    questionId: string;
    answer: string | number;
}

interface SurveyResponse {
    _id: string;
    respondent_name: string;
    responses: ResponseAnswer[];
    submitted_at: string;
}

interface OrgEvent {
    event_id: string;
    title: string;
}

const TYPE_ICONS = { TEXT: MessageSquare, RATING: Star, MULTIPLE_CHOICE: List };
const TYPE_LABELS = { TEXT: 'Text Answer', RATING: '1–5 Star Rating', MULTIPLE_CHOICE: 'Multiple Choice' };

export default function Survey() {
    const [events, setEvents] = useState<OrgEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [eventsLoading, setEventsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'builder' | 'responses'>('builder');

    // Survey Builder State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Responses State
    const [responses, setResponses] = useState<SurveyResponse[]>([]);
    const [responsesLoading, setResponsesLoading] = useState(false);

    // ─── Load Events ──────────────────────────────────────────────────────────

    useEffect(() => {
        getMyEvents()
            .then((evts: OrgEvent[]) => {
                setEvents(evts);
                if (evts.length > 0) setSelectedEventId(evts[0].event_id);
            })
            .catch(() => toast.error('Failed to load events'))
            .finally(() => setEventsLoading(false));
    }, []);

    // ─── Load Survey & Responses ──────────────────────────────────────────────

    const loadSurveyData = useCallback(async (eventId: string) => {
        if (!eventId) return;

        setQuestionsLoading(true);
        setResponsesLoading(true);

        try {
            const surveyData = await getOrganizerSurvey(eventId);
            setQuestions(surveyData.questions || []);

            const responsesData = await getSurveyResponses(eventId);
            setResponses(responsesData || []);
        } catch (e: any) {
            toast.error('Failed to load survey data');
            setQuestions([]);
            setResponses([]);
        } finally {
            setQuestionsLoading(false);
            setResponsesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            loadSurveyData(selectedEventId);
            setActiveTab('builder'); // Reset to builder tab on event change
        }
    }, [selectedEventId, loadSurveyData]);

    // ─── Builder Actions ──────────────────────────────────────────────────────

    const addQuestion = (type: QuestionType) => {
        setQuestions(prev => [
            ...prev,
            {
                id: `q_${Date.now()}`,
                text: '',
                type,
                options: type === 'MULTIPLE_CHOICE' ? ['Option 1', 'Option 2'] : []
            }
        ]);
    };

    const removeQuestion = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id));

    const updateQuestion = (id: string, text: string) =>
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, text } : q));

    const updateOption = (qId: string, idx: number, val: string) =>
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: q.options.map((o, i) => i === idx ? val : o) } : q));

    const addOption = (qId: string) =>
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q));

    const removeOption = (qId: string, idx: number) =>
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q));

    const handleSave = async () => {
        if (!selectedEventId) return;

        // Validation
        const emptyTexts = questions.some(q => !q.text.trim());
        if (emptyTexts) {
            toast.error("Please fill in all question text fields.");
            return;
        }

        const emptyOptions = questions.some(q => q.type === 'MULTIPLE_CHOICE' && q.options.some(o => !o.trim()));
        if (emptyOptions) {
            toast.error("Please fill in all multiple choice options.");
            return;
        }

        setSaving(true);
        try {
            await saveOrganizerSurvey(selectedEventId, questions);
            setSaved(true);
            toast.success("Survey saved successfully!");
            setTimeout(() => setSaved(false), 2500);
        } catch (e: any) {
            toast.error("Failed to save survey");
        } finally {
            setSaving(false);
        }
    };

    // ─── Compute Metrics ──────────────────────────────────────────────────────

    const ratingQ = questions.find(q => q.type === 'RATING');
    const avgRating = ratingQ && responses.length > 0
        ? (
            responses.reduce((sum, r) => {
                const ans = r.responses.find(res => res.questionId === ratingQ.id);
                return sum + (ans && typeof ans.answer === 'number' ? ans.answer : 0);
            }, 0) / responses.length
        ).toFixed(1)
        : null;

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-black text-2xl text-white">Feedback Survey</h1>
                    <p className="text-slate-500 mt-1 text-sm">Build post-event feedback surveys and collect responses</p>
                </div>
            </div>

            {/* Event + Tabs */}
            <div className="glass-card rounded-2xl px-5 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:w-auto">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Event</label>
                    {eventsLoading ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading events…
                        </div>
                    ) : events.length === 0 ? (
                        <p className="text-slate-500 text-sm py-2">No events found. Create an event first.</p>
                    ) : (
                        <div className="relative w-full sm:w-80">
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
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    )}
                </div>

                {selectedEventId && (
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {(['builder', 'responses'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                style={{
                                    background: activeTab === tab ? 'rgba(108,71,236,0.25)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${activeTab === tab ? 'rgba(108,71,236,0.4)' : 'rgba(255,255,255,0.08)'}`
                                }}>
                                {tab === 'builder' ? '📝 Survey Builder' : `📊 Responses (${responses.length})`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {!selectedEventId && !eventsLoading && (
                <div className="glass-card rounded-2xl py-16 text-center">
                    <ClipboardCheck className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-[var(--text-secondary)] text-sm">Select an event to see feedback results</p>
                </div>
            )}

            {selectedEventId && activeTab === 'builder' && (
                <div className="space-y-5 animate-fade-in">
                    {questionsLoading ? (
                        <div className="flex items-center justify-center py-16 gap-3 text-slate-400 glass-card rounded-2xl">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                            <span className="text-sm">Loading survey…</span>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="py-16 text-center glass-card rounded-2xl border-dashed border-2 border-slate-800">
                            <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-medium mb-1">No questions yet</p>
                            <p className="text-slate-600 text-xs">Add questions below to start building your survey.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, qi) => {
                                const QIcon = TYPE_ICONS[q.type];
                                return (
                                    <div key={q.id} className="glass-card rounded-2xl p-5 space-y-4 relative group">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-brand-300"
                                                    style={{ background: 'rgba(108,71,236,0.15)' }}>Q{qi + 1}</span>
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                                    <QIcon className="w-3.5 h-3.5" /> {TYPE_LABELS[q.type]}
                                                </span>
                                            </div>
                                            <button onClick={() => removeQuestion(q.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                                                title="Remove Question">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <input type="text" value={q.text} placeholder={`Enter your question here…`}
                                            onChange={e => updateQuestion(q.id, e.target.value)}
                                            className="input-glass w-full font-medium py-3 px-4 text-white" />

                                        {/* Dynamic UI Preview based on Type */}
                                        <div className="pl-2 pt-2 border-l-2 border-slate-800 ml-3">
                                            {q.type === 'RATING' && (
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(n => (
                                                        <div key={n} className="flex flex-col items-center gap-1.5 opacity-50">
                                                            <Star className="w-7 h-7 text-amber-400" />
                                                            <span className="text-xs font-semibold text-slate-500">{n}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'TEXT' && (
                                                <div className="w-full h-20 rounded-xl bg-slate-900/50 border border-slate-800/50 flex items-center px-4">
                                                    <span className="text-slate-600 text-sm italic">Respondent will type their answer here...</span>
                                                </div>
                                            )}

                                            {q.type === 'MULTIPLE_CHOICE' && (
                                                <div className="space-y-3">
                                                    {q.options.map((opt, oi) => (
                                                        <div key={oi} className="flex items-center gap-3">
                                                            <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: 'rgba(108,71,236,0.4)' }} />
                                                            <input type="text" value={opt} placeholder="Option text"
                                                                onChange={e => updateOption(q.id, oi, e.target.value)}
                                                                className="input-glass flex-1 text-sm py-2 px-3" />
                                                            {q.options.length > 2 && (
                                                                <button onClick={() => removeOption(q.id, oi)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addOption(q.id)}
                                                        className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1.5 mt-2 py-1 px-2 rounded-lg hover:bg-brand-400/10">
                                                        <Plus className="w-3.5 h-3.5" /> Add Option
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Add question buttons */}
                    <div className="flex gap-3 flex-wrap pt-2">
                        {(Object.entries(TYPE_LABELS) as [QuestionType, string][]).map(([type, label]) => {
                            const Icon = TYPE_ICONS[type];
                            return (
                                <button key={type} onClick={() => addQuestion(type as QuestionType)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 transition-all hover:text-white hover:-translate-y-0.5"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Plus className="w-4 h-4 text-brand-400" />
                                    <Icon className="w-4 h-4 opacity-70" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                        <button onClick={handleSave} disabled={saving || saved || questions.length === 0}
                            className={`btn-primary px-8 py-3.5 text-sm w-full sm:w-auto ${saved ? '!bg-emerald-600' : ''} disabled:opacity-50 disabled:transform-none`}>
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                : saved ? '✓ Survey Saved Successfully!'
                                    : 'Save Survey Configuration'}
                        </button>
                    </div>
                </div>
            )}

            {selectedEventId && activeTab === 'responses' && (
                <div className="space-y-6 animate-fade-in">
                    {responsesLoading ? (
                        <div className="flex items-center justify-center py-16 gap-3 text-slate-400 glass-card rounded-2xl">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                            <span className="text-sm">Loading responses…</span>
                        </div>
                    ) : responses.length === 0 ? (
                        <div className="py-20 text-center glass-card rounded-2xl">
                            <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <h3 className="font-heading font-bold text-xl text-white mb-2">No Responses Yet</h3>
                            <p className="text-slate-500 text-sm">Once attendees submit feedback, it will appear here.</p>
                        </div>
                    ) : (
                        <>
                            {/* Metrics Row */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="glass-card rounded-2xl px-5 py-5" style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.2)' }}>
                                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Total Responses</p>
                                    <p className="text-4xl font-black text-white font-heading">{responses.length}</p>
                                </div>

                                {avgRating && (
                                    <div className="glass-card rounded-2xl px-5 py-5" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' }}>
                                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Avg Rating</p>
                                        <div className="flex items-end gap-3">
                                            <p className="text-4xl font-black text-white font-heading">{avgRating}</p>
                                            <div className="flex gap-0.5 pb-2">
                                                {[1, 2, 3, 4, 5].map(n =>
                                                    <Star key={n} className={`w-4 h-4 ${n <= Math.round(Number(avgRating)) ? 'text-amber-400' : 'text-slate-700'}`} fill={n <= Math.round(Number(avgRating)) ? 'currentColor' : 'none'} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Responses Feed */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-brand-400" />
                                        <h3 className="font-heading font-bold text-white">Individual Feedback</h3>
                                    </div>
                                </div>
                                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    {responses.map((resp, idx) => (
                                        <div key={resp._id || idx} className="px-6 py-6 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                                                        {resp.respondent_name.charAt(0)}
                                                    </div>
                                                    <p className="font-bold text-white">{resp.respondent_name}</p>
                                                </div>
                                                <p className="text-xs font-medium text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-lg w-fit">
                                                    {new Date(resp.submitted_at).toLocaleString('en-IN', {
                                                        dateStyle: 'medium', timeStyle: 'short'
                                                    })}
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                {resp.responses.map(r => {
                                                    const q = questions.find(q => q.id === r.questionId);
                                                    if (!q) return null;

                                                    return (
                                                        <div key={r.questionId} className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/50">
                                                            <p className="text-sm font-medium text-slate-400 mb-2">{q.text}</p>

                                                            {q.type === 'RATING' ? (
                                                                <div className="flex gap-1">
                                                                    {[1, 2, 3, 4, 5].map(n =>
                                                                        <Star key={n} className={`w-4 h-4 ${n <= Number(r.answer) ? 'text-amber-400' : 'text-slate-800'}`} fill={n <= Number(r.answer) ? 'currentColor' : 'none'} />
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-base text-white">{r.answer || <span className="text-slate-600 italic">No answer provided</span>}</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
