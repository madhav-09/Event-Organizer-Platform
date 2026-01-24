import { useEffect, useState } from "react";
import {
  FaUsers,
  FaDollarSign,
  FaCalendarAlt,
  FaChartLine,
} from "react-icons/fa";
import api from "../../services/api";

interface OverviewStats {
  total_events: number;
  total_registrations: number;
  total_revenue: number;
  upcoming_events: number;
}

export default function Overview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/organizers/me/overview")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-6">Loading overview...</p>;
  }

  if (!stats) {
    return <p className="p-6 text-red-500">Failed to load overview</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Organizer Dashboard
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Track performance, manage events, and grow your audience
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={stats.total_events}
          icon={<FaCalendarAlt />}
        />

        <StatCard
          title="Registrations"
          value={stats.total_registrations}
          icon={<FaUsers />}
        />

        <StatCard
          title="Revenue"
          value={`₹${stats.total_revenue.toLocaleString()}`}
          icon={<FaDollarSign />}
        />

        <StatCard
          title="Upcoming Events"
          value={stats.upcoming_events}
          icon={<FaChartLine />}
        />
      </div>

      {/* ANALYTICS PLACEHOLDER */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-50 rounded flex items-center justify-center text-gray-400">
            Registrations chart (coming next)
          </div>
          <div className="h-40 bg-gray-50 rounded flex items-center justify-center text-gray-400">
            Revenue chart (coming next)
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="text-purple-500 text-3xl opacity-70">
        {icon}
      </div>
    </div>
  );
}
