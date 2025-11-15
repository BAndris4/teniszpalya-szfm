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

  // ---- DATE / TIME, SEASON, MORNING ----
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

  const isMorning = reservedDate ? reservedDate.getHours() < 12 : false;

  const monthIndex = reservedDate ? reservedDate.getMonth() : null; // 0-11
  const season =
    monthIndex !== null && monthIndex >= 4 && monthIndex <= 8
      ? "summer"
      : "winter";

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

  // ---- PRICE CALCULATION BASED ON usePrice ----
  let unitPrice = null;
  let basePrice = 0;

  if (reservation) {
    console.log("price params:", { season, isMorning, isStudent, outside });

    unitPrice = getPrice({
      season,
      morning: isMorning,
      student: isStudent,
      outside,
    });

    if (unitPrice != null) {
      basePrice = unitPrice * hours;
    } else {
      basePrice = 0; // no price defined for this combination
    }
  }

  const discountedPrice = appliedCoupon
    ? Math.round(basePrice * 0.8) // 20% discount
    : basePrice;

  // ---- COUPON HANDLING ----
  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;

    const match = availableCoupons.find(
      (c) =>
        !c.used &&
        c.code.toLowerCase() === couponInput.trim().toLowerCase()
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
        setIsReservationOk(true);
        setTimeout(() => {
          navigate("/");
        }, 2500);
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

  const noPriceDefined = reservation && unitPrice == null;

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
                        Time of day:{" "}
                        <b>{isMorning ? "Morning" : "Afternoon"}</b>
                      </div>
                      <div>
                        Court type:{" "}
                        <b>{outside ? "Outdoor" : "Indoor"}</b>
                      </div>
                    </div>
                  </div>

                  {/* Student toggle */}
                  <div className="mt-4 border-t border-dark-green-octa pt-4">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="accent-dark-green w-4 h-4"
                        checked={isStudent}
                        onChange={(e) => setIsStudent(e.target.checked)}
                      />
                      <span className="text-dark-green">
                        Student reservation (student discount)
                      </span>
                    </label>
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
                    className="px-4 py-2 rounded-2xl bg-dark-green text-white text-sm font-semibold hover:scale-105 active:scale-95 transition-all duration-300"
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
                <div className="flex justify-between">
                  <span>Hourly price</span>
                  <span>
                    {unitPrice != null
                      ? `${unitPrice} Ft / hour`
                      : "No price defined"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Base price ({hours} hours)</span>
                  <span>{basePrice} Ft</span>
                </div>
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
                  There is no price defined in the system for this combination
                  (season / indoor–outdoor / time of day / student).
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 mt-2">{error}</div>
              )}

              <button
                onClick={handleConfirmReservation}
                disabled={!reservation || isSubmitting || noPriceDefined}
                className={`mt-4 bg-dark-green text-white font-bold text-[18px] py-4 rounded-[24px] shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer w-full text-center disabled:opacity-60 disabled:hover:scale-100`}
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
          title={"Reservation Successful!"}
          description={"Your booking has been confirmed"}
        />
      )}
    </ReserveMenuProvider>
  );
}

export default ReservationCheckout;
