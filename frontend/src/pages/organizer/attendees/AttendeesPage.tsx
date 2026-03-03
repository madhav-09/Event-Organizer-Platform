import { useEffect, useState } from "react";
import EventSelector from "./EventSelector";
import AttendeesTable from "./AttendeesTable";
import UnifiedQrScanner from "./QrScannerModal";
import { getMyEvents, getEventBookings } from "../../../services/api";
import { Users, CheckCircle, RefreshCw, Loader2 } from "lucide-react";

type TabType = "not_checked_in" | "checked_in";

export default function AttendeesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("not_checked_in");
  const [loading, setLoading] = useState(false);

  useEffect(() => { getMyEvents().then(setEvents); }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);
    getEventBookings(selectedEventId).then(setAttendees).finally(() => setLoading(false));
  }, [selectedEventId]);

  const checkedInCount = attendees.filter((a) => a.checked_in).length;
  const totalCount = attendees.length;

  const handleScanSuccess = (bookingId: string) => {
    setAttendees((prev) => prev.map((a) => a.booking_id === bookingId ? { ...a, checked_in: true } : a));
    setActiveTab("not_checked_in");
  };

  const handleRefresh = () => {
    if (!selectedEventId) return;
    setLoading(true);
    getEventBookings(selectedEventId).then(setAttendees).finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-black text-2xl text-white">Attendees</h2>
          <p className="text-slate-500 text-sm mt-0.5">Scan QR codes to check in attendees</p>
        </div>
        {selectedEventId && (
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
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
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Attendees", value: totalCount, icon: Users, accent: "rgba(108,71,236,0.15)", border: "rgba(108,71,236,0.25)", color: "#c4b5fd" },
              { label: "Checked In", value: checkedInCount, icon: CheckCircle, accent: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.25)", color: "#6ee7b7" },
              { label: "Not Checked In", value: totalCount - checkedInCount, icon: Users, accent: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.25)", color: "#fcd34d" },
            ].map(({ label, value, icon: Icon, accent, border, color }) => (
              <div key={label} className="glass-card rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: accent, border: `1px solid ${border}` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-2xl font-black text-white font-heading">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scanner + Attendee list */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Scanner */}
            <div className="lg:col-span-2">
              <UnifiedQrScanner eventId={selectedEventId} onSuccess={handleScanSuccess} />
            </div>

            {/* Attendee List */}
            <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => setActiveTab("not_checked_in")}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative ${activeTab === "not_checked_in" ? "text-brand-300" : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  Not Checked In
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "not_checked_in"
                      ? "text-brand-300 border border-brand-500/30"
                      : "text-slate-500 border border-white/10"
                    }`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {totalCount - checkedInCount}
                  </span>
                  {activeTab === "not_checked_in" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6c47ec, #4f46e5)' }} />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("checked_in")}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative ${activeTab === "checked_in" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  Checked In
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "checked_in"
                      ? "text-emerald-400 border border-emerald-500/30"
                      : "text-slate-500 border border-white/10"
                    }`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {checkedInCount}
                  </span>
                  {activeTab === "checked_in" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
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
