import { useState, useEffect, use } from "react";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";
import Navbar from "../components/Navbar";
import DatePicker from "../components/DatePicker";
import CourtCardSmall from "../components/CourtCardSmall";
import TimeBlock from "../components/TimeBlock";
import { useNavigate } from "react-router-dom";
import ConfirmResponsePopup from "../components/ConfirmResponsePopup";
import { useCurrentUser } from "../hooks/useCurrentUser";

function ReserveByCourts() {
    const [date, setDate] = useState(new Date());
    const [length, setLength] = useState(1);
    const [courts, setCourts] = useState([]);
    const [selectedCourt, setSelectedCourt] = useState("Select a court!");
    const [isCourtPickerOpen, setIsCourtPickerOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [timeList, setTimeList] = useState(["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]);
    const [freeTimes, setFreeTimes] = useState([]);
    const [isReservationOk, setIsReservationOk] = useState(false);
    
    const navigate = useNavigate();

    const {authenticated} = useCurrentUser();

    useEffect(() => {
        if (authenticated === false) {
            navigate("/login");
        } 
    }, [authenticated]);

    useEffect(() => {
        const generatedFreeTimes = timeList.filter(() => Math.random() > 0.5);
        setFreeTimes(generatedFreeTimes);
        setSelectedTime(null);
    }, [date, length, selectedCourt]);
    
    useEffect(() => {
        setLength(1);
        setSelectedCourt("Select a court!");
    }, [date]);
    
    const lowerLength = () => {
        if (length > 1) {
            setLength(length - 1);
        }
    }

    const higherLength = () => {
        if (length < 12) {
            setLength(length + 1);
        }
    }

    const handleReservation = () => {
        
        const reservedAt = new Date(date);
        const [hours, minutes] = selectedTime.split(":").map(Number);
        reservedAt.setHours(hours, minutes, 0, 0);

        const courtID = Number(selectedCourt.split("#")[1]);

        const data = {
            createdAt: Date.now(),
            reservedAt: reservedAt.getTime(),
            hours: length,
            courtID: courtID
        }

        console.log(data);

        if (selectedTime === null || selectedCourt === "Select a court!") {
            alert("Please select a time and a court!");
            return;
        }

        fetch("http://localhost:5044/api/Reservations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setIsReservationOk(true);
            setTimeout(() => {
                navigate("/");
            }, 2500);
        })
        .catch(error => console.error("Error:", error));
    }


    useEffect(() => {
        fetch("http://localhost:5044/api/Courts")
            .then((response) => response.json())
            .then((data) => {
                setCourts(data);
            } )
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <ReserveMenuProvider>
            <div className="select-none">
                <Navbar/>
                <div className="flex flex-col p-10 gap-10 items-center justify-start">
                    <DatePicker date={date} setDate={setDate} className=""/>
                    <div className="flex flex-row gap-10">
                        <div className="bg-white border rounded-[20px] flex flex-col px-5 pt-10 pb-5 gap-9 border-dark-green-octa shadow-md w-[400px]">

                            <div className="flex flex-col gap-2">
                                <div className="font-medium text-[16px] text-dark-green">Length</div>
                                <div className="bg-white border border-dark-green px-4 py-2 rounded-2xl flex flex-row justify-between items-center transition-all duration-300 shadow-md">
                                    <div>{length} hour</div>
                                    <div className="flex flex-col gap-1">
                                        <img src="./src/assets/full_chevron_up.svg" className="hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer" alt="" onClick={higherLength}/>
                                        <img src="./src/assets/full_chevron_down.svg" className="hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer" alt="" onClick={lowerLength}/>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="font-medium text-[16px] text-dark-green">Time</div>
                                <div className="bg-white border border-dark-green px-4 py-5 rounded-2xl flex flex-row justify-between items-center transition-all duration-300 shadow-md cursor-pointer" onClick={() => setIsCourtPickerOpen(!isCourtPickerOpen)}>
                                    <div className="flex flex-row gap-2 items-center justify-center">
                                        <img src="./src/assets/tennis_court.svg" className="w-5 h-5 rotate-[52deg]" alt="" />
                                        <div>{selectedCourt}</div>
                                    </div>
                                    <img src="./src/assets/chevron_down.svg" className="hover:scale-110 active:scale-90 transition-all duration-300" alt=""/>
                                </div>
                                {isCourtPickerOpen &&
                                    <div className="flex flex-col max-h-[300px] overflow-y-scroll px-2 py-2 border border-dark-green-octa rounded-[8px] overflow-x-hidden gap-5 mt-2">
                                        {courts.map((court) => (
                                            <CourtCardSmall key={court.id} court={court} onClick={() => setSelectedCourt("Tennis Court #" + court.id)} active={"Tennis Court #" + court.id === selectedCourt}/>
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="flex flex-col gap-13 py-28 bg-white border rounded-[20px] px-10 justify-center items-center border-dark-green-octa shadow-md w-[800px]">
                            <div className="grid grid-cols-4 gap-x-1.5 gap-y-[50px] w-full">
                                {timeList.map((time) => (
                                    <TimeBlock key={time} time={time} disabled={!freeTimes.includes(time)} onClick={() => setSelectedTime(time)} active={selectedTime === time} />
                                ))}
                            </div>
                            <div className="bg-dark-green text-white font-bold text-[18px] py-4 rounded-[24px] shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer w-full text-center" onClick={handleReservation}>
                                Accept reservation
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isReservationOk && <ConfirmResponsePopup title={"Reservation Successful!"} description={"Your booking has been confirmed"}/>}
        </ReserveMenuProvider>
    );
}

export default ReserveByCourts;