import { FaQrcode } from "react-icons/fa";

type Props = {
  attendees: any[];
  onCheckIn: (bookingId: string) => void;
};

export default function AttendeesTable({ attendees, onCheckIn }: Props) {
  if (!attendees.length) {
    return <p className="text-gray-500">No attendees yet</p>;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-100 text-xs uppercase">
          <tr>
            <th className="px-5 py-3 text-left">Name</th>
            <th className="px-5 py-3 text-left">Email</th>
            <th className="px-5 py-3 text-left">Ticket</th>
            <th className="px-5 py-3 text-left">Qty</th>
            <th className="px-5 py-3 text-left">Check-in</th>
          </tr>
        </thead>

        <tbody>
          {attendees.map((a) => (
            <tr key={a.booking_id} className="border-b">
              <td className="px-5 py-3">{a.user.name}</td>
              <td className="px-5 py-3">{a.user.email}</td>
              <td className="px-5 py-3">{a.ticket}</td>
              <td className="px-5 py-3">{a.quantity}</td>
              <td className="px-5 py-3">
                {a.checked_in ? (
                  <span className="text-green-600 font-semibold">
                    Checked In
                  </span>
                ) : (
                  <button
                    onClick={() => onCheckIn(a.booking_id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-2"
                  >
                    <FaQrcode /> Check-in
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
