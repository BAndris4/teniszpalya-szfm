// src/views/ReserveByCourts.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ReserveByCourts from "./ReserveByCourts";
import { MemoryRouter } from "react-router-dom";

// ---------------------- MOCK FETCH COURTS ----------------------
const mockCourts = [
  { id: 1, outdoors: true },
  { id: 2, outdoors: false },
];

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockCourts),
  })
);

// ---------------------- MOCK NAVIGATION ----------------------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

// ---------------------- MOCK AUTH ----------------------
let mockAuthenticated = true;

vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    authenticated: mockAuthenticated,
    user: { firstName: "Test" },
  }),
}));

// ---------------------- MOCK CHILDREN ----------------------
vi.mock("../components/Navbar", () => ({
  default: () => <div data-testid="navbar">NAVBAR</div>,
}));

vi.mock("../components/DatePicker", () => ({
  default: ({ setDate }) => (
    <button data-testid="date-next" onClick={() => setDate(new Date())}>
      Change date
    </button>
  ),
}));

vi.mock("../components/CourtCardSmall", () => ({
  default: ({ court, onClick }) => (
    <div data-testid={`court-${court.id}`} onClick={onClick}>
      COURT {court.id}
    </div>
  ),
}));

vi.mock("../components/TimeBlock", () => ({
  default: ({ time, disabled, onClick, active }) => (
    <div
      data-testid={`time-${time}`}
      onClick={!disabled ? onClick : undefined}
      data-active={active ? "yes" : "no"}
      data-disabled={disabled ? "yes" : "no"}
    >
      {time}
    </div>
  ),
}));

// FIX RANDOMNESS
vi.spyOn(Math, "random").mockReturnValue(1);

// HELPER → open picker & wait load
async function setupPage() {
  render(
    <MemoryRouter>
      <ReserveByCourts />
    </MemoryRouter>
  );

  // wait fetch
  await waitFor(() => expect(fetch).toHaveBeenCalled());

  // open picker
  fireEvent.click(screen.getByText("Select a court!"));

  return true;
}

// ===================================================================
// ========================= TESTS ===================================
// ===================================================================

describe("ReserveByCourts page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticated = true;
  });

  it("redirects to /login if user is not authenticated", async () => {
    mockAuthenticated = false;

    render(
      <MemoryRouter>
        <ReserveByCourts />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("loads courts list from backend", async () => {
    await setupPage();

    expect(await screen.findByTestId("court-1")).toBeInTheDocument();
    expect(await screen.findByTestId("court-2")).toBeInTheDocument();
  });

  it("selects a court", async () => {
    await setupPage();

    fireEvent.click(screen.getByTestId("court-1"));
    expect(screen.getByText("Tennis Court #1")).toBeInTheDocument();
  });

  it("disables ALL times if selected court is OUTDOOR in winter", async () => {
    await setupPage();

    fireEvent.click(screen.getByTestId("court-1")); // outdoors

    const t8 = await screen.findByTestId("time-08:00");
    expect(t8.dataset.disabled).toBe("yes");
  });

  it("allows time selection when court is indoor", async () => {
    await setupPage();

    fireEvent.click(screen.getByTestId("court-2")); // indoor

    const t10 = await screen.findByTestId("time-10:00");

    fireEvent.click(t10);

    expect(t10.dataset.active).toBe("yes");
  });

  it("navigates to checkout with correct meta data", async () => {
    await setupPage();

    fireEvent.click(screen.getByTestId("court-2")); // indoor
    fireEvent.click(screen.getByTestId("time-11:00"));

    fireEvent.click(screen.getByText("Accept reservation"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/checkout",
      expect.objectContaining({
        state: expect.objectContaining({
          reservation: expect.any(Object),
          meta: expect.objectContaining({
            label: "Tennis Court #2",
          }),
        }),
      })
    );
  });
});
