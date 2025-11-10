import { useState } from "react";

function ProfileSettings({ 
    firstName, 
    lastName, 
    email, 
    phoneNumber,
    onUpdateSuccess 
}) {
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [phoneNumberError, setPhoneNumberError] = useState(false);

    const [updatedFirstName, setUpdatedFirstName] = useState("");
    const [updatedLastName, setUpdatedLastName] = useState("");
    const [updatedEmail, setUpdatedEmail] = useState("");
    const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState("");

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [currentPasswordError, setCurrentPasswordError] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");

    const validateDetails = (firstName, lastName, phoneNumber, email) => {
        let valid = true;

        const namePattern = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/;
        const phonePattern = /^\+?[0-9]+$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!namePattern.test(firstName)) {
            setFirstNameError(true);
            setUpdatedFirstName("");
            valid = false;
        } else setFirstNameError("");

        if (!namePattern.test(lastName)) {
            setLastNameError(true);
            setUpdatedLastName("");
            valid = false;
        } else setLastNameError("");

        if (!phonePattern.test(phoneNumber)) {
            setPhoneNumberError(true);
            setUpdatedPhoneNumber("");
            valid = false;
        } else setPhoneNumberError("");

        if (!emailPattern.test(email)) {
            setEmailError(true);
            setUpdatedEmail("");
            valid = false;
        } else setEmailError("");

        return valid;
    };

    const validatePassword = (password) => {
        let valid = true;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordPattern.test(password)) {
            setNewPasswordError("Invalid new password");
            setNewPassword("");
            valid = false;
        } else setNewPasswordError("");

        return valid;
    }

    const handleChangeDetails = (e) => {
        e.preventDefault();
        
        if (!validateDetails(updatedFirstName || firstName, updatedLastName || lastName, updatedPhoneNumber || phoneNumber, updatedEmail || email)) return;

        const updatedDetails = {
            firstName: updatedFirstName || firstName,
            lastName: updatedLastName || lastName,
            email: updatedEmail || email,
            phoneNumber: updatedPhoneNumber || phoneNumber,
        };

        if (JSON.stringify(updatedDetails) === JSON.stringify({firstName, lastName, email, phoneNumber})) {
            alert("No changes detected.");
            return;
        } else {
            fetch("http://localhost:5044/api/Users/edit", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedDetails),
                credentials: "include"
            })
            .then(response => {
                if (response.ok) {
                    console.log("Details updated successfully.");
                    onUpdateSuccess();
                } else {
                    alert("Failed to update details.");
                }
            })
        }
    }

    const handlePasswordChange = (e) => {
        e.preventDefault();
        
        if (!validatePassword(newPassword)) return;

        if (currentPassword === "" || newPassword === "") {
            alert("No changes detected.");
            return;
        } else {
            fetch("http://localhost:5044/api/ChangePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    password: currentPassword, 
                    newPassword: newPassword 
                }),
                credentials: "include"
            })
            .then(response => {
                if (response.ok) {
                    console.log("Password changed successfully.");
                    onUpdateSuccess();
                } else {
                    setCurrentPasswordError("Invalid current password");
                    setCurrentPassword("");
                    setNewPassword("");
                }
            })
        }
    }

    return (
        <div className="flex flex-row gap-5 mt-5">
            <div className="flex-4 flex flex-col border-dark-green-octa border shadow-lg shadow-dark-green-octa py-5 px-5 rounded-lg">
                <div className="font-semibold">Details</div>
                <form onSubmit = {(e) => handleChangeDetails(e)}>
                    <div className="ml-2 flex flex-row mt-3 gap-5">
                        <div className="flex-col">
                            <div>First Name</div>
                            <input 
                                type="text" 
                                value={updatedFirstName}
                                onChange={(e) => {setUpdatedFirstName(e.target.value)}}
                                className={`py-2 pl-4 bg-dark-green-octa text-dark-green-half rounded-lg mt-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green focus:bg-opacity-80 ${
                                firstNameError && !updatedFirstName
                                    ? "border border-red-500 focus:ring-red-400 placeholder:text-red-500"
                                    : "focus:ring-dark-green focus:bg-opacity-80"
                                }`}
                                placeholder={firstName}
                                />
                        </div>
                        <div className="flex flex-col">
                            <div>Phone Number</div>
                            <input 
                                type="text" 
                                value={updatedPhoneNumber}
                                onChange={(e) => {setUpdatedPhoneNumber(e.target.value)}}
                                className={`py-2 pl-4 bg-dark-green-octa text-dark-green-half rounded-lg mt-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green focus:bg-opacity-80 ${
                                phoneNumberError && !updatedPhoneNumber
                                    ? "border border-red-500 focus:ring-red-400 placeholder:text-red-500"
                                    : "focus:ring-dark-green focus:bg-opacity-80"
                                }`} 
                                placeholder={phoneNumber}
                            />
                        </div>
                    </div>
                    <div className="ml-2 flex flex-row mt-3 gap-5">
                        <div className="flex flex-col">
                            <div>Last Name</div>
                            <input 
                                type="text" 
                                value={updatedLastName}
                                onChange={(e) => {setUpdatedLastName(e.target.value)}}
                                className={`py-2 pl-4 bg-dark-green-octa text-dark-green-half rounded-lg mt-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green focus:bg-opacity-80 ${
                                lastNameError && !updatedLastName
                                    ? "border border-red-500 focus:ring-red-400 placeholder:text-red-500"
                                    : "focus:ring-dark-green focus:bg-opacity-80"
                                }`}
                                placeholder={lastName}
                            />
                        </div>
                        <div className="w-80 flex flex-col">
                            <div>Email</div>
                            <input 
                                type="text" 
                                value={updatedEmail}
                                onChange={(e) => {setUpdatedEmail(e.target.value)}}
                                className={`py-2 pl-4 bg-dark-green-octa text-dark-green-half rounded-lg mt-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green focus:bg-opacity-80 ${
                                emailError && !updatedEmail
                                    ? "border border-red-500 focus:ring-red-400 placeholder:text-red-500"
                                    : "focus:ring-dark-green focus:bg-opacity-80"
                                }`}
                                placeholder={email}
                            />
                        </div>
                    </div>
                    <div className="flex flex-row gap-5 mt-5">
                        <input 
                            type="submit" 
                            value="Save Changes" 
                            className="ml-2 w-fit px-5 font-bold py-2 rounded-lg bg-dark-green text-white cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                        />
                    </div>
                </form>
            </div>
            <div className="flex-3 flex-col border-dark-green-octa border shadow-lg shadow-dark-green-octa py-5 px-5 rounded-lg">
                <form onSubmit = {(e) => handlePasswordChange(e)}>
                    <div className="font-semibold">Password</div>
                    <div className="flex flex-col mt-3 ml-2">
                        <div>Current password</div>
                        <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={`py-2 pl-4 bg-dark-green-octa text-dark-green-half rounded-lg mt-2 w-80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green focus:bg-opacity-80 ${
                            currentPasswordError && !currentPassword
                                ? "border border-red-500 focus:ring-red-400 placeholder:text-red-500"
                                : "focus:ring-dark-green focus:bg-opacity-80"
                            }`} 
                            placeholder={currentPasswordError ? currentPasswordError : "Put your current password..."}
                        />
                    </div>

                    <div className="flex flex-col mt-3 ml-2">
                        <div>New password</div>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`py-2 pl-4 bg-dark-green-octa text-dark-green-half rounded-lg mt-2 w-80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green focus:bg-opacity-80 ${
                            newPasswordError && !newPassword
                                ? "border border-red-500 focus:ring-red-400 placeholder:text-red-500"
                                : "focus:ring-dark-green focus:bg-opacity-80"
                            }`}
                            placeholder={newPasswordError ? newPasswordError : "Put your new password..."}
                        />
                    </div>
                    <div className="flex flex-row mt-5 gap-5 ml-2">
                        <input 
                            type="submit" 
                            value="Save Changes" 
                            className="w-fit px-5 font-bold py-2 rounded-lg bg-dark-green text-white cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileSettings;