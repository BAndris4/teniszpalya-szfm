import { useNavigate } from "react-router-dom";

export default function AdminTopbar({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  return (
    <div className="w-full border-b border-dark-green-octa bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-dark-green px-3 py-1.5 text-sm font-bold text-white">Admin</div>
          <h1 className="text-xl font-bold text-dark-green">Teniszpálya – Control Panel</h1>
        </div>
        <div className="flex items-center gap-2">
          <TabButton active={activeTab === "reservations"} onClick={() => onTabChange("reservations")}>Reservations</TabButton>
          <TabButton active={activeTab === "courts"} onClick={() => onTabChange("courts")}>Courts</TabButton>
          <TabButton active={activeTab === "tournaments"} onClick={() => onTabChange("tournaments")}>Tournaments</TabButton>
          <button
            className="cursor-pointer rounded-xl border border-dark-green-octa px-3 py-1.5 text-sm font-medium text-dark-green transition-all hover:bg-dark-green hover:text-white"
            onClick={() => navigate("/")}
          >
            Back to site
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
        active ? "bg-dark-green text-white shadow-md" : "border border-dark-green-octa bg-white text-dark-green hover:bg-dark-green/10"
      }`}
    >
      {children}
    </button>
  );
}
