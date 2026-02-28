import { useEffect, useState } from "react";
import api from "../../services/api";

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

const Organizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("http://127.0.0.1:8000/admin/organizers")
      .then(res => {
        setOrganizers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const approve = async (id: string) => {
    await api.put(`http://127.0.0.1:8000/admin/organizers/${id}/approve`);
    setOrganizers(prev =>
      prev.map(o =>
        o._id === id ? { ...o, kyc_status: "APPROVED" } : o
      )
    );
  };

  const reject = async (id: string) => {
    await api.put(`http://127.0.0.1:8000/admin/organizers/${id}/reject`);
    setOrganizers(prev =>
      prev.map(o =>
        o._id === id ? { ...o, kyc_status: "REJECTED" } : o
      )
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Organizer Requests
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading organizer requests...</p>
      ) : organizers.length === 0 ? (
        <p className="text-gray-500">No requests found</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                  Brand Name
                </th>
                <th className="px-5 py-3 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-5 py-3 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-5 py-3 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                  KYC Status
                </th>
                <th className="px-5 py-3 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                  Created At
                </th>
                <th className="px-5 py-3 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((o) => (
                <tr key={o._id}>
                  <td className="px-5 py-5 border-b text-sm">
                    {o.brand_name}
                  </td>

                  <td className="px-5 py-5 border-b text-sm">
                    {o.user.name}
                  </td>

                  <td className="px-5 py-5 border-b text-sm">
                    {o.user.email}
                  </td>

                  <td className="px-5 py-5 border-b text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        o.kyc_status === "APPROVED"
                          ? "bg-green-200 text-green-900"
                          : o.kyc_status === "PENDING"
                          ? "bg-orange-200 text-orange-900"
                          : "bg-red-200 text-red-900"
                      }`}
                    >
                      {o.kyc_status}
                    </span>
                  </td>

                  <td className="px-5 py-5 border-b text-sm">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-5 border-b text-sm">
                    {o.kyc_status === "PENDING" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => approve(o._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reject(o._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
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

export default Organizers;