import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Ban, CheckCircle, XCircle, Loader2, Users } from "lucide-react";

type User = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  is_blocked?: boolean;
  organizer?: {
    _id: string;
    brand_name: string;
    kyc_status: "PENDING" | "APPROVED" | "REJECTED";
  };
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "text-red-400 border-red-500/30",
  ORGANIZER: "text-purple-400 border-purple-500/30",
  USER: "text-brand-300 border-brand-500/30",
};

const KYC_BADGE: Record<string, string> = {
  APPROVED: "text-emerald-400 border-emerald-500/30",
  PENDING: "text-amber-400 border-amber-500/30",
  REJECTED: "text-red-400 border-red-500/30",
};

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    api.get("/admin/users")
      .then((res) => {
        // API returns { users: [...], total: N }
        const data = res.data;
        setUsers(Array.isArray(data) ? data : (data?.users ?? []));
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || "Failed to load users";
        toast.error(Array.isArray(msg) ? msg[0]?.msg : msg);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const approve = async (organizerId: string) => {
    setActionId(organizerId);
    try {
      await api.put(`/admin/organizers/${organizerId}/approve`);
      setUsers(prev => prev.map(u => u.organizer && u.organizer._id === organizerId
        ? { ...u, organizer: { ...u.organizer, kyc_status: "APPROVED" } } : u));
      toast.success("Organizer approved");
    } catch { toast.error("Failed to approve"); }
    finally { setActionId(null); }
  };

  const reject = async (organizerId: string) => {
    setActionId(organizerId);
    try {
      await api.put(`/admin/organizers/${organizerId}/reject`);
      setUsers(prev => prev.map(u => u.organizer && u.organizer._id === organizerId
        ? { ...u, organizer: { ...u.organizer, kyc_status: "REJECTED" } } : u));
      toast.success("Organizer rejected");
    } catch { toast.error("Failed to reject"); }
    finally { setActionId(null); }
  };

  const blockUser = async (userId: string) => {
    setActionId(userId);
    try {
      await api.put(`/admin/users/${userId}/block`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, is_blocked: true } : u));
      toast.success("User blocked");
    } catch { toast.error("Failed to block"); }
    finally { setActionId(null); }
  };

  const unblockUser = async (userId: string) => {
    setActionId(userId);
    try {
      await api.put(`/admin/users/${userId}/unblock`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, is_blocked: false } : u));
      toast.success("User unblocked");
    } catch { toast.error("Failed to unblock"); }
    finally { setActionId(null); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-white text-xl">Users List</h2>
          <p className="text-slate-500 text-sm">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {["Name", "Email", "Role", "Status", "Organizer KYC", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const isActing = actionId === u._id || (u.organizer && actionId === u.organizer._id);
                  return (
                    <tr
                      key={u._id}
                      className="transition-colors hover:bg-white/3"
                      style={{ borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(108,71,236,0.7), rgba(79,70,229,0.7))' }}>
                            {u.name?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {u.name || "—"}
                              {u.is_blocked && <span className="ml-2 text-red-400 text-xs">(Blocked)</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-sm text-slate-400">{u.email || "—"}</td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${ROLE_BADGE[u.role] || ROLE_BADGE["USER"]}`}
                          style={{ background: 'rgba(255,255,255,0.05)' }}>
                          {u.role || "USER"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {u.is_blocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 border border-red-500/30"
                            style={{ background: 'rgba(239,68,68,0.08)' }}>
                            <Ban className="w-3 h-3" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-500/30"
                            style={{ background: 'rgba(16,185,129,0.08)' }}>
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* Organizer KYC */}
                      <td className="px-5 py-4">
                        {u.organizer ? (
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${KYC_BADGE[u.organizer.kyc_status] || ""}`}
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {u.organizer.kyc_status}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {u.organizer && u.organizer.kyc_status === "PENDING" && (
                            <>
                              <button
                                onClick={() => approve(u.organizer!._id)}
                                disabled={!!isActing}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                                style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
                              >
                                {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                Approve
                              </button>
                              <button
                                onClick={() => reject(u.organizer!._id)}
                                disabled={!!isActing}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}
                          {u.is_blocked ? (
                            <button
                              onClick={() => unblockUser(u._id)}
                              disabled={!!isActing}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                              style={{ background: 'rgba(100,116,139,0.2)', border: '1px solid rgba(100,116,139,0.3)' }}
                            >
                              {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => blockUser(u._id)}
                              disabled={!!isActing}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 transition-all disabled:opacity-50"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                            >
                              {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                              Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">No users found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
