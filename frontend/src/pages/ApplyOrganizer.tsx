import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Building2, User, MapPin, Globe, ArrowRight, Loader2,
} from "lucide-react";

interface FormData {
  brand_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  description: string;
  website: string;
}

const initialForm: FormData = {
  brand_name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  description: "",
  website: "",
};

/* ─── Section colours ─── */
const SECTIONS = [
  { icon: Building2, label: "Organization / Brand", color: "rgba(108,71,236,0.2)", border: "rgba(108,71,236,0.35)", text: "#c4b5fd" },
  { icon: User, label: "Contact Person", color: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)", text: "#93c5fd" },
  { icon: MapPin, label: "Business Address", color: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)", text: "#6ee7b7" },
  { icon: Globe, label: "Additional (optional)", color: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", text: "#fcd34d" },
];

/* ─── Field helpers ─── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}
function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;
}
function inputCls(hasError?: boolean) {
  return `input-glass w-full text-sm py-3 ${hasError ? "border-red-500/60 focus:border-red-500" : ""}`;
}

export default function ApplyOrganizer() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.brand_name.trim()) next.brand_name = "Organization name is required";
    if (!form.contact_name.trim()) next.contact_name = "Contact name is required";
    if (!form.contact_email.trim()) next.contact_email = "Contact email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email))
      next.contact_email = "Enter a valid email address";
    if (!form.contact_phone.trim()) next.contact_phone = "Phone is required";
    else if (!/^[+]?[\d\s-]{10,}$/.test(form.contact_phone.replace(/\s/g, "")))
      next.contact_phone = "Enter a valid phone number";
    if (!form.address_line1.trim()) next.address_line1 = "Address line 1 is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.state.trim()) next.state = "State is required";
    if (!form.pincode.trim()) next.pincode = "Pincode is required";
    if (!form.country.trim()) next.country = "Country is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error("Please fill all required fields correctly."); return; }
    try {
      setLoading(true);
      await api.post("/organizers/apply", {
        brand_name: form.brand_name.trim(),
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim(),
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country.trim(),
        description: form.description.trim() || "",
        website: form.website.trim() || undefined,
      });
      toast.success("Application submitted! We'll review and get back to you.");
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Application failed. You may have already applied.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const [s0, s1, s2, s3] = SECTIONS;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.3)', color: '#c4b5fd' }}>
            <Building2 className="w-3 h-3" /> Organizer Application
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white mb-2">Apply as Organizer</h1>
          <p className="text-slate-500 text-sm">
            Fill in your details. Fields marked <span className="text-brand-400">*</span> are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>

          {/* ── Organization ── */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <SectionHeader s={s0} />
            <div className="p-5 space-y-4">
              <div>
                <Label>Organization / brand name <span className="text-brand-400">*</span></Label>
                <input name="brand_name" value={form.brand_name} onChange={handleChange}
                  placeholder="e.g. TechFest Pvt Ltd" className={inputCls(!!errors.brand_name)} />
                <FieldError msg={errors.brand_name} />
              </div>
              <div>
                <Label>About your organization (optional)</Label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={3} placeholder="Brief description of events you plan to organize"
                  className="input-glass w-full text-sm py-3 resize-none" />
              </div>
            </div>
          </div>

          {/* ── Contact ── */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <SectionHeader s={s1} />
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full name <span className="text-brand-400">*</span></Label>
                  <input name="contact_name" value={form.contact_name} onChange={handleChange}
                    placeholder="Your name" className={inputCls(!!errors.contact_name)} />
                  <FieldError msg={errors.contact_name} />
                </div>
                <div>
                  <Label>Email <span className="text-brand-400">*</span></Label>
                  <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange}
                    placeholder="contact@company.com" className={inputCls(!!errors.contact_email)} />
                  <FieldError msg={errors.contact_email} />
                </div>
              </div>
              <div>
                <Label>Phone <span className="text-brand-400">*</span></Label>
                <input type="tel" name="contact_phone" value={form.contact_phone} onChange={handleChange}
                  placeholder="+91 98765 43210" className={inputCls(!!errors.contact_phone)} />
                <FieldError msg={errors.contact_phone} />
              </div>
            </div>
          </div>

          {/* ── Address ── */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <SectionHeader s={s2} />
            <div className="p-5 space-y-4">
              <div>
                <Label>Address line 1 <span className="text-brand-400">*</span></Label>
                <input name="address_line1" value={form.address_line1} onChange={handleChange}
                  placeholder="Street, building, block" className={inputCls(!!errors.address_line1)} />
                <FieldError msg={errors.address_line1} />
              </div>
              <div>
                <Label>Address line 2 (optional)</Label>
                <input name="address_line2" value={form.address_line2} onChange={handleChange}
                  placeholder="Landmark, suite, etc." className={inputCls()} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>City <span className="text-brand-400">*</span></Label>
                  <input name="city" value={form.city} onChange={handleChange}
                    placeholder="City" className={inputCls(!!errors.city)} />
                  <FieldError msg={errors.city} />
                </div>
                <div>
                  <Label>State <span className="text-brand-400">*</span></Label>
                  <input name="state" value={form.state} onChange={handleChange}
                    placeholder="State" className={inputCls(!!errors.state)} />
                  <FieldError msg={errors.state} />
                </div>
                <div>
                  <Label>Pincode / ZIP <span className="text-brand-400">*</span></Label>
                  <input name="pincode" value={form.pincode} onChange={handleChange}
                    placeholder="411001" className={inputCls(!!errors.pincode)} />
                  <FieldError msg={errors.pincode} />
                </div>
              </div>
              <div>
                <Label>Country <span className="text-brand-400">*</span></Label>
                <select name="country" value={form.country} onChange={handleChange}
                  className={inputCls(!!errors.country)}>
                  <option style={{ background: '#0b0f1a' }} value="India">India</option>
                  <option style={{ background: '#0b0f1a' }} value="United States">United States</option>
                  <option style={{ background: '#0b0f1a' }} value="United Kingdom">United Kingdom</option>
                  <option style={{ background: '#0b0f1a' }} value="Other">Other</option>
                </select>
                <FieldError msg={errors.country} />
              </div>
            </div>
          </div>

          {/* ── Optional ── */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <SectionHeader s={s3} />
            <div className="p-5">
              <Label>Website</Label>
              <input type="url" name="website" value={form.website} onChange={handleChange}
                placeholder="https://yourcompany.com" className={inputCls()} />
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-1">
            <button type="button" onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-300 transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !user}
              className="btn-primary px-7 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>

          {!user && (
            <p className="text-center text-slate-500 text-sm mt-2">
              You need to be logged in to apply.{" "}
              <a href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

/* ─── Section header sub-component ─── */
function SectionHeader({ s }: { s: typeof SECTIONS[number] }) {
  const Icon = s.icon;
  return (
    <div className="flex items-center gap-3 px-5 py-3.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: s.color }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${s.border}` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: s.text }} />
      </div>
      <h2 className="font-heading font-semibold text-white text-sm">{s.label}</h2>
    </div>
  );
}
