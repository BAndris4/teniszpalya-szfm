import { useEffect, useState } from "react";

function History() {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5044/api/Reservations/my", {
            method: "GET",
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            setReservations(data);
        })
        .catch(error => {
            console.error("Error fetching reservations:", error);
        });
    }, []);

    const getReservationStatus = (reservedAt, hours) => {
        const now = Date.now();
        const startTime = reservedAt;
        const endTime = reservedAt + (hours * 60 * 60 * 1000);

        if (now < startTime) {
            return "upcoming";
        } else if (now >= startTime && now < endTime) {
            return "ongoing";
        } else {
            return "completed";
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('hu-HU', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('hu-HU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getStatusColor = (status) => {
        switch(status) {
            case "upcoming":
                return "bg-blue-500";
            case "ongoing":
                return "bg-red-500";
            case "completed":
                return "bg-green";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case "upcoming":
                return "Upcoming";
            case "ongoing":
                return "Ongoing";
            case "completed":
                return "Completed";
            default:
                return "Unknown";
        }
    };

    return (
        <div className="flex flex-col gap-4 mt-5 px-2 max-h-[300px] pb-5 overflow-y-auto pr-2">
            {reservations.length === 0 ? (
                <div className="border-dark-green-octa border shadow-lg shadow-dark-green-octa py-10 px-5 rounded-lg text-center">
                    <div className="text-gray-500">No reservations found</div>
                </div>
            ) : (
                reservations
                    .sort((a,b) => b.reservedAt - a.reservedAt)
                    .map((reservation) => {
                    const status = getReservationStatus(reservation.reservedAt, reservation.hours);
                    const startTime = reservation.reservedAt;
                    const endTime = reservation.reservedAt + (reservation.hours * 60 * 60 * 1000);

                    return (
                        <div 
                            key={reservation.id}
                            className="border-dark-green-octa border shadow-lg shadow-dark-green-octa py-4 px-5 mt-1 cursor-pointer rounded-lg hover:scale-[1.01] transition-all duration-200"
                        >
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-row gap-8">
                                    <div className="flex flex-col">
                                        <div className="text-sm text-dark-green-half">Court</div>
                                        <div className="font-semibold text-lg">Court {reservation.courtID}</div>
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <div className="text-sm text-dark-green-half">Date</div>
                                        <div className="font-semibold">{formatDate(reservation.reservedAt)}</div>
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <div className="text-sm text-dark-green-half">Time</div>
                                        <div className="font-semibold">
                                            {formatTime(startTime)} - {formatTime(endTime)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <div className="text-sm text-dark-green-half">Duration</div>
                                        <div className="font-semibold">{reservation.hours} {reservation.hours === 1 ? 'hour' : 'hours'}</div>
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <div className="text-sm text-dark-green-half">Booked on</div>
                                        <div className="font-semibold text-sm">{formatDate(reservation.createdAt)}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <div className={`${getStatusColor(status)} text-white px-6 py-2 rounded-full font-semibold text-sm`}>
                                        {getStatusText(status)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default History;