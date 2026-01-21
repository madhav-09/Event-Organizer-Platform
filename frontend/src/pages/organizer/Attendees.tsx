import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface Attendee {
  _id: string;
  name: string;
  email: string;
  ticketType: string;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  checkInStatus: 'Checked In' | 'Not Checked In';
}

const dummyAttendees: Attendee[] = [
  {
    _id: '1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    ticketType: 'VIP',
    paymentStatus: 'Paid',
    checkInStatus: 'Checked In',
  },
  {
    _id: '2',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    ticketType: 'General Admission',
    paymentStatus: 'Paid',
    checkInStatus: 'Not Checked In',
  },
  {
    _id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    ticketType: 'Early Bird',
    paymentStatus: 'Pending',
    checkInStatus: 'Not Checked In',
  },
  {
    _id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    ticketType: 'VIP',
    paymentStatus: 'Paid',
    checkInStatus: 'Checked In',
  },
];

const Attendees = () => {
  const [attendees, setAttendees] = useState<Attendee[]>(dummyAttendees);

  const handleCheckIn = (id: string) => {
    setAttendees((prevAttendees) =>
      prevAttendees.map((attendee) =>
        attendee._id === id
          ? { ...attendee, checkInStatus: 'Checked In' }
          : attendee
      )
    );
  };

  const handleCheckOut = (id: string) => {
    setAttendees((prevAttendees) =>
      prevAttendees.map((attendee) =>
        attendee._id === id
          ? { ...attendee, checkInStatus: 'Not Checked In' }
          : attendee
      )
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Attendees List</h2>

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
                Ticket Type
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Check-in Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((attendee) => (
              <tr key={attendee._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{attendee.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{attendee.email}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{attendee.ticketType}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      attendee.paymentStatus === 'Paid'
                        ? 'text-green-900'
                        : attendee.paymentStatus === 'Pending'
                        ? 'text-orange-900'
                        : 'text-red-900'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 opacity-50 rounded-full ${
                        attendee.paymentStatus === 'Paid'
                          ? 'bg-green-200'
                          : attendee.paymentStatus === 'Pending'
                          ? 'bg-orange-200'
                          : 'bg-red-200'
                      }`}
                    ></span>
                    <span className="relative">{attendee.paymentStatus}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      attendee.checkInStatus === 'Checked In'
                        ? 'text-green-900'
                        : 'text-red-900'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 opacity-50 rounded-full ${
                        attendee.checkInStatus === 'Checked In'
                          ? 'bg-green-200'
                          : 'bg-red-200'
                      }`}
                    ></span>
                    <span className="relative">{attendee.checkInStatus}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {attendee.checkInStatus === 'Not Checked In' ? (
                    <button
                      onClick={() => handleCheckIn(attendee._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      <FaCheckCircle className="inline-block mr-1" /> Check In
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckOut(attendee._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      <FaTimesCircle className="inline-block mr-1" /> Check Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendees;
