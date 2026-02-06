type Props = {
  events: any[];
  selectedEventId: string | null;
  onSelect: (id: string) => void;
};

const formatEventLabel = (event: any) => {
  const date = new Date(event.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = new Date(event.date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${event.title} • ${date} • ${event.location} • ${time}`;
};

export default function EventSelector({
  events,
  selectedEventId,
  onSelect,
}: Props) {
  return (
    <div className="max-w-xl">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Event
      </label>

      <select
        className="border px-4 py-2 rounded w-full bg-white"
        value={selectedEventId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">Select Event</option>

        {events.map((event) => (
          <option key={event.event_id} value={event.event_id}>
            {formatEventLabel(event)}
          </option>
        ))}
      </select>
    </div>
  );
}
