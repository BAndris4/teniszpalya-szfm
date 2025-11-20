import { useState, useEffect } from "react";
import AccountDropdown from "./AccountDropdown";
import { useNavigate } from "react-router-dom";
import ReserveMenu from "./ReserveMenu";
import { useReserveMenu } from "../contexts/ReserveMenuContext";
import { useCurrentUser } from "../hooks/useCurrentUser";
import profilePic from "../assets/profile_pic.svg";

function Navbar() {

    const [accountDropdown, setAccountDropdown] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const {isReserveMenuVisible, setIsReserveMenuVisible} = useReserveMenu();
    const { user, authenticated } = useCurrentUser();

    const navigate = useNavigate();
    
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleSectionClick = (section) => {
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            navigate(`/`);
            setTimeout(() => {
                const el = document.getElementById(section);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 500);
        }
    };

    return (
        <div>
            <nav className={`h-[118px] flex justify-end items-center border-dark-green-octa border-b-[1px] z-10 relative text-[18px] transition-all duration-200 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex flex-row gap-8 h-[54px] mr-[42px] items-center justify-end">
                    <div className="flex flex-row gap-12 text-dark-green">
                        <div className={`cursor-pointer relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-dark-green after:left-0 after:bottom-[-4px] after:transition-all after:duration-300 hover:after:w-full duration-1000 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} onClick={() => handleSectionClick('Navbar')}>Home</div>
                        <div className={`cursor-pointer relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-dark-green after:left-0 after:bottom-[-4px] after:transition-all after:duration-300 hover:after:w-full duration-1000 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} onClick={() => handleSectionClick('Courts')}>Courts</div>
                        <div className={`cursor-pointer relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-dark-green after:left-0 after:bottom-[-4px] after:transition-all after:duration-300 hover:after:w-full duration-1000 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} onClick={() => handleSectionClick('PriceList')}>Price List</div>
                        <div className={`cursor-pointer relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-dark-green after:left-0 after:bottom-[-4px] after:transition-all after:duration-300 hover:after:w-full duration-1000 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} onClick={() => navigate('/tournaments')}>Tournaments</div>
                        <div className={`cursor-pointer relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-dark-green after:left-0 after:bottom-[-4px] after:transition-all after:duration-300 hover:after:w-full duration-1000 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} onClick={() => navigate('/contact')}>Contact</div>
                    </div>
                    <div onClick={() => setIsReserveMenuVisible(true)} className={`px-[32px] py-[12px] text-[16px] bg-green text-white font-semibold rounded-[30px] cursor-pointer hover:bg-dark-green hover:shadow-lg transition-all duration-500 active:scale-95 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>Reserve</div>
                    {authenticated ? (
                        <div className="relative">
                            <img 
                                src={profilePic}
                                alt="Profile" 
                                className={`h-12 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-700 hover:drop-shadow-lg ease-in-out ${isLoaded ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-360'}`}
                                onClick={() => setAccountDropdown(!accountDropdown)}
                            />
                            <AccountDropdown hidden={!accountDropdown} user={user}/>
                        </div>
                    ) : (
                        <a href="/login">
                            <div className={`px-[32px] py-[12px] text-[16px] bg-white border-dark-green text-dark-green border-[1px] rounded-[30px] cursor-pointer hover:bg-dark-green hover:text-white transition-all duration-500 active:scale-95 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                Login
                            </div>
                        </a>
                    )}
                </div>
            </nav>
            <ReserveMenu/>
            <div className={`fixed h-[118px] top-0 w-full bg-[rgb(0,0,0,0.4)] z-20 pointer-events-none transition-all duration-300 ease-in-out ${isReserveMenuVisible ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
}
export default Navbar;