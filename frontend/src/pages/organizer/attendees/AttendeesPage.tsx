import { useEffect, useState } from "react";
import EventSelector from "./EventSelector";
import AttendeesTable from "./AttendeesTable";
import UnifiedQrScanner from "./QrScannerModal";
import { getMyEvents, getEventBookings } from "../../../services/api";
import { FiUsers, FiCheckCircle, FiRefreshCw } from "react-icons/fi";

type TabType = "not_checked_in" | "checked_in";

export default function AttendeesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("not_checked_in");
  const [loading, setLoading] = useState(false);

  // Load organizer events
  useEffect(() => {
    getMyEvents().then(setEvents);
  }, []);

  // Load attendees when event changes
  useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);
    getEventBookings(selectedEventId)
      .then(setAttendees)
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  const checkedInCount = attendees.filter((a) => a.checked_in).length;
  const totalCount = attendees.length;

  const handleScanSuccess = (bookingId: string) => {
    setAttendees((prev) =>
      prev.map((a) =>
        a.booking_id === bookingId ? { ...a, checked_in: true } : a
      )
    );
    // Switch to Not Checked In tab so organizer can see who's left
    setActiveTab("not_checked_in");
  };

  const handleRefresh = () => {
    if (!selectedEventId) return;
    setLoading(true);
    getEventBookings(selectedEventId)
      .then(setAttendees)
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendees</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Scan QR codes to check in attendees for your event
          </p>
        </div>

        {selectedEventId && (
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        )}
      </div>

      {/* Event Selector */}
      <EventSelector
        events={events}
        selectedEventId={selectedEventId}
        onSelect={(id) => {
          setSelectedEventId(id);
          setAttendees([]);
          setActiveTab("not_checked_in");
        }}
      />

      {selectedEventId && (
        <>
          {/* Stats Banner */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <FiUsers size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
                <p className="text-xs text-gray-500">Total Attendees</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <FiCheckCircle size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{checkedInCount}</p>
                <p className="text-xs text-gray-500">Checked In</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <FiUsers size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalCount - checkedInCount}</p>
                <p className="text-xs text-gray-500">Not Checked In</p>
              </div>
            </div>
          </div>

          {/* Two-column layout: Scanner + Attendee List */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Scanner — takes 2 of 5 columns on large screens */}
            <div className="lg:col-span-2">
              <UnifiedQrScanner
                eventId={selectedEventId}
                onSuccess={handleScanSuccess}
              />
            </div>

            {/* Attendee List — takes 3 of 5 columns */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              {/* Tab Bar */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("not_checked_in")}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative ${activeTab === "not_checked_in"
                      ? "text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Not Checked In
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "not_checked_in"
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {totalCount - checkedInCount}
                  </span>
                  {activeTab === "not_checked_in" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("checked_in")}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative ${activeTab === "checked_in"
                      ? "text-green-600"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Checked In
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "checked_in"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {checkedInCount}
                  </span>
                  {activeTab === "checked_in" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
                  )}
                </button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <FiRefreshCw size={22} className="animate-spin mr-2" />
                  <span className="text-sm">Loading attendees…</span>
                </div>
              ) : (
                <AttendeesTable attendees={attendees} filter={activeTab} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
