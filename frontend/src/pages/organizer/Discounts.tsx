import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface DiscountCode {
  _id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number; // Percentage (e.g., 10 for 10%) or fixed amount (e.g., 50 for $50)
  appliesToTicketType: string; // e.g., 'All' or a specific ticket type ID/name
  usageLimit: number; // Max number of times the code can be used
  usedCount: number; // How many times it has been used
  expiresAt: string; // ISO date string
}

const dummyDiscountCodes: DiscountCode[] = [
  {
    _id: 'd1',
    code: 'EARLYBIRD20',
    type: 'PERCENTAGE',
    value: 20,
    appliesToTicketType: 'Early Bird',
    usageLimit: 50,
    usedCount: 15,
    expiresAt: '2026-02-15',
  },
  {
    _id: 'd2',
    code: 'SAVE10',
    type: 'FIXED_AMOUNT',
    value: 10,
    appliesToTicketType: 'All',
    usageLimit: 100,
    usedCount: 30,
    expiresAt: '2026-03-10',
  },
  {
    _id: 'd3',
    code: 'VIPEXCLUSIVE',
    type: 'PERCENTAGE',
    value: 15,
    appliesToTicketType: 'VIP Pass',
    usageLimit: 20,
    usedCount: 5,
    expiresAt: '2026-03-14',
  },
];

const Discounts = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(dummyDiscountCodes);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);

  const handleAddEditDiscount = (discount: DiscountCode) => {
    if (editingDiscount) {
      setDiscountCodes((prev) =>
        prev.map((d) => (d._id === discount._id ? discount : d))
      );
    } else {
      setDiscountCodes((prev) => [...prev, { ...discount, _id: `d${prev.length + 1}` }]);
    }
    setShowAddEditModal(false);
    setEditingDiscount(null);
  };

  const handleDeleteDiscount = (id: string) => {
    setDiscountCodes((prev) => prev.filter((d) => d._id !== id));
  };

  const openEditModal = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setShowAddEditModal(true);
  };

  const openAddModal = () => {
    setEditingDiscount(null);
    setShowAddEditModal(true);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Discount Codes</h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaPlus className="inline-block mr-2" /> Create New Discount
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Code
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Value
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Applies To
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Usage (Used/Limit)
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Expires At
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {discountCodes.map((discount) => (
              <tr key={discount._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{discount.code}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{discount.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `₹${discount.value.toFixed(2)}`}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{discount.appliesToTicketType}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {discount.usedCount} / {discount.usageLimit}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{discount.expiresAt}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openEditModal(discount)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Discount"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDiscount(discount._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Discount"
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

      {/* Add/Edit Discount Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="discount-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">{editingDiscount ? 'Edit Discount Code' : 'Create New Discount Code'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newDiscount: DiscountCode = {
                  _id: editingDiscount?._id || `d${discountCodes.length + 1}`,
                  code: form.discountCode.value,
                  type: form.discountType.value as 'PERCENTAGE' | 'FIXED_AMOUNT',
                  value: parseFloat(form.discountValue.value),
                  appliesToTicketType: form.appliesTo.value,
                  usageLimit: parseInt(form.usageLimit.value),
                  usedCount: editingDiscount?.usedCount || 0,
                  expiresAt: form.expiresAt.value,
                };
                handleAddEditDiscount(newDiscount);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700">Discount Code</label>
                <input
                  type="text"
                  name="discountCode"
                  id="discountCode"
                  defaultValue={editingDiscount?.code || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="discountType"
                  id="discountType"
                  defaultValue={editingDiscount?.type || 'PERCENTAGE'}
                  onChange={(e) => handleChange(e)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="number"
                  name="discountValue"
                  id="discountValue"
                  step="0.01"
                  defaultValue={editingDiscount?.value || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="appliesTo" className="block text-sm font-medium text-gray-700">Applies To (Ticket Type Name or 'All')</label>
                <input
                  type="text"
                  name="appliesTo"
                  id="appliesTo"
                  defaultValue={editingDiscount?.appliesToTicketType || 'All'}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  id="usageLimit"
                  defaultValue={editingDiscount?.usageLimit || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">Expires At</label>
                <input
                  type="date"
                  name="expiresAt"
                  id="expiresAt"
                  defaultValue={editingDiscount?.expiresAt || ''}
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
                  {editingDiscount ? 'Save Changes' : 'Create Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts;
