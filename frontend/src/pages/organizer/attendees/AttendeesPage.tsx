import { useEffect, useState } from "react";
import EventSelector from "./EventSelector";
import AttendeesTable from "./AttendeesTable";
import QrScannerModal from "./QrScannerModal";
import { getMyEvents, getEventBookings } from "../../../services/api";

export default function AttendeesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // Load organizer events
  useEffect(() => {
    getMyEvents().then(setEvents);
  }, []);

  // Load attendees when event changes
  useEffect(() => {
    if (!selectedEventId) return;
    getEventBookings(selectedEventId).then(setAttendees);
  }, [selectedEventId]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Attendees</h2>

      <EventSelector
        events={events}
        selectedEventId={selectedEventId}
        onSelect={setSelectedEventId}
      />

      {selectedEventId && (
        <AttendeesTable
          attendees={attendees}
          onCheckIn={(bookingId) => setActiveBookingId(bookingId)}
        />
      )}

      {activeBookingId && (
        <QrScannerModal
          bookingId={activeBookingId}
          eventId={selectedEventId!}
          onSuccess={() => {
            setAttendees((prev) =>
              prev.map((a) =>
                a.booking_id === activeBookingId
                  ? { ...a, checked_in: true }
                  : a
              )
            );
            setActiveBookingId(null);
          }}
          onClose={() => setActiveBookingId(null)}
        />
      )}
    </div>
  );
}
