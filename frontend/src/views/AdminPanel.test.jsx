import { render, screen, fireEvent } from "@testing-library/react";
import AdminPanel from "./AdminPanel";

// --- MOCK child components ---
vi.mock("../components/AdminTopbar", () => ({
  default: ({ activeTab, onTabChange }) => (
    <div data-testid="topbar">
      <div>Active: {activeTab}</div>
      <button onClick={() => onTabChange("reservations")}>
        GoReservations
      </button>
      <button onClick={() => onTabChange("courts")}>
        GoCourts
      </button>
    </div>
  ),
}));

vi.mock("../components/ReservationsTab", () => ({
  default: () => <div data-testid="reservations-tab">ReservationsTab</div>,
}));

vi.mock("../components/CourtsTab", () => ({
  default: () => <div data-testid="courts-tab">CourtsTab</div>,
}));

// --- MOCK hook useAdminTabSync ---
const mockSetActiveTab = vi.fn();

vi.mock("../hooks/useAdminTabSync", () => ({
  useAdminTabSync: () => ({
    activeTab: mockActiveTab,
    setActiveTab: mockSetActiveTab,
  }),
}));

// dynamic activeTab for tests
let mockActiveTab = "reservations";

describe("AdminPanel View", () => {
  beforeEach(() => {
    mockActiveTab = "reservations";
    mockSetActiveTab.mockClear();
  });

  test("renders ReservationsTab by default", () => {
    render(<AdminPanel />);

    expect(screen.getByTestId("reservations-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("courts-tab")).not.toBeInTheDocument();
  });

  test("renders CourtsTab when activeTab = courts", () => {
    mockActiveTab = "courts";
    render(<AdminPanel />);

    expect(screen.getByTestId("courts-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("reservations-tab")).not.toBeInTheDocument();
  });

  test("calls setActiveTab when topbar buttons are clicked", () => {
    render(<AdminPanel />);

    fireEvent.click(screen.getByText("GoCourts"));
    expect(mockSetActiveTab).toHaveBeenCalledWith("courts");

    fireEvent.click(screen.getByText("GoReservations"));
    expect(mockSetActiveTab).toHaveBeenCalledWith("reservations");
  });

  test("passes correct activeTab to AdminTopbar", () => {
    render(<AdminPanel />);

    expect(screen.getByText("Active: reservations")).toBeInTheDocument();
  });
});
