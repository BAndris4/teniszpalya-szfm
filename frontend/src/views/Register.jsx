import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { useCurrentUser } from "../hooks/useCurrentUser";

function Register() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [phoneNumberError, setPhoneNumberError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();

    const { authenticated } = useCurrentUser();

    useEffect(() => {
        if (authenticated == true) {
            navigate("/");
        }
    }, [authenticated]);

    const validateForm = async () => {
        let valid = true;

        const namePattern = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/;
        if (!namePattern.test(firstName)) {
            setFirstNameError("First name can only contain letters");
            valid = false;
        } else {
            setFirstNameError("");
        }

        if (!namePattern.test(lastName)) {
            setLastNameError("Last name can only contain letters");
            valid = false;
        } else {
            setLastNameError("");
        }

        const phoneNumberPattern = /^\+?[0-9]+$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            setPhoneNumberError("Phone number must contain only digits and may contain a leading '+'");
            valid = false;
        } else {
            setPhoneNumberError("");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setEmailError("Please enter a valid email address (e.g., user@example.com)");
            valid = false;
        } else {
            setEmailError("");
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordPattern.test(password)) {
            setPasswordError("Password must be at least 8 characters and include uppercase, lowercase and number");
            setPassword("");
            valid = false;
        } else {
            setPasswordError("");
        }
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!(await validateForm())) return;
        const data = {
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
        };

        try {
            await fetch("http://localhost:5044/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            console.log("User created successfully");
            await fetch("http://localhost:5044/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });
            console.log("User logged in successfully");
            navigate("/");
        } catch (error) {
            console.error("Error:", error);
        }
    };


    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div>
            <div className="w-[50vw] h-[50vw] bg-green rounded-full fixed blur-[200px] pointer-events-none z-0 opacity-20 animate-pulse"/>
            
            <div className="flex flex-col lg:flex-row min-h-screen gap-10 lg:gap-28 mx-4 sm:mx-8 lg:mx-20">
                  <div className="hidden lg:flex flex-1 my-15 z-10 items-center">
                    <a href="/" className="w-full h-full">
                        <div className="h-full w-full min-h-[400px] bg-[url(/src/assets/tennis_court.jpg)] bg-cover bg-center hover:scale-105 shadow-2xl transition-all duration-500 cursor-pointer rounded-[30px] z-10" />
                    </a>
                </div>

                <div className="flex-1 flex flex-col justify-center py-10 lg:py-0">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-4 sm:gap-[16px] items-center justify-center">
                                <div className="text-2xl text-[36px] font-semibold text-dark-green min-h-[50px]">
                                    Sign up
                                </div>
                                <div className="text-center max-w-[360px] text-dark-green-half min-h-[48px] leading-relaxed text-sm sm:text-base">
                                    Join our community and get access to exclusive features and content.
                                </div>
                            </div>

                            <div className="flex flex-col gap-5 sm:gap-[24px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                                    <div className="flex-1 flex flex-col">
                                        <InputField label="First Name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} hasError={!!firstNameError}/>
                                        {firstNameError && <p className="text-red-500 text-sm mt-1">{firstNameError}</p>}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <InputField label="Last Name" placeholder="Carter" value={lastName} onChange={(e) => setLastName(e.target.value)}  hasError={!!lastNameError}/>
                                        {lastNameError && <p className="text-red-500 text-sm mt-1">{lastNameError}</p>}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <InputField label="Phone" type="tel" placeholder="+36201234567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} hasError={!!phoneNumberError} />
                                    {phoneNumberError && <p className="text-red-500 text-sm mt-1">{phoneNumberError}</p>}
                                </div>  

                                <div className="flex flex-col">
                                    <InputField label="Email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} hasError={!!emailError}/>
                                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                                </div>  
                                
                                <div className="flex flex-col justify-between">
                                    <div className="mb-2 text-dark-green font-medium text-sm sm:text-base">Password</div>
                                    <div className="relative w-full">
                                        <input
                                            type={isVisible ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`bg-white rounded-[16px] w-full h-[50px] sm:h-[62px] px-4 pr-[50px] text-sm sm:text-base focus:outline-none focus:ring-2 transition-all duration-300 
                                                ${passwordError
                                                    ? "border border-red-500  focus:border-red-500 focus:ring-red-300"
                                                    : "border border-dark-green-half focus:border-dark-green focus:ring-green/20"
                                                }`}
                                            />
                                        <button
                                            type="button"
                                            onClick={toggleVisibility}
                                            className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform duration-300"
                                            aria-label={isVisible ? 'Hide password' : 'Show password'}
                                        >
                                            {isVisible ? (
                                                <div className="w-6 h-6 bg-[url(/src/assets/eye-open.svg)] bg-cover bg-center" />
                                            ) : (
                                                <div className="w-6 h-6 bg-[url(/src/assets/eye-closed.svg)] bg-cover bg-center"/>
                                            )}
                                        </button>
                                    </div>
                                    {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                                </div>

                                <input 
                                    type="submit" 
                                    disabled={!firstName || !lastName || !email || !password || !phoneNumber}
                                    className={`bg-green text-white font-semibold rounded-[30px] h-[50px] sm:h-[62px] text-sm sm:text-base 
                                    ${!firstName || !lastName || !email || !password || !phoneNumber ? "opacity-50 cursor-not-allowed" : "hover:bg-dark-green hover:shadow-lg active:scale-95 cursor-pointer"} 
                                    transition-all duration-300`}
                                    value="Sign up"
                                />

                                <div className="flex justify-center text-sm sm:text-base animate-in fade-in duration-700 delay-200">
                                    Already have an account?&nbsp;
                                    <a href="/login" className="text-[#2388FF] hover:underline hover:text-[#1565c0] transition-colors duration-300">
                                        Login
                                    </a>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;