import { useEffect, useState } from "react";
import api from "../../services/api";
import { Building2, Loader2, CheckCircle, XCircle, Clock, Users } from "lucide-react";

type Organizer = {
  _id: string;
  brand_name: string;
  description: string;
  kyc_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    is_verified: boolean;
    created_at: string;
  };
};

const KYC_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  APPROVED: {
    label: "Approved",
    className: "text-emerald-400 border-emerald-500/30",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  PENDING: {
    label: "Pending",
    className: "text-amber-400 border-amber-500/30",
    icon: <Clock className="w-3 h-3" />,
  },
  REJECTED: {
    label: "Rejected",
    className: "text-red-400 border-red-500/30",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const Organizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/organizers")
      .then(res => setOrganizers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id: string) => {
    setActionId(id);
    try {
      await api.put(`/admin/organizers/${id}/approve`);
      setOrganizers(prev => prev.map(o => o._id === id ? { ...o, kyc_status: "APPROVED" } : o));
    } finally { setActionId(null); }
  };

  const reject = async (id: string) => {
    setActionId(id);
    try {
      await api.put(`/admin/organizers/${id}/reject`);
      setOrganizers(prev => prev.map(o => o._id === id ? { ...o, kyc_status: "REJECTED" } : o));
    } finally { setActionId(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(108,71,236,0.15)', border: '1px solid rgba(108,71,236,0.25)' }}>
          <Users className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-white text-xl">Organizer Requests</h2>
          <p className="text-slate-500 text-sm">{organizers.length} organizer{organizers.length !== 1 ? "s" : ""} registered</p>
        </div>
      </div>

      {organizers.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No organizer requests found</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {["Brand", "Owner", "Email", "KYC Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {organizers.map((o, i) => {
                  const badge = KYC_BADGE[o.kyc_status] ?? KYC_BADGE.PENDING;
                  const isActing = actionId === o._id;
                  return (
                    <tr
                      key={o._id}
                      className="transition-colors hover:bg-white/3"
                      style={{ borderBottom: i < organizers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(108,71,236,0.6), rgba(79,70,229,0.6))' }}>
                            {o.brand_name?.[0]?.toUpperCase() ?? "B"}
                          </div>
                          <span className="text-white text-sm font-medium">{o.brand_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{o.user.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">{o.user.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.className}`}
                          style={{ background: 'rgba(255,255,255,0.05)' }}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        {o.kyc_status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approve(o._id)}
                              disabled={isActing}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                              style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
                            >
                              {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Approve
                            </button>
                            <button
                              onClick={() => reject(o._id)}
                              disabled={isActing}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        )}
                        {o.kyc_status !== "PENDING" && (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizers;