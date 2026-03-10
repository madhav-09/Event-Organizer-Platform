import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, AlertCircle, Loader2, User, Calendar, Briefcase, Download, QrCode } from 'lucide-react';
import { verifyCertificate } from '../services/api';

interface CertData {
    id: string;
    name: string;
    email: string;
    role: string;
    certificate_type: string;
    certificate_url: string;
    status: string;
    event_name: string;
    event_date: string;
    created_at: string;
}

export default function VerifyCertificate() {
    const { id } = useParams<{ id: string }>();
    const [cert, setCert] = useState<CertData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        verifyCertificate(id)
            .then(setCert)
            .catch(() => setError('Certificate not found or invalid ID.'))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                        style={{ background: 'rgba(108,71,236,0.2)', border: '1px solid rgba(108,71,236,0.35)' }}>
                        🏅
                    </div>
                    <h1 className="font-heading font-black text-2xl text-white">Certificate Verification</h1>
                    <p className="text-slate-500 text-sm mt-1">Authenticate the validity of this certificate</p>
                </div>

                {loading ? (
                    <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                        <p className="text-slate-400 text-sm">Verifying certificate…</p>
                    </div>
                ) : error ? (
                    <div className="glass-card rounded-2xl p-10 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-white font-bold text-lg mb-2">Not Found</h2>
                        <p className="text-slate-500 text-sm mb-6">{error}</p>
                        <Link to="/" className="btn-primary mx-auto">Go Home</Link>
                    </div>
                ) : cert ? (
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Valid banner */}
                        <div className="px-6 py-4 flex items-center gap-3"
                            style={{ background: 'rgba(16,185,129,0.1)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <div>
                                <p className="text-emerald-300 font-bold text-sm">✅ Certificate Verified</p>
                                <p className="text-emerald-600 text-xs">This certificate is authentic and valid</p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                            <div className="text-center pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Awarded To</p>
                                <p className="font-heading font-black text-2xl text-white">{cert.name}</p>
                                <span className="inline-block mt-2 px-3 py-1 rounded-lg text-xs font-semibold"
                                    style={{ background: 'rgba(108,71,236,0.2)', color: '#c4b5fd', border: '1px solid rgba(108,71,236,0.3)' }}>
                                    {cert.certificate_type}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { icon: <Award className="w-4 h-4 text-brand-400" />, label: 'Event', val: cert.event_name },
                                    { icon: <Calendar className="w-4 h-4 text-brand-400" />, label: 'Event Date', val: cert.event_date },
                                    { icon: <Briefcase className="w-4 h-4 text-brand-400" />, label: 'Role', val: cert.role.charAt(0) + cert.role.slice(1).toLowerCase() },
                                    { icon: <User className="w-4 h-4 text-brand-400" />, label: 'Email', val: cert.email },
                                    { icon: <QrCode className="w-4 h-4 text-brand-400" />, label: 'Certificate ID', val: cert.id },
                                ].map(row => (
                                    <div key={row.label} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(108,71,236,0.1)' }}>
                                            {row.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500">{row.label}</p>
                                            <p className="text-white text-sm font-medium truncate">{row.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <a
                                href={cert.certificate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary w-full justify-center mt-4"
                            >
                                <Download className="w-4 h-4" /> Download Certificate
                            </a>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
