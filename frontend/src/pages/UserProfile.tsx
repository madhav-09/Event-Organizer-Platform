import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { User, Mail, Save, Ticket, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", email: "" });

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile();
            setForm({ name: data.name || "", email: data.email || "" });
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateUserProfile(form);
            toast.success("Profile updated successfully");
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
            </div>
        );
    }

    const initials = form.name ? form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "U";

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="animate-fade-up">
                    <h1 className="font-heading font-black text-3xl text-[var(--text-primary)]">My Profile</h1>
                    <p className="text-[var(--text-secondary)] mt-2">Manage your personal information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                    {/* Profile Form */}
                    <div className="md:col-span-2 glass-card rounded-2xl p-6 sm:p-8">
                        {/* Avatar */}
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--glass-border)]">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #6c47ec, #4f46e5)' }}>
                                {initials}
                            </div>
                            <div>
                                <p className="font-heading font-bold text-[var(--text-primary)] text-lg">{form.name || "Your Name"}</p>
                                <p className="text-[var(--text-muted)] text-sm">{user?.role === "ORGANIZER" ? "Organizer" : "User"}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="input-glass w-full pl-10 py-3 text-sm"
                                        placeholder="Your full name"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="input-glass w-full pl-10 py-3 text-sm"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary px-6 py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <Link
                            to="/my-bookings"
                            className="glass-card rounded-2xl p-6 block group transition-all duration-200 hover:border-brand-500/30"
                            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.25)' }}>
                                <Ticket className="w-5 h-5 text-brand-400" />
                            </div>
                            <h3 className="font-heading font-bold text-[var(--text-primary)] mb-1">My Bookings</h3>
                            <p className="text-[var(--text-secondary)] text-sm mb-4">View upcoming events and history.</p>
                            <span className="flex items-center gap-1.5 text-brand-400 text-sm font-medium group-hover:gap-2.5 transition-all">
                                Go to Bookings <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>

                        <Link
                            to="/my-wishlist"
                            className="glass-card rounded-2xl p-6 block group transition-all duration-200"
                            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <span className="text-red-400 text-lg">♥</span>
                            </div>
                            <h3 className="font-heading font-bold text-[var(--text-primary)] mb-1">Wishlist</h3>
                            <p className="text-[var(--text-secondary)] text-sm mb-4">Events you've saved for later.</p>
                            <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium group-hover:gap-2.5 transition-all">
                                View Wishlist <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
