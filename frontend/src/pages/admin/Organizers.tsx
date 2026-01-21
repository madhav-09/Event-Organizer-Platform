import { useEffect, useState } from "react";
import api from "../../services/api";

type Organizer = {
  _id: string;
  name: string;
  email: string;
  kyc_status: "PENDING" | "APPROVED" | "REJECTED";
};

const Organizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/organizers").then(res => {
      setOrganizers(res.data);
      setLoading(false);
    });
  }, []);

  const approve = async (id: string) => {
    await api.put(`/admin/organizers/${id}/approve`);
    setOrganizers(prev =>
      prev.map(o =>
        o._id === id ? { ...o, kyc_status: "APPROVED" } : o
      )
    );
  };

  const reject = async (id: string) => {
    await api.put(`/admin/organizers/${id}/reject`);
    setOrganizers(prev =>
      prev.map(o =>
        o._id === id ? { ...o, kyc_status: "REJECTED" } : o
      )
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Organizer Requests</h2>

      {loading ? (
        <p className="text-gray-600">Loading organizer requests...</p>
      ) : organizers.length === 0 ? (
        <p className="text-gray-500">No pending requests</p>
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
                  KYC Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((o) => (
                <tr key={o._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{o.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{o.email}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span
                      className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        o.kyc_status === "APPROVED"
                          ? "text-green-900"
                          : o.kyc_status === "PENDING"
                          ? "text-orange-900"
                          : "text-red-900"
                      } `}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-0 opacity-50 rounded-full ${
                          o.kyc_status === "APPROVED"
                            ? "bg-green-200"
                            : o.kyc_status === "PENDING"
                            ? "bg-orange-200"
                            : "bg-red-200"
                        }`}
                      ></span>
                      <span className="relative">{o.kyc_status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {o.kyc_status === "PENDING" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => approve(o._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reject(o._id)}
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

export default Organizers;
