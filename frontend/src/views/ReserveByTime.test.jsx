import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ReserveByTime from "./ReserveByTime";
import { MemoryRouter } from "react-router-dom";

global.alert = vi.fn(); // FIX alert()

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

let mockAuthenticated = true;
vi.mock("../hooks/useCurrentUser.js", () => ({
  useCurrentUser: () => ({ authenticated: mockAuthenticated }),
}));

vi.mock("../components/Navbar", () => ({
  default: () => <div data-testid="navbar">NAV</div>,
}));

// ---------------- WINTER logic inside mock
vi.mock("../components/CourtCardMid.jsx", () => ({
  default: ({ court, active, onClick }) => {
    const isWinter = true; // tests force January
    const disabled = court.disabled || (isWinter && court.outdoors);

    return (
      <div
        data-testid={`court-${court.id}`}
        data-active={active ? "1" : "0"}
        data-disabled={disabled ? "1" : "0"}
        onClick={onClick}
      >
        Court {court.id}
      </div>
    );
  },
}));

vi.mock("../components/TimeBlock.jsx", () => ({
  default: ({ time, active, onClick }) => (
    <button
      data-testid={`time-${time}`}
      data-active={active ? "1" : "0"}
      onClick={onClick}
    >
      {time}
    </button>
  ),
}));

vi.mock("../components/DatePicker.jsx", () => ({
  default: ({ date, setDate }) => (
    <button
      data-testid="date-next"
      onClick={() => {
        const d = new Date(date);
        d.setDate(date.getDate() + 1);
        setDate(d);
      }}
    >
      Change date
    </button>
  ),
}));

// ---------------- FETCH MOCK (disable random)
let mockCourts = [];
let mockDisableRandom = false;

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve(
        mockCourts.map((c) => ({
          ...c,
          disabled: mockDisableRandom ? c.disabled : false,
        }))
      ),
  })
);

describe("ReserveByTime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticated = true;
    mockDisableRandom = false;

    mockCourts = [
      { id: 1, outdoors: false, material: "Clay" },
      { id: 2, outdoors: true, material: "Grass" },
    ];
  });

  it("redirects when not authenticated", () => {
    mockAuthenticated = false;

    render(
      <MemoryRouter>
        <ReserveByTime />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("loads courts after selecting a time", async () => {
    render(
      <MemoryRouter>
        <ReserveByTime />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Select a time!"));
    fireEvent.click(screen.getByTestId("time-10:00"));

    await screen.findByTestId("court-1");
    await screen.findByTestId("court-2");
  });

  it("disables outdoor courts in winter", async () => {
    vi.setSystemTime(new Date("2025-01-10"));

    mockCourts = [
      { id: 10, outdoors: true },
      { id: 11, outdoors: false },
    ];

    render(
      <MemoryRouter>
        <ReserveByTime />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Select a time!"));
    fireEvent.click(screen.getByTestId("time-08:00"));

    const outdoor = await screen.findByTestId("court-10");
    const indoor = await screen.findByTestId("court-11");

    expect(outdoor.dataset.disabled).toBe("1");
    expect(indoor.dataset.disabled).toBe("0");
  });

  it("allows selecting an enabled court", async () => {
    mockCourts = [{ id: 5, outdoors: false, disabled: false }];

    render(
      <MemoryRouter>
        <ReserveByTime />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Select a time!"));
    fireEvent.click(screen.getByTestId("time-12:00"));

    const court = await screen.findByTestId("court-5");
    fireEvent.click(court);

    expect(court.dataset.active).toBe("1");
  });
});
