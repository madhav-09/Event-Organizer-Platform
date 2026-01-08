import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  organizer?: {
    _id: string;
    brand_name: string;
    kyc_status: "PENDING" | "APPROVED" | "REJECTED";
  };
};


const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/users").then(res => {
      setUsers(res.data);
      setLoading(false);
    });
  }, []);

  const approve = async (id: string) => {
    await api.put(`/admin/organizers/${id}/approve`);
    setUsers(prev =>
      prev.map(u =>
        u.organizer && u.organizer._id === id
          ? { ...u, organizer: { ...u.organizer, kyc_status: "APPROVED" } }
          : u
      )
    );
  };

  const reject = async (id: string) => {
    await api.put(`/admin/organizers/${id}/reject`);
    setUsers(prev =>
      prev.map(u =>
        u.organizer && u.organizer._id === id
          ? { ...u, organizer: { ...u.organizer, kyc_status: "REJECTED" } }
          : u
      )
    );
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="space-y-4">
          {users.map(u => (
            <div
              key={u._id}
              className="border rounded-lg p-4 flex justify-between items-center bg-white shadow"
            >
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
                <p className="text-sm">
                  Role: <span className="font-medium">{u.role}</span>
                </p>
                {u.organizer && (
                  <p className="text-sm">
                    Organizer Status:{" "}
                    <span className="font-medium text-orange-600">
                      {u.organizer.kyc_status}
                    </span>
                  </p>
                )}
              </div>

              {u.organizer && u.organizer.kyc_status === "PENDING" && (
                <div className="space-x-2">
                  <button
                    onClick={() => approve(u.organizer!._id)}
                    className="px-4 py-1 bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(u.organizer!._id)}
                    className="px-4 py-1 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersList;
