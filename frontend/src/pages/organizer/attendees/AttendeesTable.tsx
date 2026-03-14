import { CheckCircle, Clock, Users } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
        <Users className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm">No attendees for this event yet.</p>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-slate-500">
        {filter === "checked_in" ? (
          <>
            <Clock className="w-9 h-9 mb-3 opacity-30" />
            <p className="text-sm">No one has checked in yet.</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-9 h-9 mb-3 text-emerald-500 opacity-60" />
            <p className="text-sm font-medium text-emerald-400">All attendees have checked in! 🎉</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
            {["Name", "Email", "Ticket", "Qty", "Status"].map((h, i) => (
              <th key={h}
                className={`px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider ${i >= 3 ? "text-center" : "text-left"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((a, i) => (
            <tr
              key={a.booking_id}
              className="transition-colors hover:bg-[var(--glass-hover)]"
              style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--glass-border)' : undefined }}
            >
              <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">{a.user?.name ?? "—"}</td>
              <td className="px-5 py-3.5 text-[var(--text-secondary)]">{a.user?.email ?? "—"}</td>
              <td className="px-5 py-3.5 text-[var(--text-muted)]">{a.ticket ?? "—"}</td>
              <td className="px-5 py-3.5 text-center text-[var(--text-muted)]">{a.quantity}</td>
              <td className="px-5 py-3.5 text-center">
                {a.checked_in ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-500/30"
                    style={{ background: 'rgba(16,185,129,0.08)' }}>
                    <CheckCircle className="w-3 h-3" /> Checked In
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 border border-amber-500/30"
                    style={{ background: 'rgba(245,158,11,0.08)' }}>
                    <Clock className="w-3 h-3" /> Pending
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
