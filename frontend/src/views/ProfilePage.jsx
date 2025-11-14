import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";
import { useCurrentUser } from "../hooks/useCurrentUser";
import ProfileSettings from "../components/ProfileSettings";
import History from "../components/History";
import Coupons from "../components/Coupons";

function ProfilePage() {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [isLoaded, setIsLoaded] = useState(false);

    const [validRequest, setValidRequest] = useState(false);

    const {user, authenticated} = useCurrentUser();
    
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    const [tab, setTab] = useState(queryParams.get("tab") || "settings");

    useEffect(() => {
        const newTab = queryParams.get("tab");
        if (newTab && newTab !== tab) setTab(newTab);
    }, [location.search]);

    const changeTab = (tab) => {
        setTab(tab);
        navigate(`?tab=${tab}`, { replace: true });
    }

    useEffect(() => {
        console.log(user, authenticated);
        if (authenticated === false) {
            navigate("/login");
        } else if (authenticated === true){
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email);
            setPhoneNumber(user.phoneNumber);
            setTimeout(() => setIsLoaded(true), 100);
        }
    }, [user, authenticated]);

    const handleUpdateSuccess = () => {
        setValidRequest(true);
        setTimeout(() =>
            navigate(0)
        , 1000);
    };

    return (
        <ReserveMenuProvider>
        <div className="min-h-screen overflow-hidden relative">
            <div className={`w-[50vw] h-[50vw] bg-light-green rounded-full absolute blur-[200px] z-0 top-[40vh] left-[-10vw] transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`} />
            <div className={`w-[50vw] h-[50vw] bg-light-green rounded-full absolute blur-[200px] z-0 top-[-50vh] left-[50vw] transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`} />
            
            <Navbar />
            
            <div className="flex justify-center mt-[105px] z-10">
                
                
                <div className={`z-10 w-6xl flex flex-col px-5 transition-all duration-700 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>
                    <div className="mt-[115px] text-2xl font-bold text-center">
                        Welcome, {firstName}
                    </div>
                    
                    <div className={`flex flex-row mt-5 gap-5 transition-all duration-700 delay-100 ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                        <div className="border border-dark-green-octa py-3 px-9 rounded-lg shadow-lg shadow-dark-green-octa cursor-pointer transition-all duration-300 hover:-translate-y-1 active:translate-y-0" onClick={() => changeTab("settings")}>
                            Profile Settings
                        </div>
                        <div className="border border-dark-green-octa py-3 px-9 rounded-lg shadow-lg shadow-dark-green-octa cursor-pointer transition-all duration-300  hover:-translate-y-1 active:translate-y-0" onClick={() => changeTab("history")}>
                            History
                        </div>
                        <div className="border border-dark-green-octa py-3 px-9 rounded-lg shadow-lg shadow-dark-green-octa cursor-pointer transition-all duration-300  hover:-translate-y-1 active:translate-y-0" onClick={() => changeTab("coupons")}>
                            Coupons
                        </div>
                    </div>
        

                    <div className={`transition-all duration-700 delay-200 ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                        {tab === "settings" && <ProfileSettings firstName={firstName} lastName={lastName} email={email} phoneNumber={phoneNumber} onUpdateSuccess={handleUpdateSuccess}/>}
                        {tab === "history" && <History />}
                        {tab === "coupons" && <Coupons />}
                    </div>
                </div>
                
                <div className={`absolute w-6xl h-[550px] transition-all duration-700 delay-75 ${
                    isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}>
                    <svg 
                        width="100%" 
                        height="100%" 
                        className="absolute inset-0 drop-shadow-[0px_0px_15px_rgba(0,0,0,0.25)] z-0"
                    >
                        <defs>
                            <mask id="cutout-mask">
                                <rect width="100%" height="100%" fill="white" />
                                <circle cx="50%" cy="0" r="100" fill="black" />
                            </mask>
                        </defs>
                        
                        <rect 
                            width="100%" 
                            height="100%" 
                            rx="30" 
                            ry="30"
                            fill="white"
                            stroke="rgba(1,50,55,0.15)"
                            strokeWidth="1"
                            mask="url(#cutout-mask)"
                        />
                    </svg>
                </div>
                
                <div className="absolute top-[135px] left-1/2 -translate-x-1/2 z-10">
                    <img 
                        src="src/assets/profile_pic.svg" 
                        alt="" 
                        className={`h-[176px] w-[176px] cursor-pointer drop-shadow-[0px_4px_10px_rgba(0,0,0,0.25)] transition-all duration-700 hover:scale-105 ${
                            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        } 
                        ${validRequest ? 'animate-[spin_0.5s_linear]' : ''}
                        `}
                        
                    />
                    {validRequest && (
                        <div className="absolute inset-0 flex items-center justify-center animate-[fadeIn_0.3s_ease-in-out]">
                            <div className="w-[176px] h-[176px] rounded-full bg-green bg-opacity-20  flex items-center justify-center animate-[scaleIn_0.5s_ease-out]">
                                <svg 
                                    className="w-24 h-24 text-white animate-[checkmark_0.6s_ease-in-out]" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor" 
                                    strokeWidth="3"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        d="M5 13l4 4L19 7"
                                        className="animate-[drawCheck_0.6s_ease-in-out_forwards]"
                                        style={{
                                            strokeDasharray: '20',
                                            strokeDashoffset: '20',
                                        }}
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
                
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes scaleIn {
                        from { transform: scale(0); }
                        to { transform: scale(1); }
                    }
                    
                    @keyframes checkmark {
                        from { transform: scale(0) rotate(-45deg); }
                        to { transform: scale(1) rotate(0deg); }
                    }
                    
                    @keyframes drawCheck {
                        to { stroke-dashoffset: 0; }
                    }
                `}</style>
            </div>
        </div>
        </ReserveMenuProvider>
    );
}

export default ProfilePage;