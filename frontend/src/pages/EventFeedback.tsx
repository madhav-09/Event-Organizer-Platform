import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { getEventSurvey, checkMySurveyResponse, submitSurveyResponse } from '../services/api';

type QuestionType = 'TEXT' | 'RATING' | 'MULTIPLE_CHOICE';

interface Question {
    id: string;
    text: string;
    type: QuestionType;
    options: string[];
}

interface Survey {
    _id: string;
    event_id: string;
    questions: Question[];
}

export default function EventFeedback() {
    const { id: eventId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Status checks
    const [alreadyResponded, setAlreadyResponded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form data
    const [answers, setAnswers] = useState<Record<string, string | number>>({});

    useEffect(() => {
        if (!eventId) return;

        let isMounted = true;
        const init = async () => {
            try {
                // Check if already taken
                const check = await checkMySurveyResponse(eventId);
                if (check.has_responded) {
                    if (isMounted) {
                        setAlreadyResponded(true);
                        setLoading(false);
                    }
                    return;
                }

                // If not taken, load questions
                const data = await getEventSurvey(eventId);
                if (isMounted) {
                    setSurvey(data);

                    // Pre-fill answers obj to avoid uncontrolled inputs warnings
                    const initAns: Record<string, string | number> = {};
                    data.questions.forEach((q: Question) => {
                        if (q.type === 'RATING') initAns[q.id] = 0;
                        if (q.type === 'TEXT') initAns[q.id] = '';
                        if (q.type === 'MULTIPLE_CHOICE') initAns[q.id] = '';
                    });
                    setAnswers(initAns);
                    setLoading(false);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.response?.data?.detail || "This event doesn't have an active feedback survey.");
                    setLoading(false);
                }
            }
        };
        init();
        return () => { isMounted = false; };
    }, [eventId]);

    const handleAnswer = (qId: string, val: string | number) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventId || !survey) return;

        // Basic validation: ensure all required questions are answered
        // (Assuming all are required for this basic implementation)
        const missing = survey.questions.find(q => {
            const val = answers[q.id];
            if (q.type === 'RATING' && val === 0) return true;
            if (q.type === 'TEXT' && (!val || String(val).trim() === '')) return true;
            if (q.type === 'MULTIPLE_CHOICE' && (!val || String(val).trim() === '')) return true;
            return false;
        });

        if (missing) {
            import('react-hot-toast').then(m => m.default.error("Please answer all questions before submitting."));
            return;
        }

        // Format payload to match `responses: [{questionId, answer}]` array
        const payload = Object.entries(answers).map(([qId, val]) => ({
            questionId: qId,
            answer: val
        }));

        setSubmitting(true);
        try {
            await submitSurveyResponse(eventId, payload);
            setSubmitted(true);
        } catch (err: any) {
            import('react-hot-toast').then(m => m.default.error(err?.response?.data?.detail || "Failed to submit survey"));
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Render States ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
                <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-4" />
                <p className="text-slate-400 font-medium">Loading survey…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6 border border-slate-800">
                    <MessageSquare className="w-6 h-6 text-slate-500" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-white mb-2">Unavailable</h2>
                <p className="text-slate-400 mb-8 max-w-sm">{error}</p>
                <Link to="/my-bookings" className="btn-primary">
                    <ArrowLeft className="w-4 h-4 mr-2 inline" /> Back to My Bookings
                </Link>
            </div>
        );
    }

    if (alreadyResponded || submitted) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-fade-up">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(16,185,129,0.15)' }}>
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-heading font-black text-white mb-3">Thank You!</h2>
                <p className="text-slate-400 mb-8 max-w-md">
                    {submitted
                        ? "Your feedback has been successfully submitted."
                        : "You have already submitted feedback for this event. Thank you!"}
                </p>
                <Link to="/my-bookings" className="btn-primary">
                    <ArrowLeft className="w-4 h-4 mr-2 inline" /> Back to My Bookings
                </Link>
            </div>
        );
    }

    // ─── Render Form ─────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen py-16 px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-2xl mx-auto">
                <div className="mb-10 text-center animate-fade-up">
                    <h1 className="font-heading font-black text-3xl sm:text-4xl text-white mb-3">Event Feedback</h1>
                    <p className="text-slate-400">Share your thoughts to help the organizers improve future events.</p>
                </div>

                <div className="glass-card rounded-3xl p-6 sm:p-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {survey?.questions.map((q, idx) => (
                            <div key={q.id} className="space-y-4">
                                <label className="block text-lg font-semibold text-white">
                                    <span className="text-brand-400 mr-2">{idx + 1}.</span>
                                    {q.text}
                                </label>

                                {q.type === 'RATING' && (
                                    <div className="flex gap-2 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 w-fit">
                                        {[1, 2, 3, 4, 5].map(n => {
                                            const active = n <= (answers[q.id] as number);
                                            return (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => handleAnswer(q.id, n)}
                                                    className={`p-2 rounded-xl transition-all hover:scale-110 focus:outline-none ${active ? 'bg-amber-400/20' : 'hover:bg-slate-800'}`}
                                                >
                                                    <Star className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${active ? 'text-amber-400' : 'text-slate-600'}`} fill={active ? 'currentColor' : 'none'} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {q.type === 'TEXT' && (
                                    <textarea
                                        value={answers[q.id] as string}
                                        onChange={e => handleAnswer(q.id, e.target.value)}
                                        placeholder="Type your answer here..."
                                        rows={4}
                                        className="input-glass w-full rounded-2xl py-4 px-5 text-base"
                                    />
                                )}

                                {q.type === 'MULTIPLE_CHOICE' && (
                                    <div className="space-y-3">
                                        {q.options.map((opt, oidx) => {
                                            const isSelected = answers[q.id] === opt;
                                            return (
                                                <label
                                                    key={oidx}
                                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${isSelected
                                                        ? 'bg-brand-500/10 border-brand-500/50'
                                                        : 'bg-slate-900/50 border-slate-800/50 hover:bg-slate-800'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-brand-400' : 'border-slate-500'
                                                        }`}>
                                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-400" />}
                                                    </div>
                                                    <span className={`text-base font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                        {opt}
                                                    </span>
                                                    <input
                                                        type="radio"
                                                        name={`q_${q.id}`}
                                                        value={opt}
                                                        checked={isSelected}
                                                        onChange={() => handleAnswer(q.id, opt)}
                                                        className="hidden"
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-5 py-3 rounded-xl font-medium text-slate-400 hover:text-white transition-colors order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || survey?.questions.length === 0}
                                className="btn-primary w-full sm:w-auto px-10 py-3.5 order-1 sm:order-2 disabled:opacity-50 disabled:transform-none shadow-xl shadow-brand-500/20"
                            >
                                {submitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2 inline" /> Submitting…</> : 'Submit Feedback'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
