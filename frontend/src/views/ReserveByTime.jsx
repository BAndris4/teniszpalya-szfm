import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DatePicker from "../components/DatePicker.jsx";
import TimeBlock from "../components/TimeBlock.jsx";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext.jsx";
import CourtCardMid from "../components/CourtCardMid.jsx";
import { useNavigate } from "react-router-dom";
import ConfirmResponsePopup from "../components/ConfirmResponsePopup.jsx";
import { useCurrentUser } from "../hooks/useCurrentUser.js";

function ReserveByTime() {
  const [date, setDate] = useState(new Date());
  const [length, setLength] = useState(1);
  const [time, setTime] = useState("Select a time!");
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courtPage, setCourtPage] = useState(0);
  const [isReservationOk, setIsReservationOk] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState(null);

  const navigate = useNavigate();
  const { authenticated } = useCurrentUser();

  useEffect(() => {
    if (authenticated === false) navigate("/login");
  }, [authenticated]);

  useEffect(() => {
    setLength(1);
    setTime("Select a time!");
    setSelectedCourt(null);
  }, [date]);

  const lowerLength = () => { if (length > 1) setLength(length - 1); };
  const higherLength = () => { if (length < 12) setLength(length + 1); };

  const handleReservation = () => {
    if (time === null || selectedCourt === null) {
      alert("Please select a time and a court!");
      return;
    }

    const reservedAt = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    reservedAt.setHours(hours, minutes, 0, 0);

    const data = {
      createdAt: Date.now(),
      reservedAt: reservedAt.getTime(),
      hours: length,
      courtID: selectedCourt
    };

    fetch("http://localhost:5044/api/Reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(resData => {
        console.log(resData);
        setCreatedReservationId(resData.reservationId);
        setIsReservationOk(true);
      })
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    fetch("http://localhost:5044/api/Courts")
      .then(res => res.json())
      .then(data => {
        const updatedData = data.map(court => ({ ...court, disabled: Math.random() < 0.5 }));
        setCourts(updatedData);
      })
      .catch(err => console.error("Error fetching courts:", err));
  }, [time, length, date]);

  const visibleCourts = courts.slice(courtPage * 6, (courtPage + 1) * 6);
  const showLeftChevron = courts.length >= 6 && courtPage > 0;
  const showRightChevron = courts.length >= 6 && (courtPage + 1) * 6 < courts.length;

  return (
    <ReserveMenuProvider>
      <div className="select-none">
        <Navbar />
        <div className="flex flex-col p-10 gap-10 items-center justify-start">
          <DatePicker date={date} setDate={setDate} className="" />
          <div className="flex flex-row gap-10">
            {/* Left panel */}
            <div className="bg-white border rounded-[20px] flex flex-col px-5 py-10 gap-9 border-dark-green-octa shadow-md w-[400px]">
              <div className="flex flex-col gap-2">
                <div className="font-medium text-[16px] text-dark-green">Length</div>
                <div className="bg-white border border-dark-green px-4 py-2 rounded-2xl flex flex-row justify-between items-center shadow-md">
                  <div>{length} hour</div>
                  <div className="flex flex-col gap-1">
                    <img src="./src/assets/full_chevron_up.svg" alt="" onClick={higherLength} className="cursor-pointer hover:scale-110 active:scale-90"/>
                    <img src="./src/assets/full_chevron_down.svg" alt="" onClick={lowerLength} className="cursor-pointer hover:scale-110 active:scale-90"/>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="font-medium text-[16px] text-dark-green">Time</div>
                <div
                  className="bg-white border border-dark-green px-4 py-5 rounded-2xl flex flex-row justify-between items-center shadow-md cursor-pointer"
                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                >
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <img src="./src/assets/history.svg" className="w-5 h-5" alt="" />
                    <div>{time}</div>
                  </div>
                  <img src="./src/assets/chevron_down.svg" alt="" className="hover:scale-110 active:scale-90"/>
                </div>

                {isTimePickerOpen &&
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"].map(t => (
                      <TimeBlock key={t} time={t} onClick={() => { setTime(t); setSelectedCourt(null); }} active={time === t}/>
                    ))}
                  </div>
                }
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-13 bg-white border rounded-[20px] px-10 justify-center items-center py-10 border-dark-green-octa shadow-md w-[800px]">
              <div className="flex flex-row items-center gap-4 w-full">
                <img
                  src="./src/assets/full_chevron_left.svg"
                  className={`cursor-pointer hover:scale-110 active:scale-90 ${!showLeftChevron ? "opacity-0 pointer-events-none" : ""}`}
                  onClick={() => setCourtPage(courtPage - 1)}
                />
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-x-[30px] gap-y-10">
                    {visibleCourts.map(court => (
                      <CourtCardMid
                        key={court.id}
                        court={court}
                        active={court.id === selectedCourt}
                        onClick={() => { if (!court.disabled) setSelectedCourt(court.id); }}
                      />
                    ))}
                  </div>
                </div>
                <img
                  src="./src/assets/full_chevron_right.svg"
                  className={`cursor-pointer hover:scale-110 active:scale-90 ${!showRightChevron ? "opacity-0 pointer-events-none" : ""}`}
                  onClick={() => setCourtPage(courtPage + 1)}
                />
              </div>

              <div
                className="bg-dark-green text-white font-bold text-[18px] py-4 rounded-[24px] shadow-md hover:scale-105 active:scale-95 cursor-pointer w-full text-center mt-6"
                onClick={handleReservation}
              >
                Accept reservation
              </div>
            </div>
          </div>
        </div>

        {/* Success popup with Google Calendar button */}
        {isReservationOk && createdReservationId && (
          <ConfirmResponsePopup
            title="Reservation Successful!"
            description="Your booking has been confirmed"
            onCancel={() => setIsReservationOk(false)}
          >
            <button
              className="bg-[#4285F4] text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition mt-4"
              onClick={() => {
                window.location.href = `http://localhost:5044/api/google/auth?reservationId=${createdReservationId}`;
              }}
            >
              Add to Google Calendar
            </button>
          </ConfirmResponsePopup>
        )}
      </div>
    </ReserveMenuProvider>
  );
}

export default ReserveByTime;