import { useNavigate } from "react-router-dom";
import settingsIcon from "../assets/settings.svg";
import historyIcon from "../assets/history.svg";
import couponIcon from "../assets/coupon.svg";
import adminIcon from "../assets/admin.svg";
import logoutIcon from "../assets/logout.svg";

function AccountDropdown({ hidden, user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        fetch("http://localhost:5044/api/auth/logout", {
            method: "POST",
            credentials: "include"
        }).then(() => {
            navigate(0);
        });
    };

    return (
        <div
            className={`absolute right-0 top-16 w-44 bg-white border-dark-green-octa border rounded-xl shadow-md transition-all duration-200 ease-out ${
                hidden
                    ? "opacity-0 pointer-events-none translate-y-[-8px]"
                    : "opacity-100 translate-y-0"
            }`}
        >
            <div className="flex flex-col py-4 px-5">

                {/* Settings */}
                <div
                    className="cursor-pointer flex gap-2.5 transition-all ease-in-out duration-200 w-full justify-end hover:translate-x-[-2px] group hover:bg-gray-50 py-1 px-2 rounded-lg"
                    onClick={() => navigate("/profile?tab=settings")}
                >
                    <span>Settings</span>
                    <img
                        src={settingsIcon}
                        alt=""
                        className="group-hover:rotate-180 transition-transform duration-500"
                    />
                </div>

                {/* History */}
                <div
                    className="cursor-pointer flex gap-2.5 transition-all duration-200 w-full justify-end hover:translate-x-[-2px] group hover:bg-gray-50 py-1 px-2 rounded-lg"
                    onClick={() => navigate("/profile?tab=history")}
                >
                    <span>History</span>
                    <img
                        src={historyIcon}
                        alt=""
                        className="group-hover:rotate-360 ease-in-out transition-transform duration-500"
                    />
                </div>

                {/* Coupons – ÚJ MENÜPONT */}
                <div
                    className="cursor-pointer flex gap-2.5 transition-all duration-200 w-full justify-end hover:translate-x-[-2px] group hover:bg-gray-50 py-1 px-2 rounded-lg"
                    onClick={() => navigate("/profile?tab=coupons")}
                >
                    <span>Coupons</span>
                    <img
                        src={couponIcon}
                        alt=""
                        className="group-hover:-translate-y-[2px] transition-transform duration-300"
                    />
                </div>

                {/* Admin Panel - csak adminoknak */}
                {user.roleID === 2 && (
                    <div
                        className="cursor-pointer flex gap-2.5 transition-all duration-200 w-full justify-end hover:translate-x-[-2px] group hover:bg-gray-50 py-1 px-2 rounded-lg"
                        onClick={() => navigate("/admin")}
                    >
                        <span>Admin</span>
                        <img
                            src={adminIcon}
                            alt=""
                            className="group-hover:rotate-90 transition-transform duration-200"
                        />
                    </div>
                )}

                {/* Logout */}
                <div
                    className="cursor-pointer flex gap-2 pr-[11px] transition-all duration-200 w-full justify-end hover:translate-x-[-2px] group hover:bg-gray-50 py-1 px-2 rounded-lg"
                    onClick={handleLogout}
                >
                    <span>Logout</span>
                    <img
                        src={logoutIcon}
                        alt=""
                        className="group-hover:-translate-x-[2px] transition-transform duration-200"
                    />
                </div>
            </div>
        </div>
    );
}

export default AccountDropdown;
