import React from 'react';

const Analytics = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics Dashboard</h2>
      <p className="text-gray-600">This is a placeholder for your analytics data.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Example Metric Card */}
        <div className="bg-indigo-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-indigo-800">Total Events</h3>
          <p className="text-3xl font-bold text-indigo-600">1,234</p>
        </div>

        {/* Example Metric Card */}
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-800">Total Bookings</h3>
          <p className="text-3xl font-bold text-green-600">5,678</p>
        </div>

        {/* Example Metric Card */}
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-yellow-800">Revenue</h3>
          <p className="text-3xl font-bold text-yellow-600">$123,456</p>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <ul className="space-y-2">
          <li className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
            <span>Event 'Summer Music Fest' created</span>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </li>
          <li className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
            <span>User 'John Doe' registered</span>
            <span className="text-sm text-gray-500">1 day ago</span>
          </li>
          <li className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
            <span>5 tickets booked for 'Tech Conference'</span>
            <span className="text-sm text-gray-500">3 days ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
