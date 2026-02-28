import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Ban, CheckCircle, XCircle, Loader2 } from "lucide-react";

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

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    api
      .get("/admin/users")
      .then((res) => {
        setUsers(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.detail ||
          (typeof err?.response?.data === "string" ? err.response.data : null) ||
          "Failed to load users";
        setError(Array.isArray(msg) ? msg[0]?.msg : msg);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approve = async (organizerId: string) => {
    setActionId(organizerId);
    try {
      await api.put(`/admin/organizers/${organizerId}/approve`);
      setUsers((prev) =>
        prev.map((u) =>
          u.organizer && u.organizer._id === organizerId
            ? { ...u, organizer: { ...u.organizer, kyc_status: "APPROVED" } }
            : u
        )
      );
      toast.success("Organizer approved");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to approve");
    } finally {
      setActionId(null);
    }
  };

  const reject = async (organizerId: string) => {
    setActionId(organizerId);
    try {
      await api.put(`/admin/organizers/${organizerId}/reject`);
      setUsers((prev) =>
        prev.map((u) =>
          u.organizer && u.organizer._id === organizerId
            ? { ...u, organizer: { ...u.organizer, kyc_status: "REJECTED" } }
            : u
        )
      );
      toast.success("Organizer rejected");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to reject");
    } finally {
      setActionId(null);
    }
  };

  const blockUser = async (userId: string) => {
    setActionId(userId);
    try {
      await api.put(`/admin/users/${userId}/block`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, is_blocked: true } : u))
      );
      toast.success("User blocked");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to block user");
    } finally {
      setActionId(null);
    }
  };

  const unblockUser = async (userId: string) => {
    setActionId(userId);
    try {
      await api.put(`/admin/users/${userId}/unblock`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, is_blocked: false } : u))
      );
      toast.success("User unblocked");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Failed to unblock user");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Users List</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
            <button
              type="button"
              onClick={fetchUsers}
              className="ml-4 text-sm font-medium underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className={u.is_blocked ? "bg-red-50" : ""}>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 font-medium">
                        {u.name || "—"}
                        {u.is_blocked && (
                          <span className="ml-2 text-red-600 text-xs">(Blocked)</span>
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900">{u.email || "—"}</p>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-medium">
                        {u.role || "USER"}
                      </span>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {u.is_blocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Ban size={12} /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {u.organizer ? (
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            u.organizer.kyc_status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : u.organizer.kyc_status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.organizer.kyc_status}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        {u.organizer && u.organizer.kyc_status === "PENDING" && (
                          <>
                            <button
                              onClick={() => approve(u.organizer!._id)}
                              disabled={actionId !== null}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionId === u.organizer._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <CheckCircle size={12} />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => reject(u.organizer!._id)}
                              disabled={actionId !== null}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {u.is_blocked ? (
                          <button
                            onClick={() => unblockUser(u._id)}
                            disabled={actionId !== null}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50"
                          >
                            {actionId === u._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : null}
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => blockUser(u._id)}
                            disabled={actionId !== null}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50"
                          >
                            {actionId === u._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Ban size={12} />
                            )}
                            Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-8">No users found</p>
            )}
          </div>
        )}
      </div>
  );
}
