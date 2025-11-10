import { useEffect, useState } from "react";
import CourtCard from "../components/CourtCard"
import { useNavigate } from "react-router-dom";

function Courts() {
    const [courtInfo, setCourtInfo] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const maxVisible = 4;

    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5044/api/Courts")
            .then((response) => response.json())
            .then((data) => {
                setCourtInfo(data);
                console.log(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    const handlePrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => 
            Math.min(courtInfo.length - maxVisible, prev + 1)
        );
    };

    const showNavigation = courtInfo.length > maxVisible;

 return (
        <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
            <div className="text-dark-green font-bold text-4xl mb-8 text-center z-10">
                Find Your Perfect Court
            </div>
            <div className="text-dark-green text-center text-lg max-w-2xl mb-10 z-10">
                Discover and book tennis courts with ease. Filter by surface type, location, and availability — your next match is just a few clicks away.
            </div>
            
            <div className="flex items-center gap-4 w-full max-w-7xl px-4">
                {showNavigation && (
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="cursor-pointer disabled:cursor-default disabled:opacity-0 transition-all duration-500 ease-in-out z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M15 6 L9 12 L15 18" stroke="#013237" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                    </button>
                )}
                
                <div className="mx-3 overflow-hidden py-5">
                    <div 
                        className="flex gap-6 transition-transform duration-500 ease-in-out z-10"
                        style={{
                            transform: `translateX(-${currentIndex * (256 + 24)}px)`
                        }}
                    >
                        {courtInfo.map((court) => (
                            <CourtCard key={court.id} court={court} onClick={() => navigate(`/courts`)} />
                        ))}
                    </div>
                </div>
                
                {showNavigation && (
                    <button
                        onClick={handleNext}
                        disabled={currentIndex + maxVisible >= courtInfo.length}
                        className="cursor-pointer disabled:cursor-default disabled:opacity-0 transition-all duration-500 ease-in-out z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M9 6 L15 12 L9 18" stroke="#013237" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                    </button>
                )}
            </div>
        </div>
    );
}

export default Courts;