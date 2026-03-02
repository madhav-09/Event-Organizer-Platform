import { FiCheckCircle, FiClock, FiUsers } from "react-icons/fi";

type Props = {
  attendees: any[];
  filter: "checked_in" | "not_checked_in";
};

export default function AttendeesTable({ attendees, filter }: Props) {
  const filtered = attendees.filter((a) =>
    filter === "checked_in" ? a.checked_in : !a.checked_in
  );

  if (!attendees.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FiUsers size={40} className="mb-3 opacity-40" />
        <p className="text-sm">No attendees for this event yet.</p>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-gray-400">
        {filter === "checked_in" ? (
          <>
            <FiCheckCircle size={36} className="mb-3 opacity-30" />
            <p className="text-sm">No one has checked in yet.</p>
          </>
        ) : (
          <>
            <FiCheckCircle size={36} className="mb-3 text-green-400 opacity-60" />
            <p className="text-sm font-medium text-green-600">All attendees have checked in! 🎉</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
            <th className="px-5 py-3 text-left font-semibold">Name</th>
            <th className="px-5 py-3 text-left font-semibold">Email</th>
            <th className="px-5 py-3 text-left font-semibold">Ticket</th>
            <th className="px-5 py-3 text-center font-semibold">Qty</th>
            <th className="px-5 py-3 text-center font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.map((a) => (
            <tr
              key={a.booking_id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-5 py-3 font-medium text-gray-800">{a.user?.name ?? "—"}</td>
              <td className="px-5 py-3 text-gray-500">{a.user?.email ?? "—"}</td>
              <td className="px-5 py-3 text-gray-700">{a.ticket ?? "—"}</td>
              <td className="px-5 py-3 text-center text-gray-700">{a.quantity}</td>
              <td className="px-5 py-3 text-center">
                {a.checked_in ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <FiCheckCircle size={12} /> Checked In
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    <FiClock size={12} /> Pending
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
