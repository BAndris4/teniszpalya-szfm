import { useState } from "react";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";
import AdminTopbar from "../components/AdminTopbar";
import ReservationsTab from "../components/ReservationsTab";


export default function AdminPanel() {
const [activeTab, setActiveTab] = useState("reservations");
return (
  <ReserveMenuProvider>
    <div className="select-none min-h-screen bg-[#f6f9f7]">
        <AdminTopbar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mx-auto max-w-[1200px] px-5 py-8">
        {activeTab === "reservations" && <ReservationsTab />}
      </div>
    </div>
  </ReserveMenuProvider>
  );
}