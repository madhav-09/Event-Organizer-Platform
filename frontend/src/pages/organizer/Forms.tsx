import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  options?: string[]; // For select type
  required: boolean;
}

interface CustomForm {
  _id: string;
  name: string;
  description: string;
  fields: FormField[];
}

const dummyForms: CustomForm[] = [
  {
    _id: 'form1',
    name: 'Pre-Event Survey',
    description: 'A short survey to gather attendee preferences before the event.',
    fields: [
      { id: 'f1', label: 'Dietary Restrictions', type: 'text', required: false },
      { id: 'f2', label: 'T-shirt Size', type: 'select', options: ['S', 'M', 'L', 'XL'], required: true },
      { id: 'f3', label: 'Attend Networking Event', type: 'checkbox', required: false },
    ],
  },
  {
    _id: 'form2',
    name: 'Post-Event Feedback',
    description: 'Help us improve by providing your feedback after the event.',
    fields: [
      { id: 'f4', label: 'Overall Experience', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'], required: true },
      { id: 'f5', label: 'Comments', type: 'textarea', required: false },
    ],
  },
];

const dummyFormResponses = {
  form1: [
    { attendeeId: 'a1', responses: { f1: 'Vegetarian', f2: 'M', f3: true } },
    { attendeeId: 'a2', responses: { f1: 'None', f2: 'L', f3: false } },
  ],
  form2: [
    { attendeeId: 'a1', responses: { f4: 'Excellent', f5: 'Great event!' } },
  ],
};

const Forms = () => {
  const [forms, setForms] = useState<CustomForm[]>(dummyForms);
  const [showAddEditFormModal, setShowAddEditFormModal] = useState(false);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [currentFormResponses, setCurrentFormResponses] = useState<any[]>([]);

  const handleAddEditForm = (form: CustomForm) => {
    if (editingForm) {
      setForms((prev) => prev.map((f) => (f._id === form._id ? form : f)));
    } else {
      setForms((prev) => [...prev, { ...form, _id: `form${prev.length + 1}` }]);
    }
    setShowAddEditFormModal(false);
    setEditingForm(null);
  };

  const handleDeleteForm = (id: string) => {
    setForms((prev) => prev.filter((f) => f._id !== id));
  };

  const openEditFormModal = (form: CustomForm) => {
    setEditingForm(form);
    setShowAddEditFormModal(true);
  };

  const openAddFormModal = () => {
    setEditingForm(null);
    setShowAddEditFormModal(true);
  };

  const viewResponses = (formId: string) => {
    setCurrentFormResponses(dummyFormResponses[formId] || []);
    setShowResponsesModal(true);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Custom Forms</h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={openAddFormModal}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaPlus className="inline-block mr-2" /> Create New Form
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Form Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Number of Fields
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{form.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{form.description}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{form.fields.length}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => viewResponses(form._id)}
                      className="text-green-600 hover:text-green-900"
                      title="View Responses"
                    >
                      <FaEye size={18} />
                    </button>
                    <button
                      onClick={() => openEditFormModal(form)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Form"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Form"
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

      {/* Add/Edit Form Modal */}
      {showAddEditFormModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="form-modal">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">{editingForm ? 'Edit Custom Form' : 'Create New Custom Form'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newForm: CustomForm = {
                  _id: editingForm?._id || `form${forms.length + 1}`,
                  name: form.formName.value,
                  description: form.formDescription.value,
                  fields: [], // Simplified for now, actual field management would be more complex
                };
                handleAddEditForm(newForm);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="formName" className="block text-sm font-medium text-gray-700">Form Name</label>
                <input
                  type="text"
                  name="formName"
                  id="formName"
                  defaultValue={editingForm?.name || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="formDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="formDescription"
                  id="formDescription"
                  rows={3}
                  defaultValue={editingForm?.description || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              {/* Field Management would go here in a more complex implementation */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddEditFormModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingForm ? 'Save Changes' : 'Create Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Responses Modal */}
      {showResponsesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="responses-modal">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Form Responses</h3>
            {currentFormResponses.length === 0 ? (
              <p>No responses yet for this form.</p>
            ) : (
              <div className="space-y-4">
                {currentFormResponses.map((response, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md">
                    <p className="font-semibold">Attendee ID: {response.attendeeId}</p>
                    <ul className="list-disc list-inside mt-2">
                      {Object.entries(response.responses).map(([fieldId, answer]) => (
                        <li key={fieldId}>
                          <strong>{fieldId}:</strong> {String(answer)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowResponsesModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms;
