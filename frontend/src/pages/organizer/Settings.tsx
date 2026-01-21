import React, { useState } from 'react';
import { FaCog, FaEye, FaBell, FaGlobe } from 'react-icons/fa';

interface EventSettingsData {
  visibility: 'Public' | 'Private';
  enableNotifications: boolean;
  enableRsvp: boolean;
  attendeeDataCollection: string; // e.g., 'Basic' | 'Detailed'
  timezone: string;
}

const dummySettings: EventSettingsData = {
  visibility: 'Public',
  enableNotifications: true,
  enableRsvp: false,
  attendeeDataCollection: 'Basic',
  timezone: 'Asia/Kolkata',
};

const Settings = () => {
  const [settings, setSettings] = useState<EventSettingsData>(dummySettings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings Saved:', settings);
    // Here you would typically send this data to your backend API
    alert('Settings saved successfully!');
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Event Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaCog className="mr-2" /> General Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Event Visibility</label>
              <select
                name="visibility"
                id="visibility"
                value={settings.visibility}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
            <div className="flex items-center mt-6 md:mt-0">
              <input
                type="checkbox"
                name="enableRsvp"
                id="enableRsvp"
                checked={settings.enableRsvp}
                onChange={handleChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="enableRsvp" className="ml-2 block text-sm font-medium text-gray-700">Enable RSVP</label>
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                name="timezone"
                id="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>
        </div>

        {/* Communication & Privacy */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaBell className="mr-2" /> Communication & Privacy
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="enableNotifications"
                id="enableNotifications"
                checked={settings.enableNotifications}
                onChange={handleChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="enableNotifications" className="ml-2 block text-sm font-medium text-gray-700">Send event notifications to attendees</label>
            </div>
            <div>
              <label htmlFor="attendeeDataCollection" className="block text-sm font-medium text-gray-700">Attendee Data Collection Level</label>
              <select
                name="attendeeDataCollection"
                id="attendeeDataCollection"
                value={settings.attendeeDataCollection}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Basic">Basic (Name, Email)</option>
                <option value="Detailed">Detailed (Basic + Custom Fields)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Integrations (Placeholder) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaGlobe className="mr-2" /> Integrations
          </h3>
          <p className="text-gray-600">Integrate your event with other platforms (e.g., Mailchimp, CRM, Analytics tools).</p>
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Manage Integrations
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
