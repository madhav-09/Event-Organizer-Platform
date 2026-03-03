type Props = {
  events: any[];
  selectedEventId: string | null;
  onSelect: (id: string) => void;
};

const formatEventLabel = (event: any) => {
  const date = new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const time = new Date(event.date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return `${event.title} • ${date} • ${event.location} • ${time}`;
};

export default function EventSelector({ events, selectedEventId, onSelect }: Props) {
  return (
    <div className="max-w-xl">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Select Event
      </label>
      <select
        className="input-glass w-full text-sm py-3"
        value={selectedEventId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="" style={{ background: '#0b0f1a' }}>— Select an Event —</option>
        {events.map((event) => (
          <option key={event.event_id} value={event.event_id} style={{ background: '#0b0f1a' }}>
            {formatEventLabel(event)}
          </option>
        ))}
      </select>
    </div>
  );
}
