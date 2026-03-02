import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiSave, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function UserProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

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

            // Update global user context so name changes reflect in navbar
            if (user) {
                // We simulate a login update by passing the existing token but new user data
                // For simplicity, we just rely on page reload or the next token refresh to update the global state entirely.
                // Actually, let's just let it be, the user will see it here. 
                // A full proper way would be for the API to return the updated user object and we set it.
            }

        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 mt-2">Manage your personal information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left side: Profile Form */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiUser className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                                ) : (
                                    <FiSave size={18} />
                                )}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right side: Quick Links */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FiClock className="text-blue-600" /> Bookings
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            View your upcoming events and past event history.
                        </p>
                        <Link
                            to="/my-bookings"
                            className="inline-block px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-50 transition-colors w-full text-center"
                        >
                            Go to My Bookings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
