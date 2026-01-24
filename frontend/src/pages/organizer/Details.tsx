import React, { useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaImage, FaPlusCircle } from 'react-icons/fa';

interface EventDetailsData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bannerImage: string | null;
  galleryImages: string[];
}

const dummyEventDetails: EventDetailsData = {
  title: 'Hamstring Classic 2026',
  description:
    'Join us for the annual Hamstring Classic, a premier event showcasing talent and skill. Expect thrilling competitions, engaging workshops, and networking opportunities.',
  category: 'Sports',
  tags: ['running', 'athletics', 'competition'],
  startDate: '2026-03-15',
  startTime: '09:00',
  endDate: '2026-03-15',
  endTime: '17:00',
  locationName: 'City Sports Arena',
  address: '123 Sports Complex Rd',
  city: 'Metropolis',
  state: 'CA',
  zipCode: '90210',
  bannerImage: 'https://via.placeholder.com/800x200.png?text=Event+Banner',
  galleryImages: [
    'https://via.placeholder.com/150.png?text=Gallery+Image+1',
    'https://via.placeholder.com/150.png?text=Gallery+Image+2',
  ],
};

const Details = () => {
  const [eventDetails, setEventDetails] = useState<EventDetailsData>(dummyEventDetails);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEventDetails((prev) => ({ ...prev, tags: value.split(',').map((tag) => tag.trim()) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'gallery') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'banner') {
          setEventDetails((prev) => ({ ...prev, bannerImage: reader.result as string }));
        } else {
          setEventDetails((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, reader.result as string] }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event Details Submitted:', eventDetails);
    // Here you would typically send this data to your backend API
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Event Details</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
              <input
                type="text"
                name="title"
                id="title"
                value={eventDetails.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                id="category"
                value={eventDetails.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Sports">Sports</option>
                <option value="Music">Music</option>
                <option value="Tech">Tech</option>
                <option value="Art">Art</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={eventDetails.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                id="tags"
                value={eventDetails.tags.join(', ')}
                onChange={handleTagsChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaCalendarAlt className="mr-2" /> Date & Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={eventDetails.startDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                name="startTime"
                id="startTime"
                value={eventDetails.startTime}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={eventDetails.endDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                name="endTime"
                id="endTime"
                value={eventDetails.endTime}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2" /> Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">Venue Name</label>
              <input
                type="text"
                name="locationName"
                id="locationName"
                value={eventDetails.locationName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                id="address"
                value={eventDetails.address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                id="city"
                value={eventDetails.city}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                name="state"
                id="state"
                value={eventDetails.state}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                id="zipCode"
                value={eventDetails.zipCode}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Images & Media */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaImage className="mr-2" /> Images & Media
          </h3>
          {/* Banner Image */}
          <div className="mb-4">
            <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700">Banner Image</label>
            <input
              type="file"
              name="bannerImage"
              id="bannerImage"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'banner')}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {eventDetails.bannerImage && (
              <img src={eventDetails.bannerImage} alt="Banner" className="mt-2 w-full h-48 object-cover rounded-md" />
            )}
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Gallery Images</label>
            <div className="mt-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {eventDetails.galleryImages.map((image, index) => (
                <img key={index} src={image} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
              ))}
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'gallery')}
                  className="hidden"
                  multiple
                />
                <FaPlusCircle className="text-gray-400" size={32} />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Details
          </button>
        </div>
      </form>
    </div>
  );
};

export default Details;