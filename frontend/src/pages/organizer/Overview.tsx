import React from 'react';
import { FaUsers, FaDollarSign, FaChartLine, FaAndroid, FaApple, FaTicketAlt } from "react-icons/fa";

const Overview = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-100 text-purple-600 rounded-full p-3 mr-4">
            <FaTicketAlt size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Manage your events on the go with our Organizer App</h2>
            <p className="text-gray-600 text-sm">
              Seamlessly check in attendees with QR scanning, access real-time event analytics, and send instant announcements to all attendees.
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <a
            href="#"
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700"
          >
            <FaAndroid className="mr-2" /> GET IT ON Google Play
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700"
          >
            <FaApple className="mr-2" /> Download on the App Store
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">REGISTRATIONS</p>
            <p className="text-4xl font-bold text-gray-800">454 attendees</p>
          </div>
          <FaUsers className="text-purple-400 opacity-50" size={48} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">TICKET SALES</p>
            <p className="text-4xl font-bold text-gray-800">₹216,814.57</p>
          </div>
          <FaDollarSign className="text-purple-400 opacity-50" size={48} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">TOTAL PAGEVIEWS</p>
            <p className="text-4xl font-bold text-gray-800">6389</p>
          </div>
          <FaChartLine className="text-purple-400 opacity-50" size={48} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Spread the word about your event</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-lg mr-4">1</span>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Interested in Boosting your Ticket Sales and revenue by increasing your reach? Try out Townscript Marketing Services</p>
              <a href="#" className="text-blue-600 hover:underline">Try Marketing Services →</a>
            </div>
          </div>
          <div className="flex items-start">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-lg mr-4">2</span>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Use Townscript's Promotion Toolset to promote your event</p>
              <a href="#" className="text-blue-600 hover:underline">Try it out →</a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Event Configuration</h3>
        <p className="text-gray-600">Content for event configuration settings.</p>
      </div>
    </div>
  );
};

export default Overview;

