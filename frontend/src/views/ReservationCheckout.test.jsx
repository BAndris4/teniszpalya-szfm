// src/pages/ReservationCheckout.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ReservationCheckout from "./ReservationCheckout";

// ---------- MOCK STATEK ----------

let mockLocationState = null;
let mockAuthenticated = true;
const mockNavigate = vi.fn();

// ---------- react-router-dom MOCK ----------

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: mockLocationState,
    }),
  };
});

// ---------- useCurrentUser MOCK ----------

vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    authenticated: mockAuthenticated,
  }),
}));

// ---------- usePrice MOCK ----------

const getPriceMock = vi.fn();

vi.mock("../hooks/usePrice", () => ({
  __esModule: true,
  default: () => ({
    getPrice: getPriceMock,
  }),
}));

// ---------- Egyéb komponensek MOCK ----------

vi.mock("../components/Navbar", () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">NAVBAR</div>,
}));

vi.mock("../contexts/ReserveMenuContext", () => ({
  __esModule: true,
  ReserveMenuProvider: ({ children }) => (
    <div data-testid="reserve-provider">{children}</div>
  ),
}));

vi.mock("../components/ConfirmResponsePopup", () => ({
  __esModule: true,
  default: ({ title, onCancel }) => (
    <div data-testid="confirm-popup">
      <span>{title}</span>
      <button onClick={onCancel}>close</button>
    </div>
  ),
}));

// ---------- HELPER ADATOK ----------

const baseReservation = {
  createdAt: "2025-06-15T08:00:00.000Z",
  reservedAt: "2025-06-15T09:00:00.000Z", // délelőtt → morning
  hours: 2,
  courtID: 5,
};

const baseMeta = {
  label: "Center Court",
  court: {
    outdoors: true,
  },
};

// ---------- GLOBAL FETCH MOCK ----------

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();
  mockLocationState = null;
  mockAuthenticated = true;

  getPriceMock.mockImplementation(({ morning }) =>
    morning ? 1000 : 2000
  );

  global.fetch = vi.fn((url, options = {}) => {
    // kuponok lekérdezése
    if (url.includes("/api/coupon/my")) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          { id: 1, code: "DISCOUNT20", used: false },
          { id: 2, code: "USED", used: true },
        ],
      });
    }

    // foglalás létrehozása
    if (url.includes("/api/Reservations")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ reservationId: 123 }),
      });
    }

    return Promise.reject(new Error(`Unknown url: ${url}`));
  });
});

// ---------- TESZTEK ----------

describe("ReservationCheckout page", () => {
  it("redirects to /login when user is not authenticated", async () => {
    mockAuthenticated = false;
    mockLocationState = { reservation: baseReservation, meta: baseMeta };

    render(
      <MemoryRouter>
        <ReservationCheckout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("shows error and disables confirm button when there is no reservation data", async () => {
    mockLocationState = null;

    render(
      <MemoryRouter>
        <ReservationCheckout />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        /No reservation data\. Please select a time and court again\./i
      )
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", {
      name: /confirm reservation/i,
    });
    expect(confirmBtn).toBeDisabled();
  });

  it("renders reservation summary and calculates base price", async () => {
  mockLocationState = { reservation: baseReservation, meta: baseMeta };

  render(
    <MemoryRouter>
      <ReservationCheckout />
    </MemoryRouter>
  );

  await screen.findByText(/Reservation overview/i);

  // morning 1h × 1000 Ft
  expect(
    screen.getByText((content) =>
      content.includes("Morning") &&
      content.includes("1") &&
      content.includes("1000")
    )
  ).toBeInTheDocument();

  // afternoon 1h × 2000 Ft
  expect(
    screen.getByText((content) =>
      content.includes("Afternoon") &&
      content.includes("1") &&
      content.includes("2000")
    )
  ).toBeInTheDocument();

  // total = 1000 + 2000 = 3000
  const totalRow = screen.getByText("Total").parentElement;
  expect(totalRow).toHaveTextContent("3000");
});

it("applies a valid coupon and reduces the total price by 20%", async () => {
  mockLocationState = { reservation: baseReservation, meta: baseMeta };

  render(
    <MemoryRouter>
      <ReservationCheckout />
    </MemoryRouter>
  );

  await screen.findByText(/Reservation overview/i);

  fireEvent.change(screen.getByPlaceholderText("ABC123"), {
    target: { value: "DISCOUNT20" },
  });

  fireEvent.click(screen.getByText(/Apply/i));

  await screen.findByText(/Coupon accepted/i);

  const totalRow = screen.getByText("Total").parentElement;

  expect(totalRow).toHaveTextContent("2400");
});

it("shows invalid coupon and total stays unchanged", async () => {
  mockLocationState = { reservation: baseReservation, meta: baseMeta };

  render(
    <MemoryRouter>
      <ReservationCheckout />
    </MemoryRouter>
  );

  await screen.findByText(/Reservation overview/i);

  fireEvent.change(screen.getByPlaceholderText("ABC123"), {
    target: { value: "WRONG" },
  });

  fireEvent.click(screen.getByText(/Apply/i));

  await screen.findByText(/Invalid coupon/i);

  const totalRow = screen.getByText("Total").parentElement;

  expect(totalRow).toHaveTextContent("3000");
});

  it("toggles student reservation and shows info message", async () => {
    mockLocationState = { reservation: baseReservation, meta: baseMeta };

    render(
      <MemoryRouter>
        <ReservationCheckout />
      </MemoryRouter>
    );

    await screen.findByText(/Reservation overview/i);

    const toggle = screen.getByLabelText("Toggle student reservation");
    fireEvent.click(toggle);

    expect(
      await screen.findByText(/Student discount is applied to your price./i)
    ).toBeInTheDocument();
  });

  it("submits reservation, shows success popup and navigates home on close", async () => {
    mockLocationState = { reservation: baseReservation, meta: baseMeta };

    const reservationPostSpy = vi.fn();

    // speciális fetch mock ehhez a teszthez
    global.fetch = vi.fn((url, options = {}) => {
      if (url.includes("/api/coupon/my")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, code: "DISCOUNT20", used: false },
          ],
        });
      }
      if (url.includes("/api/Reservations")) {
        reservationPostSpy(JSON.parse(options.body));
        return Promise.resolve({
          ok: true,
          json: async () => ({ reservationId: 123 }),
        });
      }
      return Promise.reject(new Error(`Unknown url: ${url}`));
    });

    render(
      <MemoryRouter>
        <ReservationCheckout />
      </MemoryRouter>
    );

    const confirmBtn = await screen.findByRole("button", {
      name: /confirm reservation/i,
    });
    fireEvent.click(confirmBtn);

    // várjuk a popupot
    const popup = await screen.findByTestId("confirm-popup");
    expect(popup).toBeInTheDocument();

    // ellenőrizzük, hogy a foglalás POST payloadja jó
    expect(reservationPostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: baseReservation.createdAt,
        reservedAt: baseReservation.reservedAt,
        hours: baseReservation.hours,
        courtID: baseReservation.courtID,
      })
    );

    // popup "close" → navigate("/")
    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
