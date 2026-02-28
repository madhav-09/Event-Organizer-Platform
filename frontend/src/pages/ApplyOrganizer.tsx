import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Building2,
  User,
  MapPin,
  Globe,
  ArrowRight,
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

    if (!form.brand_name.trim()) {
      next.brand_name = "Organization / brand name is required";
    }
    if (!form.contact_name.trim()) {
      next.contact_name = "Contact person name is required";
    }
    if (!form.contact_email.trim()) {
      next.contact_email = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      next.contact_email = "Enter a valid email address";
    }
    if (!form.contact_phone.trim()) {
      next.contact_phone = "Contact phone is required";
    } else if (!/^[+]?[\d\s-]{10,}$/.test(form.contact_phone.replace(/\s/g, ""))) {
      next.contact_phone = "Enter a valid phone number";
    }
    if (!form.address_line1.trim()) {
      next.address_line1 = "Address line 1 is required";
    }
    if (!form.city.trim()) {
      next.city = "City is required";
    }
    if (!form.state.trim()) {
      next.state = "State is required";
    }
    if (!form.pincode.trim()) {
      next.pincode = "Pincode / ZIP is required";
    }
    if (!form.country.trim()) {
      next.country = "Country is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

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
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Application failed. You may have already applied.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
  const errorClass = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Apply as Organizer
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in your organization and contact details. All fields marked with
            <span className="text-red-500"> *</span> are required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden"
        >
          {/* Organization */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              Organization / Brand
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="brand_name" className={labelClass}>
                  Organization or brand name <span className="text-red-500">*</span>
                </label>
                <input
                  id="brand_name"
                  name="brand_name"
                  value={form.brand_name}
                  onChange={handleChange}
                  placeholder="e.g. TechFest Pvt Ltd"
                  className={`${inputClass} ${errors.brand_name ? errorClass : ""}`}
                />
                {errors.brand_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand_name}</p>
                )}
              </div>
              <div>
                <label htmlFor="description" className={labelClass}>
                  About your organization (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of events you plan to organize"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              Contact person
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact_name" className={labelClass}>
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact_name"
                  name="contact_name"
                  value={form.contact_name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={`${inputClass} ${errors.contact_name ? errorClass : ""}`}
                />
                {errors.contact_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_name}</p>
                )}
              </div>
              <div>
                <label htmlFor="contact_email" className={labelClass}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className={`${inputClass} ${errors.contact_email ? errorClass : ""}`}
                />
                {errors.contact_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="contact_phone" className={labelClass}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                value={form.contact_phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className={`${inputClass} ${errors.contact_phone ? errorClass : ""}`}
              />
              {errors.contact_phone && (
                <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              Business address
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="address_line1" className={labelClass}>
                  Address line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  id="address_line1"
                  name="address_line1"
                  value={form.address_line1}
                  onChange={handleChange}
                  placeholder="Street, building, block"
                  className={`${inputClass} ${errors.address_line1 ? errorClass : ""}`}
                />
                {errors.address_line1 && (
                  <p className="text-red-500 text-sm mt-1">{errors.address_line1}</p>
                )}
              </div>
              <div>
                <label htmlFor="address_line2" className={labelClass}>
                  Address line 2 (optional)
                </label>
                <input
                  id="address_line2"
                  name="address_line2"
                  value={form.address_line2}
                  onChange={handleChange}
                  placeholder="Landmark, suite, etc."
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className={labelClass}>
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`${inputClass} ${errors.city ? errorClass : ""}`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="state" className={labelClass}>
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={`${inputClass} ${errors.state ? errorClass : ""}`}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="pincode" className={labelClass}>
                    Pincode / ZIP <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 411001"
                    className={`${inputClass} ${errors.pincode ? errorClass : ""}`}
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="country" className={labelClass}>
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.country ? errorClass : ""}`}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Other">Other</option>
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Optional */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              Additional (optional)
            </h2>
            <div>
              <label htmlFor="website" className={labelClass}>
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !user}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Submitting..." : "Submit application"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {!user && (
          <p className="text-center text-gray-500 mt-4 text-sm">
            You need to be logged in to apply.{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
