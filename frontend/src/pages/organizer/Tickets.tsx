import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTicketAlt } from 'react-icons/fa';

interface TicketType {
  _id: string;
  name: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  availableFrom: string;
  availableTo: string;
}

const dummyTicketTypes: TicketType[] = [
  {
    _id: 't1',
    name: 'Early Bird',
    price: 25.00,
    quantityTotal: 100,
    quantitySold: 40,
    availableFrom: '2026-01-01',
    availableTo: '2026-02-28',
  },
  {
    _id: 't2',
    name: 'General Admission',
    price: 40.00,
    quantityTotal: 500,
    quantitySold: 120,
    availableFrom: '2026-03-01',
    availableTo: '2026-03-14',
  },
  {
    _id: 't3',
    name: 'VIP Pass',
    price: 100.00,
    quantityTotal: 50,
    quantitySold: 15,
    availableFrom: '2026-01-01',
    availableTo: '2026-03-14',
  },
];

const Tickets = () => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(dummyTicketTypes);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);

  const handleAddEditTicket = (ticket: TicketType) => {
    if (editingTicket) {
      setTicketTypes((prev) =>
        prev.map((t) => (t._id === ticket._id ? ticket : t))
      );
    } else {
      setTicketTypes((prev) => [...prev, { ...ticket, _id: String(prev.length + 1) }]);
    }
    setShowAddEditModal(false);
    setEditingTicket(null);
  };

  const handleDeleteTicket = (id: string) => {
    setTicketTypes((prev) => prev.filter((t) => t._id !== id));
  };

  const openEditModal = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setShowAddEditModal(true);
  };

  const openAddModal = () => {
    setEditingTicket(null);
    setShowAddEditModal(true);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Ticket Types</h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaPlus className="inline-block mr-2" /> Add New Ticket
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quantity (Sold/Total)
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {ticketTypes.map((ticket) => (
              <tr key={ticket._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{ticket.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">₹{ticket.price.toFixed(2)}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {ticket.quantitySold} / {ticket.quantityTotal}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {ticket.availableFrom} to {ticket.availableTo}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openEditModal(ticket)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(ticket._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Ticket Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">{editingTicket ? 'Edit Ticket Type' : 'Add New Ticket Type'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newTicket: TicketType = {
                  _id: editingTicket?._id || String(ticketTypes.length + 1),
                  name: form.ticketName.value,
                  price: parseFloat(form.ticketPrice.value),
                  quantityTotal: parseInt(form.quantityTotal.value),
                  quantitySold: editingTicket?.quantitySold || 0,
                  availableFrom: form.availableFrom.value,
                  availableTo: form.availableTo.value,
                };
                handleAddEditTicket(newTicket);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="ticketName" className="block text-sm font-medium text-gray-700">Ticket Name</label>
                <input
                  type="text"
                  name="ticketName"
                  id="ticketName"
                  defaultValue={editingTicket?.name || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="ticketPrice"
                  id="ticketPrice"
                  step="0.01"
                  defaultValue={editingTicket?.price || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="quantityTotal" className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input
                  type="number"
                  name="quantityTotal"
                  id="quantityTotal"
                  defaultValue={editingTicket?.quantityTotal || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700">Available From</label>
                <input
                  type="date"
                  name="availableFrom"
                  id="availableFrom"
                  defaultValue={editingTicket?.availableFrom || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="availableTo" className="block text-sm font-medium text-gray-700">Available To</label>
                <input
                  type="date"
                  name="availableTo"
                  id="availableTo"
                  defaultValue={editingTicket?.availableTo || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingTicket ? 'Save Changes' : 'Add Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
