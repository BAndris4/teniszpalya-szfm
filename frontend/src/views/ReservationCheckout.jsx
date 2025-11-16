// src/pages/ReservationCheckout.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";
import ConfirmResponsePopup from "../components/ConfirmResponsePopup";
import { useCurrentUser } from "../hooks/useCurrentUser";
import usePrice from "../hooks/usePrice";

function ReservationCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservation, meta } = location.state || {};

  const { authenticated } = useCurrentUser();
  const { getPrice } = usePrice();

  const [isStudent, setIsStudent] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState(null); // "valid" | "invalid" | null

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReservationOk, setIsReservationOk] = useState(false);
  const [error, setError] = useState(null);
  const [createdReservationId, setCreatedReservationId] = useState(null);

  // if there is no reservation in state, show an error
  useEffect(() => {
    if (!reservation) {
      setError("No reservation data. Please select a time and court again.");
    } else {
      console.log({ reservation, meta });
    }
  }, [reservation, meta]);

  // auth guard
  useEffect(() => {
    if (authenticated === false) {
      navigate("/login");
    }
  }, [authenticated, navigate]);

  // fetch coupons
  useEffect(() => {
    fetch("http://localhost:5044/api/coupon/my", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load coupons");
        }
        return res.json();
      })
      .then((data) => setAvailableCoupons(data || []))
      .catch((err) => {
        console.error("Error fetching coupons:", err);
        setAvailableCoupons([]);
      });
  }, []);

  const hours = reservation?.hours ?? 0;

  // ---- DATE / TIME, SEASON, MORNING/AFTERNOON SPLIT ----
  const reservedDate = reservation ? new Date(reservation.reservedAt) : null;

  const dateStr = reservedDate
    ? reservedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const timeStr = reservedDate
    ? reservedDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const monthIndex = reservedDate ? reservedDate.getMonth() : null; // 0-11
  const season =
    monthIndex !== null && monthIndex >= 4 && monthIndex <= 8
      ? "summer"
      : "winter";

  // how many hours fall into morning (< 12:00) vs afternoon (>= 12:00)
  let morningHoursCount = 0;
  let afternoonHoursCount = 0;

  if (reservedDate && hours > 0) {
    const startTime = reservedDate.getTime();
    const oneHourMs = 60 * 60 * 1000;

    for (let i = 0; i < hours; i++) {
      const current = new Date(startTime + i * oneHourMs);
      const currentHour = current.getHours();
      if (currentHour < 12) {
        morningHoursCount++;
      } else {
        afternoonHoursCount++;
      }
    }
  }

  let sessionSplitLabel = "—";
  if (morningHoursCount > 0 && afternoonHoursCount > 0) {
    sessionSplitLabel = `${morningHoursCount} h morning + ${afternoonHoursCount} h afternoon`;
  } else if (morningHoursCount > 0) {
    sessionSplitLabel = `${morningHoursCount} h morning`;
  } else if (afternoonHoursCount > 0) {
    sessionSplitLabel = `${afternoonHoursCount} h afternoon`;
  }

  // ---- INDOOR / OUTDOOR FROM COURT OBJECT ----
  const court = meta?.court;

  // default to outdoor
  let outside = true;

  if (court) {
    // backend field: "outdoors"
    if (typeof court.outdoors === "boolean") {
      outside = court.outdoors;
    }

    console.log("Checkout court meta:", court, "=> outside:", outside);
  }

  // ---- PRICE CALCULATION BASED ON usePrice (MORNING + AFTERNOON) ----
  let morningUnitPrice = null;
  let afternoonUnitPrice = null;
  let basePrice = 0;

  if (reservation) {
    // hourly prices
    morningUnitPrice = getPrice({
      season,
      morning: true,
      student: isStudent,
      outside,
    });

    afternoonUnitPrice = getPrice({
      season,
      morning: false,
      student: isStudent,
      outside,
    });

    console.log("price params:", {
      season,
      isStudent,
      outside,
      morningHoursCount,
      afternoonHoursCount,
      morningUnitPrice,
      afternoonUnitPrice,
    });

    // accumulate base price using the split
    if (morningHoursCount > 0 && morningUnitPrice != null) {
      basePrice += morningUnitPrice * morningHoursCount;
    }
    if (afternoonHoursCount > 0 && afternoonUnitPrice != null) {
      basePrice += afternoonUnitPrice * afternoonHoursCount;
    }
  }

  const morningSubtotal =
    morningUnitPrice != null ? morningUnitPrice * morningHoursCount : null;

  const afternoonSubtotal =
    afternoonUnitPrice != null ? afternoonUnitPrice * afternoonHoursCount : null;

  const discountedPrice = appliedCoupon
    ? Math.round(basePrice * 0.8) // 20% discount
    : basePrice;

  const noPriceDefined =
    !!reservation &&
    ((morningHoursCount > 0 && morningUnitPrice == null) ||
      (afternoonHoursCount > 0 && afternoonUnitPrice == null));

  // ---- COUPON HANDLING ----
  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;

    const match = availableCoupons.find(
      (c) =>
        !c.used && c.code.toLowerCase() === couponInput.trim().toLowerCase()
    );

    if (match) {
      setAppliedCoupon(match);
      setCouponStatus("valid");
      setError(null);
    } else {
      setAppliedCoupon(null);
      setCouponStatus("invalid");
    }
  };

  // ---- FINALIZE RESERVATION ----
  const handleConfirmReservation = () => {
    if (!reservation) {
      setError("No reservation data available for booking.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      createdAt: reservation.createdAt,
      reservedAt: reservation.reservedAt,
      hours: reservation.hours,
      courtID: reservation.courtID,
      couponCode: appliedCoupon ? appliedCoupon.code : "",
    };

    fetch("http://localhost:5044/api/Reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Reservation failed");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Reservation OK:", data);
        setCreatedReservationId(data.reservationId);
        setIsReservationOk(true);
      })
      .catch((err) => {
        console.error("Error creating reservation:", err);
        setError(
          "Something went wrong while creating your reservation. Please try again."
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <ReserveMenuProvider>
      <div className="select-none">
        <Navbar />
        <div className="flex flex-col p-10 gap-10 items-center justify-start">
          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
            {/* Reservation summary */}
            <div className="flex-1 bg-white border rounded-[20px] px-8 py-8 border-dark-green-octa shadow-md flex flex-col gap-6">
              <div className="font-semibold text-xl text-dark-green">
                Reservation overview
              </div>

              {reservation ? (
                <>
                  <div className="flex flex-col gap-2 text-dark-green-half">
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Time:</span>
                      <span>{timeStr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Duration:</span>
                      <span>{reservation.hours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Court:</span>
                      <span>
                        {meta?.label
                          ? meta.label
                          : `Tennis Court #${reservation.courtID}`}
                      </span>
                    </div>

                    {/* Debug / info for pricing logic */}
                    <div className="mt-3 text-xs text-dark-green/60 space-y-1">
                      <div>
                        Season:{" "}
                        <b>{season === "summer" ? "Summer" : "Winter"}</b>
                      </div>
                      <div>
                        Session split: <b>{sessionSplitLabel}</b>
                      </div>
                      <div>
                        Court type: <b>{outside ? "Outdoor" : "Indoor"}</b>
                      </div>
                    </div>
                  </div>

                  {/* Student toggle – prettier, clearer UI */}
                  <div className="mt-4 border-t border-dark-green-octa pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-dark-green font-medium">
                          Student reservation
                        </div>
                        <div className="text-xs sm:text-sm text-dark-green-half">
                          Discounted pricing for students. A valid student ID
                          will be checked at the reception.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsStudent((prev) => !prev)}
                        className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors duration-200 flex items-center ${
                          isStudent ? "bg-dark-green" : "bg-gray-300"
                        }`}
                        aria-pressed={isStudent}
                        aria-label="Toggle student reservation"
                      >
                        <span
                          className={`absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                            isStudent ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {isStudent && (
                      <div className="mt-2 text-xs text-green-700 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-600 text-white text-[10px]">
                          ✓
                        </span>
                        <span>Student discount is applied to your price.</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-red-600 text-sm">
                  No reservation data was passed to this page.
                </div>
              )}
            </div>

            {/* Price + coupon + button */}
            <div className="w-full md:w-[380px] bg-white border rounded-[20px] px-8 py-8 border-dark-green-octa shadow-md flex flex-col gap-6">
              <div className="font-semibold text-xl text-dark-green">
                Payment summary
              </div>

              {/* Coupon input */}
              <div className="flex flex-col gap-2">
                <div className="font-medium text-[16px] text-dark-green">
                  Coupon code
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponStatus(null);
                    }}
                    placeholder="ABC123"
                    className="flex-1 border border-dark-green-octa rounded-2xl px-4 py-2 outline-none focus:ring-2 focus:ring-dark-green/40"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 cursor-pointer rounded-2xl bg-dark-green text-white text-sm font-semibold hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Apply
                  </button>
                </div>
                {couponStatus === "valid" && (
                  <div className="text-sm text-green-600">
                    Coupon accepted! 20% discount applied.
                  </div>
                )}
                {couponStatus === "invalid" && (
                  <div className="text-sm text-red-600">
                    Invalid coupon or already used.
                  </div>
                )}
              </div>

              {/* Price section */}
                <div className="flex flex-col gap-2 text-dark-green-half border-t border-dark-green-octa pt-4">
                {morningHoursCount > 0 && (
                    <div className="flex justify-between text-sm">
                    <span>
                        Morning ({morningHoursCount} h ×{" "}
                        {morningUnitPrice != null ? `${morningUnitPrice} Ft` : "no price"})
                    </span>
                    <span>
                        {morningSubtotal != null ? `${morningSubtotal} Ft` : "—"}
                    </span>
                    </div>
                )}

                {afternoonHoursCount > 0 && (
                    <div className="flex justify-between text-sm">
                    <span>
                        Afternoon ({afternoonHoursCount} h ×{" "}
                        {afternoonUnitPrice != null ? `${afternoonUnitPrice} Ft` : "no price"})
                    </span>
                    <span>
                        {afternoonSubtotal != null ? `${afternoonSubtotal} Ft` : "—"}
                    </span>
                    </div>
                )}

                {/* base price csak akkor látszik, ha van kupon */}
                {appliedCoupon && (
                    <div className="flex justify-between">
                    <span>Base price ({hours} hours)</span>
                    <span>{basePrice} Ft</span>
                    </div>
                )}

                {appliedCoupon && (
                    <div className="flex justify-between text-sm text-dark-green">
                    <span>Coupon discount (20%)</span>
                    <span>-{Math.round(basePrice * 0.2)} Ft</span>
                    </div>
                )}

                <div className="flex justify-between font-semibold text-dark-green text-lg mt-2">
                    <span>Total</span>
                    <span>{discountedPrice} Ft</span>
                </div>
                </div>


              {noPriceDefined && (
                <div className="text-xs text-red-600 mt-1">
                  There is no price defined in the system for at least one part
                  of this reservation (season / indoor–outdoor / time of day /
                  student).
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 mt-2">{error}</div>
              )}

              <button
                onClick={handleConfirmReservation}
                disabled={!reservation || isSubmitting || noPriceDefined}
                className={`mt-4 bg-dark-green disabled:cursor-not-allowed text-white font-bold text-[18px] py-4 rounded-[24px] shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer w-full text-center disabled:opacity-60 disabled:hover:scale-100`}
              >
                {isSubmitting
                  ? "Confirming reservation..."
                  : "Confirm reservation"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isReservationOk && (
        <ConfirmResponsePopup
          type="success"
          title="Reservation Successful!"
          description="Your booking has been confirmed"
          showCalendarButton={!!createdReservationId}
          reservationId={createdReservationId}
          onCancel={() => {
            setIsReservationOk(false);
            navigate("/");          // itt lépünk vissza a főoldalra, ha bezárja a popupot
          }}
        />
      )}

    </ReserveMenuProvider>
  );
}

export default ReservationCheckout;
