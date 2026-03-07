import { useState, useEffect } from "react";
import { getOrganizerProfile, updateOrganizerProfile } from "../../services/api";
import toast from "react-hot-toast";
import { Save, CheckCircle, AlertCircle, Loader2, Building2, User, MapPin, Globe } from "lucide-react";

type Section = { title: string; icon: React.ElementType; fields: FieldDef[]; accent: string };
type FieldDef = {
    key: keyof typeof EMPTY_FORM;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    span?: boolean;
    textarea?: boolean;
};

const EMPTY_FORM = {
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
};

const SECTIONS: Section[] = [
    {
        title: "Brand Information",
        icon: Building2,
        accent: "rgba(108,71,236,0.15)",
        fields: [
            { key: "brand_name", label: "Brand / Organization Name", required: true },
            { key: "website", label: "Website", type: "url", placeholder: "https://" },
            { key: "description", label: "Brand Description", placeholder: "Tell attendees about your organization...", span: true, textarea: true },
        ],
    },
    {
        title: "Primary Contact",
        icon: User,
        accent: "rgba(59,130,246,0.1)",
        fields: [
            { key: "contact_name", label: "Contact Name", required: true },
            { key: "contact_email", label: "Contact Email", type: "email", required: true },
            { key: "contact_phone", label: "Contact Phone", type: "tel", required: true },
        ],
    },
    {
        title: "Address",
        icon: MapPin,
        accent: "rgba(16,185,129,0.1)",
        fields: [
            { key: "address_line1", label: "Address Line 1", required: true, span: true },
            { key: "address_line2", label: "Address Line 2", span: true },
            { key: "city", label: "City", required: true },
            { key: "state", label: "State", required: true },
            { key: "pincode", label: "Pincode", required: true },
        ],
    },
];

export default function OrganizerProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [kycStatus, setKycStatus] = useState("PENDING");

    useEffect(() => { loadProfile(); }, []);

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

    const set = (k: keyof typeof EMPTY_FORM, v: string) => setForm(p => ({ ...p, [k]: v }));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
            </div>
        );
    }

    const kycApproved = kycStatus === "APPROVED";

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                    <h1 className="font-heading font-black text-2xl text-white">Organizer Profile</h1>
                    <p className="text-slate-500 mt-1 text-sm">Update your brand and contact details.</p>
                </div>
                <div>
                    {kycApproved ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-emerald-400 border border-emerald-500/30"
                            style={{ background: 'rgba(16,185,129,0.1)' }}>
                            <CheckCircle className="w-4 h-4" /> KYC Approved
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-amber-400 border border-amber-500/30"
                            style={{ background: 'rgba(245,158,11,0.1)' }}>
                            <AlertCircle className="w-4 h-4" /> KYC Pending
                        </span>
                    )}
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
                {SECTIONS.map(({ title, icon: Icon, accent, fields }) => (
                    <div key={title} className="glass-card rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex items-center gap-3"
                            style={{ borderColor: 'rgba(255,255,255,0.07)', background: accent }}>
                            <Icon className="w-4 h-4 text-brand-400" />
                            <h2 className="font-heading font-bold text-white text-sm">{title}</h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {fields.map((field) => (
                                    <div key={field.key} className={field.span ? "md:col-span-2" : ""}>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                            {field.label} {field.required && <span className="text-brand-400">*</span>}
                                        </label>
                                        {field.textarea ? (
                                            <textarea
                                                rows={3}
                                                value={form[field.key]}
                                                onChange={e => set(field.key, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="input-glass w-full resize-none text-sm py-3"
                                            />
                                        ) : (
                                            <input
                                                type={field.type || "text"}
                                                required={field.required}
                                                placeholder={field.placeholder}
                                                value={form[field.key]}
                                                onChange={e => set(field.key, e.target.value)}
                                                className="input-glass w-full text-sm py-3"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Save button */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-8 py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}
