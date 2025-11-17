import { useEffect } from "react";

function ConfirmResponsePopup({
  title,
  description,
  type = "success",             // "success" | "confirm" | "error"
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,                    // confirm mode
  onCancel,                     // background click / cancel
  autoCloseMs = 2500,           // auto-close in success mode
  showCalendarButton = false,   // NEW: show Google Calendar button or not
  reservationId = null,         // NEW: created reservation id
}) {
  // auto-close only in pure success mode (no calendar button)
  useEffect(() => {
    if (type !== "success" || !autoCloseMs) return;
    if (showCalendarButton) return; // don't auto-close when user might click button

    const t = setTimeout(() => onCancel?.(), autoCloseMs);
    return () => clearTimeout(t);
  }, [type, autoCloseMs, onCancel, showCalendarButton]);

  const isConfirm = type === "confirm";
  const isSuccess = type === "success";

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[rgb(0,0,0,0.5)] animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="relative w-[600px] max-w-[92vw] rounded-3xl bg-white p-8 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* icon */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          {isSuccess ? (
            <>
              <div className="absolute inset-0 rounded-full bg-green animate-circle-grow"></div>
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 130 130">
                <path
                  className="animate-checkmark"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M 40 65 L 55 80 L 90 45"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                />
              </svg>
            </>
          ) : (
            // confirm / error icon
            <div
              className={`relative flex h-24 w-24 items-center justify-center rounded-full ${
                type === "error" ? "bg-red-500" : "bg-dark-green"
              } text-white ${isConfirm ? "animate-circle-grow" : ""}`}
            >
              <svg viewBox="0 0 24 24" className={`h-12 w-12 ${isConfirm ? "animate-question-delayed" : ""}`}>
                {type === "error" ? (
                  <path fill="currentColor" d="M11 7h2v6h-2zm0 8h2v2h-2z" />
                ) : (
                  // question mark icon
                  <path
                    fill="currentColor"
                    d="M11 18h2v-2h-2v2zm1-16C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2m0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8m-1-5h2c0-3 3-3.25 3-5a4 4 0 0 0-8 0h2a2 2 0 1 1 4 0c0 1.5-3 2-3 5z"
                  />
                )}
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-center text-2xl font-bold text-dark-green animate-slide-up">{title}</h2>
        {description && (
          <p className="mt-3 text-center text-lg text-dark-green/80 animate-slide-up-delayed">
            {description}
          </p>
        )}

        {/* Google Calendar button — only when a reservation exists */}
        {isSuccess && showCalendarButton && reservationId && (
          <div className="mt-6 flex justify-center animate-slide-up-delayed">
            <button
              className="bg-[#4285F4] text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
              onClick={() => {
                window.location.href = `http://localhost:5044/api/google/auth?reservationId=${reservationId}`;
              }}
            >
              Add to Google Calendar
            </button>
          </div>
        )}

        {/* confirm buttons */}
        {isConfirm && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              className="cursor-pointer rounded-xl border border-dark-green-octa px-5 py-2 font-semibold text-dark-green transition-all hover:bg-dark-green hover:text-white"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              className="cursor-pointer rounded-xl border border-gray-300 px-5 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-100"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes circle-grow { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes checkmark { to { stroke-dashoffset: 0; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @keyframes question-wiggle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-3deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-2px) rotate(3deg); }
        }

        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-circle-grow { animation: circle-grow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards; }
        .animate-checkmark { animation: checkmark 0.6s ease-in-out 0.5s forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out 0.8s backwards; }
        .animate-slide-up-delayed { animation: slide-up 0.5s ease-out 1s backwards; }
        .animate-question-delayed {
          animation: question-wiggle 1.6s ease-in-out 1.2s infinite;
          transform-origin: 50% 55%;
        }
      `}</style>
    </div>
  );
}

export default ConfirmResponsePopup;
