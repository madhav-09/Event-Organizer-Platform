import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { scanBookingQR } from "../../../services/api";
import toast from "react-hot-toast";

type Props = {
  bookingId: string;
  eventId: string;
  onSuccess: () => void;
  onClose: () => void;
};

export default function QrScannerModal({
  bookingId,
  eventId,
  onSuccess,
  onClose,
}: Props) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText) => {
        const payload = JSON.parse(decodedText);

        if (payload.booking_id !== bookingId) {
          toast.error("QR code does not match selected attendee");
          return;
        }

        await scanBookingQR({ ...payload, event_id: eventId });
        await scanner.clear();
        onSuccess();
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl">
        <div id="qr-reader" />
        <button onClick={onClose} className="mt-3 text-red-600 w-full">
          Cancel
        </button>
      </div>
    </div>
  );
}
