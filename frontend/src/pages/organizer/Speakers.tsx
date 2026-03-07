import { useState } from 'react';
import { Plus, Edit2, Trash2, Mic, Linkedin, X, Loader2, ExternalLink } from 'lucide-react';

interface Speaker {
    _id: string;
    name: string;
    title: string;
    company: string;
    topic: string;
    bio: string;
    linkedin: string;
    avatar: string; // initials fallback
}

const DUMMY_SPEAKERS: Speaker[] = [
    { _id: 's1', name: 'Dr. Ananya Krishnan', title: 'Chief AI Scientist', company: 'DeepTech India', topic: 'Future of AI in Healthcare', bio: 'Ananya leads AI research at DeepTech India and has published 30+ papers on machine learning.', linkedin: 'https://linkedin.com', avatar: 'AK' },
    { _id: 's2', name: 'Rahul Verma', title: 'VP Engineering', company: 'ScaleUp Corp', topic: 'Building Scalable Microservices', bio: 'Rahul has scaled engineering teams at multiple startups to 10M+ users.', linkedin: 'https://linkedin.com', avatar: 'RV' },
    { _id: 's3', name: 'Priya Goswami', title: 'Founder & CEO', company: 'GreenTech Ventures', topic: 'Climate Tech Investment Trends', bio: 'Priya is a serial entrepreneur and climate tech investor with 3 successful exits.', linkedin: 'https://linkedin.com', avatar: 'PG' },
];

const EMPTY_FORM: Omit<Speaker, '_id' | 'avatar'> = {
    name: '', title: '', company: '', topic: '', bio: '', linkedin: '',
};

const GRADIENT_COLORS = [
    'linear-gradient(135deg, rgba(108,71,236,0.5), rgba(79,70,229,0.5))',
    'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(37,99,235,0.5))',
    'linear-gradient(135deg, rgba(245,158,11,0.5), rgba(217,119,6,0.5))',
    'linear-gradient(135deg, rgba(16,185,129,0.5), rgba(5,150,105,0.5))',
    'linear-gradient(135deg, rgba(239,68,68,0.5), rgba(185,28,28,0.5))',
];

export default function Speakers() {
    const [speakers, setSpeakers] = useState<Speaker[]>(DUMMY_SPEAKERS);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Speaker | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (s: Speaker) => { setEditing(s); setForm({ name: s.name, title: s.title, company: s.company, topic: s.topic, bio: s.bio, linkedin: s.linkedin }); setShowModal(true); };
    const handleDelete = (id: string) => setSpeakers(prev => prev.filter(s => s._id !== id));

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            const initials = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            if (editing) {
                setSpeakers(prev => prev.map(s => s._id === editing._id ? { ...s, ...form, avatar: initials } : s));
            } else {
                setSpeakers(prev => [...prev, { _id: `sp${Date.now()}`, ...form, avatar: initials }]);
            }
            setSaving(false);
            setShowModal(false);
        }, 500);
    };

    const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value }));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-black text-2xl text-white">Speakers</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage speakers and panelists for your events</p>
                </div>
                <button onClick={openAdd} className="btn-primary text-sm px-4 py-2.5">
                    <Plus className="w-4 h-4" /> Add Speaker
                </button>
            </div>

            {/* Speaker Count */}
            <div className="glass-card rounded-2xl px-5 py-4 inline-flex items-center gap-3">
                <Mic className="w-5 h-5 text-brand-400" />
                <p className="text-white font-semibold">{speakers.length} Speaker{speakers.length !== 1 ? 's' : ''} Confirmed</p>
            </div>

            {speakers.length === 0 ? (
                <div className="glass-card rounded-2xl py-16 text-center">
                    <Mic className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No speakers added yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {speakers.map((sp, i) => (
                        <div key={sp._id} className="glass-card rounded-2xl overflow-hidden group">
                            {/* Card top accent */}
                            <div className="h-1.5 w-full" style={{ background: GRADIENT_COLORS[i % GRADIENT_COLORS.length].replace('0.5)', '1)') }} />

                            <div className="p-5">
                                {/* Avatar + actions */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-heading font-black text-white text-lg"
                                        style={{ background: GRADIENT_COLORS[i % GRADIENT_COLORS.length] }}>
                                        {sp.avatar}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(sp)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-300 transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete(sp._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-heading font-bold text-white text-base">{sp.name}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">{sp.title} · {sp.company}</p>

                                <div className="mt-3 px-3 py-2 rounded-xl text-xs font-semibold text-brand-300" style={{ background: 'rgba(108,71,236,0.12)', border: '1px solid rgba(108,71,236,0.2)' }}>
                                    🎤 {sp.topic}
                                </div>

                                <p className="text-xs text-slate-500 mt-3 line-clamp-2">{sp.bio}</p>

                                {sp.linkedin && (
                                    <a href={sp.linkedin} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card rounded-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="font-heading font-bold text-white text-lg">{editing ? 'Edit Speaker' : 'Add Speaker'}</h3>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {([
                                { label: 'Full Name', key: 'name', placeholder: 'Dr. Ananya Krishnan' },
                                { label: 'Job Title', key: 'title', placeholder: 'Chief AI Scientist' },
                                { label: 'Company / Organization', key: 'company', placeholder: 'DeepTech India' },
                                { label: 'Talk Topic', key: 'topic', placeholder: 'Future of AI' },
                                { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'https://linkedin.com/in/...' },
                            ] as { label: string; key: keyof typeof form; placeholder: string }[]).map(({ label, key, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                                    <input type={key === 'linkedin' ? 'url' : 'text'} placeholder={placeholder} value={form[key]}
                                        onChange={f(key)} className="input-glass w-full text-sm py-2.5" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bio</label>
                                <textarea rows={4} placeholder="Short speaker bio…" value={form.bio}
                                    onChange={f('bio')} className="input-glass w-full text-sm py-2.5 resize-none" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center py-2.5 text-sm">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editing ? 'Save Changes' : 'Add Speaker')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
