import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout"

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
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Organizer Requests</h2>

      {loading ? (
        <p>Loading organizer requests...</p>
      ) : organizers.length === 0 ? (
        <p className="text-gray-500">No pending requests</p>
      ) : (
        <div className="space-y-4">
          {organizers.map(o => (
            <div
              key={o._id}
              className="border rounded-lg p-4 flex justify-between items-center bg-white shadow"
            >
              <div>
                <p className="font-semibold text-lg">{o.name}</p>
                <p className="text-sm text-gray-500">{o.email}</p>
                <p className="text-sm">
                  KYC Status:{" "}
                  <span
                    className={
                      o.kyc_status === "APPROVED"
                        ? "text-green-600 font-medium"
                        : o.kyc_status === "REJECTED"
                        ? "text-red-600 font-medium"
                        : "text-orange-600 font-medium"
                    }
                  >
                    {o.kyc_status}
                  </span>
                </p>
              </div>

              {o.kyc_status === "PENDING" && (
                <div className="space-x-2">
                  <button
                    onClick={() => approve(o._id)}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(o._id)}
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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

export default Organizers;
