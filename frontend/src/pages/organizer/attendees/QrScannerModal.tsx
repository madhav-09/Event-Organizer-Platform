import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { scanBookingQR } from "../../../services/api";
import toast from "react-hot-toast";
import { FiCheckCircle, FiAlertCircle, FiCamera } from "react-icons/fi";

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

    return () => {
      scanner.clear().catch(() => { });
    };
  }, [eventId]);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <FiCamera size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">QR Scanner</h3>
          <p className="text-xs text-gray-500">Point camera at any attendee's ticket QR code</p>
        </div>

        {/* Live status pill */}
        <div className="ml-auto">
          {scanStatus === "success" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 animate-pulse">
              <FiCheckCircle size={13} /> {lastScannedName ?? "Checked In"}
            </span>
          )}
          {scanStatus === "error" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              <FiAlertCircle size={13} /> Scan Failed
            </span>
          )}
          {scanStatus === "idle" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              Ready to scan
            </span>
          )}
        </div>
      </div>

      {/* Scanner viewport */}
      <div className="px-5 py-4 flex justify-center">
        <div
          id="unified-qr-reader"
          className="w-full max-w-xs rounded-xl overflow-hidden"
          style={{ minHeight: 260 }}
        />
      </div>
    </div>
  );
}
