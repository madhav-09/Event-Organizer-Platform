import { useState, useEffect } from "react";
import { getOrganizerProfile, updateOrganizerProfile } from "../../services/api";
import toast from "react-hot-toast";
import { FiSave, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function OrganizerProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        brand_name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        website: "",
        description: "",
    });

    const [kycStatus, setKycStatus] = useState("PENDING");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getOrganizerProfile();
            setKycStatus(data.kyc_status);
            setForm({
                brand_name: data.brand_name || "",
                contact_name: data.contact_name || "",
                contact_email: data.contact_email || "",
                contact_phone: data.contact_phone || "",
                address_line1: data.address_line1 || "",
                address_line2: data.address_line2 || "",
                city: data.city || "",
                state: data.state || "",
                pincode: data.pincode || "",
                website: data.website || "",
                description: data.description || "",
            });
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
            await updateOrganizerProfile(form);
            toast.success("Organizer details updated successfully");
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to update details");
        } finally {
            setSaving(false);
        }
    };

    const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const inputCls =
        "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors";
    const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider";

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Organizer Profile</h1>
                    <p className="text-gray-500 mt-1 text-sm">Update your brand and contact details.</p>
                </div>

                {/* KYC Badge */}
                <div className="flex items-center gap-2">
                    {kycStatus === "APPROVED" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
                            <FiCheckCircle /> KYC Approved
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold border border-amber-200">
                            <FiAlertCircle /> KYC Pending
                        </span>
                    )}
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Basic Brand Info */}
                <div className="p-6 md:p-8 space-y-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Brand Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Brand / Organization Name *</label>
                            <input type="text" required value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Website</label>
                            <input type="url" placeholder="https://" value={form.website} onChange={(e) => set("website", e.target.value)} className={inputCls} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Brand Description</label>
                            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputCls} resize-none`} placeholder="Tell attendees about your organization..." />
                        </div>
                    </div>
                </div>

                {/* Contact info */}
                <div className="p-6 md:p-8 space-y-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800">Primary Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelCls}>Contact Name *</label>
                            <input type="text" required value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Contact Email *</label>
                            <input type="email" required value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Contact Phone *</label>
                            <input type="tel" required value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="p-6 md:p-8 space-y-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelCls}>Address Line 1 *</label>
                            <input type="text" required value={form.address_line1} onChange={(e) => set("address_line1", e.target.value)} className={inputCls} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Address Line 2</label>
                            <input type="text" value={form.address_line2} onChange={(e) => set("address_line2", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>City *</label>
                            <input type="text" required value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>State *</label>
                            <input type="text" required value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Pincode *</label>
                            <input type="text" required value={form.pincode} onChange={(e) => set("pincode", e.target.value)} className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                        ) : (
                            <FiSave size={18} />
                        )}
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}
