import { useState } from 'react';
import { Plus, Trash2, Star, MessageSquare, List, BarChart3, X, Loader2 } from 'lucide-react';

type QuestionType = 'TEXT' | 'RATING' | 'MULTIPLE_CHOICE';

interface Question {
    _id: string;
    text: string;
    type: QuestionType;
    options: string[];
}

interface Response {
    questionId: string;
    answer: string | number;
}

interface SurveyResponse {
    _id: string;
    respondent: string;
    responses: Response[];
    submittedAt: string;
}

const DUMMY_EVENTS = [
    { id: 'e1', title: 'Tech Summit 2026' },
    { id: 'e2', title: 'Startup Pitch Night' },
];

const INITIAL_QUESTIONS: Question[] = [
    { _id: 'q1', text: 'How would you rate the overall event?', type: 'RATING', options: [] },
    { _id: 'q2', text: 'What did you enjoy most about the event?', type: 'TEXT', options: [] },
    { _id: 'q3', text: 'How did you hear about this event?', type: 'MULTIPLE_CHOICE', options: ['Social Media', 'Friend/Colleague', 'Website', 'Email Newsletter'] },
];

const DUMMY_RESPONSES: SurveyResponse[] = [
    { _id: 'r1', respondent: 'Priya Sharma', responses: [{ questionId: 'q1', answer: 5 }, { questionId: 'q2', answer: 'The keynote was amazing!' }, { questionId: 'q3', answer: 'Social Media' }], submittedAt: '2026-03-03T11:00:00Z' },
    { _id: 'r2', respondent: 'Aryan Mehta', responses: [{ questionId: 'q1', answer: 4 }, { questionId: 'q2', answer: 'Networking opportunities.' }, { questionId: 'q3', answer: 'Friend/Colleague' }], submittedAt: '2026-03-03T12:30:00Z' },
    { _id: 'r3', respondent: 'Sneha Patel', responses: [{ questionId: 'q1', answer: 5 }, { questionId: 'q2', answer: 'Loved the workshops.' }, { questionId: 'q3', answer: 'Email Newsletter' }], submittedAt: '2026-03-03T13:00:00Z' },
];

const TYPE_ICONS = { TEXT: MessageSquare, RATING: Star, MULTIPLE_CHOICE: List };
const TYPE_LABELS = { TEXT: 'Text Answer', RATING: '1–5 Star Rating', MULTIPLE_CHOICE: 'Multiple Choice' };

