import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
// import { User } from "lucide-react";

export default function ApplyOrganizer() {
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const apply = async () => {
    if (!brandName.trim()) return;

    try {
      setLoading(true);
      await api.post("/organizers/apply", {
        user_id:user?.id,
        brand_name: brandName,
      });

      navigate("/"); // or dashboard
    } catch {
      alert("You have already applied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Apply as Organizer</h2>

        <label className="block text-sm font-medium mb-1">
          Organization / Brand Name
        </label>

        <input
          value={brandName}
          onChange={e => setBrandName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Eg: TechFest Pvt Ltd"
        />

        <button
          onClick={apply}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
