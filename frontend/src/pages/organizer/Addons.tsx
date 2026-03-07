import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaPlusCircle } from 'react-icons/fa';

interface Addon {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  image: string | null;
}

const dummyAddons: Addon[] = [
  {
    _id: 'a1',
    name: 'Event T-Shirt',
    description: 'High-quality cotton t-shirt with event logo.',
    price: 15.00,
    quantityTotal: 100,
    quantitySold: 30,
    image: 'https://via.placeholder.com/100.png?text=T-Shirt',
  },
  {
    _id: 'a2',
    name: 'VIP Parking Pass',
    description: 'Guaranteed parking spot near the venue entrance.',
    price: 10.00,
    quantityTotal: 50,
    quantitySold: 20,
    image: 'https://via.placeholder.com/100.png?text=Parking+Pass',
  },
];

const Addons = () => {
  const [addons, setAddons] = useState<Addon[]>(dummyAddons);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);

  const handleAddEditAddon = (addon: Addon) => {
    if (editingAddon) {
      setAddons((prev) => prev.map((a) => (a._id === addon._id ? addon : a)));
    } else {
      setAddons((prev) => [...prev, { ...addon, _id: `a${prev.length + 1}` }]);
    }
    setShowAddEditModal(false);
    setEditingAddon(null);
  };

  const handleDeleteAddon = (id: string) => {
    setAddons((prev) => prev.filter((a) => a._id !== id));
  };

  const openEditModal = (addon: Addon) => {
    setEditingAddon(addon);
    setShowAddEditModal(true);
  };

  const openAddModal = () => {
    setEditingAddon(null);
    setShowAddEditModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingAddon) {
          setEditingAddon((prev) => ({
            ...prev!,
            image: reader.result as string,
          }));
        } else {
          // For new addon, will be handled when form is submitted
          // For now, just store in a temp state or directly in the form handler if creating new
          console.log('New addon image uploaded:', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Add-ons</h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaPlus className="inline-block mr-2" /> Add New Add-on
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quantity (Sold/Total)
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {addons.map((addon) => (
              <tr key={addon._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {addon.image ? (
                    <img src={addon.image} alt={addon.name} className="w-16 h-16 object-cover rounded-md" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                      <FaPlusCircle size={24} />
                    </div>
                  )}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{addon.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{addon.description}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">₹{addon.price.toFixed(2)}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {addon.quantitySold} / {addon.quantityTotal}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openEditModal(addon)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Add-on"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteAddon(addon._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Add-on"
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

      {/* Add/Edit Add-on Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="addon-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">{editingAddon ? 'Edit Add-on' : 'Add New Add-on'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newAddon: Addon = {
                  _id: editingAddon?._id || `a${addons.length + 1}`,
                  name: form.addonName.value,
                  description: form.addonDescription.value,
                  price: parseFloat(form.addonPrice.value),
                  quantityTotal: parseInt(form.quantityTotal.value),
                  quantitySold: editingAddon?.quantitySold || 0,
                  image: editingAddon?.image || null, // Image handling can be more complex
                };
                handleAddEditAddon(newAddon);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="addonName" className="block text-sm font-medium text-gray-700">Add-on Name</label>
                <input
                  type="text"
                  name="addonName"
                  id="addonName"
                  defaultValue={editingAddon?.name || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="addonDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="addonDescription"
                  id="addonDescription"
                  rows={3}
                  defaultValue={editingAddon?.description || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="addonPrice" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="addonPrice"
                  id="addonPrice"
                  step="0.01"
                  defaultValue={editingAddon?.price || ''}
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
                  defaultValue={editingAddon?.quantityTotal || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="addonImage" className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  name="addonImage"
                  id="addonImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {editingAddon?.image && (
                  <img src={editingAddon.image} alt="Add-on" className="mt-2 w-24 h-24 object-cover rounded-md" />
                )}
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
                  {editingAddon ? 'Save Changes' : 'Add Add-on'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addons;