export default function Survey() {
    const [selectedEvent, setSelectedEvent] = useState('e1');
    const [activeTab, setActiveTab] = useState<'builder' | 'responses'>('builder');
    const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
    const [responses] = useState<SurveyResponse[]>(DUMMY_RESPONSES);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const addQuestion = (type: QuestionType) => {
        setQuestions(prev => [...prev, { _id: `q${Date.now()}`, text: '', type, options: type === 'MULTIPLE_CHOICE' ? ['Option 1', 'Option 2'] : [] }]);
    };

    const removeQuestion = (id: string) => setQuestions(prev => prev.filter(q => q._id !== id));
    const updateQuestion = (id: string, text: string) => setQuestions(prev => prev.map(q => q._id === id ? { ...q, text } : q));
    const updateOption = (qId: string, idx: number, val: string) => setQuestions(prev => prev.map(q => q._id === qId ? { ...q, options: q.options.map((o, i) => i === idx ? val : o) } : q));
    const addOption = (qId: string) => setQuestions(prev => prev.map(q => q._id === qId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q));
    const removeOption = (qId: string, idx: number) => setQuestions(prev => prev.map(q => q._id === qId ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q));

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 800);
    };

    // Compute avg rating
    const ratingQ = questions.find(q => q.type === 'RATING');
    const avgRating = ratingQ ? (
        responses.reduce((sum, r) => {
            const ans = r.responses.find(res => res.questionId === ratingQ._id);
            return sum + (ans ? Number(ans.answer) : 0);
        }, 0) / responses.length
    ).toFixed(1) : null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-black text-2xl text-white">Feedback Survey</h1>
                    <p className="text-slate-500 mt-1 text-sm">Collect post-event feedback from attendees</p>
                </div>
            </div>

            {/* Event + Tabs */}
            <div className="glass-card rounded-2xl px-5 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Event</label>
                    <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="input-glass w-full sm:w-80 text-sm py-2.5">
                        {DUMMY_EVENTS.map(ev => <option key={ev.id} value={ev.id} style={{ background: '#0b0f1a' }}>{ev.title}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    {(['builder', 'responses'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            style={{ background: activeTab === tab ? 'rgba(108,71,236,0.25)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeTab === tab ? 'rgba(108,71,236,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                            {tab === 'builder' ? '📝 Survey Builder' : `📊 Responses (${responses.length})`}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'builder' ? (
                <div className="space-y-5">
                    {/* Questions */}
                    {questions.map((q, qi) => {
                        const QIcon = TYPE_ICONS[q.type];
                        return (
                            <div key={q._id} className="glass-card rounded-2xl p-5 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-brand-300"
                                            style={{ background: 'rgba(108,71,236,0.15)' }}>Q{qi + 1}</span>
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <QIcon className="w-3.5 h-3.5" /> {TYPE_LABELS[q.type]}
                                        </span>
                                    </div>
                                    <button onClick={() => removeQuestion(q._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <input type="text" value={q.text} placeholder={`Enter your question here…`}
                                    onChange={e => updateQuestion(q._id, e.target.value)}
                                    className="input-glass w-full text-sm py-2.5" />

                                {q.type === 'RATING' && (
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <div key={n} className="flex flex-col items-center gap-1">
                                                <Star className="w-6 h-6 text-amber-400/50" />
                                                <span className="text-xs text-slate-600">{n}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'MULTIPLE_CHOICE' && (
                                    <div className="space-y-2">
                                        {q.options.map((opt, oi) => (
                                            <div key={oi} className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: 'rgba(108,71,236,0.4)' }} />
                                                <input type="text" value={opt} onChange={e => updateOption(q._id, oi, e.target.value)} className="input-glass flex-1 text-sm py-1.5" />
                                                {q.options.length > 2 && (
                                                    <button onClick={() => removeOption(q._id, oi)} className="text-slate-600 hover:text-red-400 transition-colors">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={() => addOption(q._id)} className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 mt-1">
                                            <Plus className="w-3 h-3" /> Add Option
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Add question buttons */}
                    <div className="flex gap-3 flex-wrap">
                        {(Object.entries(TYPE_LABELS) as [QuestionType, string][]).map(([type, label]) => {
                            const Icon = TYPE_ICONS[type];
                            return (
                                <button key={type} onClick={() => addQuestion(type as QuestionType)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Plus className="w-3.5 h-3.5" />
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <button onClick={handleSave} disabled={saving || saved} className={`btn-primary px-8 py-3 text-sm ${saved ? '!bg-emerald-600' : ''}`}>
                        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? '✓ Survey Saved!' : 'Save Survey'}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Avg rating */}
                    {avgRating && (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="glass-card rounded-2xl px-5 py-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Rating</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-black text-white font-heading">{avgRating}</p>
                                    <div className="flex gap-0.5 pb-1">
                                        {[1, 2, 3, 4, 5].map(n => <Star key={n} className={`w-4 h-4 ${n <= Math.round(Number(avgRating)) ? 'text-amber-400' : 'text-slate-700'}`} fill={n <= Math.round(Number(avgRating)) ? 'currentColor' : 'none'} />)}
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card rounded-2xl px-5 py-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Responses</p>
                                <p className="text-3xl font-black text-white font-heading">{responses.length}</p>
                            </div>
                            <div className="glass-card rounded-2xl px-5 py-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Questions</p>
                                <p className="text-3xl font-black text-white font-heading">{questions.length}</p>
                            </div>
                        </div>
                    )}

                    {/* Responses list */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                            <BarChart3 className="w-4 h-4 text-brand-400" />
                            <h3 className="font-heading font-bold text-white">Individual Responses</h3>
                        </div>
                        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            {responses.map((resp) => (
                                <div key={resp._id} className="px-6 py-5 hover:bg-white/3 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="font-semibold text-white text-sm">{resp.respondent}</p>
                                        <p className="text-xs text-slate-500">{new Date(resp.submittedAt).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        {resp.responses.map(r => {
                                            const q = questions.find(q => q._id === r.questionId);
                                            if (!q) return null;
                                            return (
                                                <div key={r.questionId}>
                                                    <p className="text-xs text-slate-500 mb-0.5">{q.text}</p>
                                                    {q.type === 'RATING' ? (
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(n => <Star key={n} className={`w-3.5 h-3.5 ${n <= Number(r.answer) ? 'text-amber-400' : 'text-slate-700'}`} fill={n <= Number(r.answer) ? 'currentColor' : 'none'} />)}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-white">{r.answer}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
