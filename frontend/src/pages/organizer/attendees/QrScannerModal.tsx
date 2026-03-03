import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { scanBookingQR } from "../../../services/api";
import toast from "react-hot-toast";
import { CheckCircle, AlertCircle, Camera } from "lucide-react";

type Props = {
  eventId: string;
  onSuccess: (bookingId: string) => void;
};

type ScanStatus = "idle" | "success" | "error";

export default function UnifiedQrScanner({ eventId, onSuccess }: Props) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [lastScannedName, setLastScannedName] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "unified-qr-reader",
      { fps: 10, qrbox: 220, aspectRatio: 1 },
      false
    );

    scanner.render(
      async (decodedText) => {
        if (processingRef.current) return;
        processingRef.current = true;

        try {
          const payload = JSON.parse(decodedText);
          const bookingId = payload.booking_id;

          if (!bookingId) {
            toast.error("Invalid QR code format");
            setScanStatus("error");
            return;
          }

          const res = await scanBookingQR({ booking_id: bookingId, event_id: eventId });
          const name = res.data?.user_name ?? "Attendee";
          setLastScannedName(name);
          setScanStatus("success");
          toast.success(`✅ ${name} checked in!`);
          onSuccess(bookingId);
        } catch (err: any) {
          const msg = err?.response?.data?.detail ?? "Check-in failed";
          setScanStatus("error");
          toast.error(`❌ ${msg}`);
        } finally {
          setTimeout(() => {
            setScanStatus("idle");
            setLastScannedName(null);
            processingRef.current = false;
          }, 2500);
        }
      },
      () => { }
    );

    scannerRef.current = scanner;
    return () => { scanner.clear().catch(() => { }); };
  }, [eventId]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(108,71,236,0.08)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(108,71,236,0.2)', border: '1px solid rgba(108,71,236,0.3)' }}>
          <Camera className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-white text-sm">QR Scanner</h3>
          <p className="text-xs text-slate-500">Point camera at attendee's ticket QR</p>
        </div>

        {/* Live status pill */}
        <div className="ml-auto">
          {scanStatus === "success" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-emerald-400 border border-emerald-500/30 animate-pulse"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle className="w-3.5 h-3.5" /> {lastScannedName ?? "Checked In"}
            </span>
          )}
          {scanStatus === "error" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-red-400 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertCircle className="w-3.5 h-3.5" /> Scan Failed
            </span>
          )}
          {scanStatus === "idle" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium text-slate-400 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Ready
            </span>
          )}
        </div>
      </div>

      {/* Scanner viewport */}
      <div className="px-5 py-4 flex justify-center [&_#unified-qr-reader]:rounded-xl [&_select]:input-glass [&_button]:btn-secondary" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div
          id="unified-qr-reader"
          className="w-full max-w-xs rounded-xl overflow-hidden"
          style={{ minHeight: 260 }}
        />
      </div>
    </div>
  );
}
