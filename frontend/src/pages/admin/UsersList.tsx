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
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Users List</h2>

      {loading ? (
        <p className="text-gray-600">Loading users...</p>
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
                  Organizer Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{u.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{u.email}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{u.role}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {u.organizer ? (
                      <span
                        className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                          u.organizer.kyc_status === "APPROVED"
                            ? "text-green-900"
                            : u.organizer.kyc_status === "PENDING"
                            ? "text-orange-900"
                            : "text-red-900"
                        } `}
                      >
                        <span
                          aria-hidden
                          className={`absolute inset-0 opacity-50 rounded-full ${
                            u.organizer.kyc_status === "APPROVED"
                              ? "bg-green-200"
                              : u.organizer.kyc_status === "PENDING"
                              ? "bg-orange-200"
                              : "bg-red-200"
                          }`}
                        ></span>
                        <span className="relative">{u.organizer.kyc_status}</span>
                      </span>
                    ) : (
                      <p className="text-gray-600 whitespace-no-wrap">N/A</p>
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {u.organizer && u.organizer.kyc_status === "PENDING" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => approve(u.organizer!._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reject(u.organizer!._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersList;
