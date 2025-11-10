import { useNavigate } from "react-router-dom";
import { useReserveMenu } from "../contexts/ReserveMenuContext";
import { useCurrentUser } from "../hooks/useCurrentUser";

function ReserveMenu() {

    const { isReserveMenuVisible, setIsReserveMenuVisible } = useReserveMenu();
    const { authenticated } = useCurrentUser();
    const navigate = useNavigate();

    return (
        <div className={`fixed w-full h-full bg-[rgb(0,0,0,0.4)] flex justify-center items-start pt-5 transition-all duration-300 z-30 ${isReserveMenuVisible ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'}`}>
            <div className={`relative flex flex-col items-end justify-center gap-5 z-20 w-full px-2 sm:px-6 md:px-10 lg:px-10 xl:px-45 2xl:px-80 translate-y-0 ${isReserveMenuVisible ? 'opacity-100' : 'opacity-0'} transition-all duration-300`}>
                <div className="w-14 h-14 flex items-center justify-center bg-white rounded-[20px] shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300" onClick={() => setIsReserveMenuVisible(false)}>
                    <img src="./src/assets/cross.svg" alt="" />
                </div>
                <div className="flex flex-col lg:flex-row gap-10 w-full">
                    <div className="min-h-[444px] flex-1 bg-white rounded-[20px] flex flex-col items-start justify-end relative p-8 md:p-12 gap-4 overflow-hidden bg-[url('./src/assets/tennis_court.svg'),url('./src/assets/tennis_ball.svg')] bg-no-repeat bg-[position:80px_-180px,70px_160px] bg-[length:500px_auto,70px_auto] sm:bg-[position:120px_-300px,70px_135px] sm:bg-[length:auto,80px_auto] bg-fixed">
                        <div className="text-dark-green font-bold text-[32px] sm:text-[36px]">Reserve by Courts</div>
                        <div className="w-32 h-[60px] flex items-center justify-center rounded-[40px] text-[18px] font-bold text-white bg-dark-green cursor-pointer hover:scale-105 transition-all duration-300 active:scale-95" onClick={() => 
                            {
                                if (authenticated) {
                                    navigate("/reserveByCourt");
                                } else {
                                    navigate("/login");
                                }
                            }}>Reserve</div>
                    </div>
                    <div className="min-h-[444px] flex-1 bg-dark-green rounded-[20px] flex flex-col items-start justify-end relative p-8 md:p-12 gap-4 overflow-hidden bg-[url('./src/assets/calendar.svg'),url('./src/assets/time.svg')] bg-no-repeat bg-[position:120px_-80px,40px_150px] bg-[length:400px_auto,100px_auto] sm:bg-[position:250px_-80px,70px_135px] sm:bg-[length:475px_auto,100px_auto] bg-fixed">
                        <div className="text-white font-bold  text-[32px] sm:text-[36px]">Reserve by Time</div>
                        <div className="w-32 h-[60px] flex items-center justify-center rounded-[40px] text-[18px] font-bold text-dark-green bg-white cursor-pointer hover:scale-105 transition-all duration-300 active:scale-95" onClick={() => {
                            if (authenticated) {
                                navigate("/reserveByTime");
                            } else {
                                navigate("/login");
                            }
                        }}>Reserve</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReserveMenu;