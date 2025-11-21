import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReservationsTab from "./ReservationsTab";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// -----------------------------------------------------
// MOCK navigate
// -----------------------------------------------------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// -----------------------------------------------------
// MOCK useCurrentUser
// -----------------------------------------------------
const mockUseCurrentUser = vi.fn();
vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

// -----------------------------------------------------
// MOCK ConfirmResponsePopup
// -----------------------------------------------------
vi.mock("./ConfirmResponsePopup", () => ({
  __esModule: true,
  default: ({ title, onConfirm, onCancel }) => (
    <div data-testid="confirm-popup">
      <div>{title}</div>
      <button data-testid="confirm-yes" onClick={onConfirm}>YES</button>
      <button data-testid="confirm-no" onClick={onCancel}>NO</button>
    </div>
  ),
}));

// -----------------------------------------------------
// MOCK fetch
// -----------------------------------------------------
global.fetch = vi.fn();

function renderReservationsTab() {
  return render(
    <MemoryRouter>
      <ReservationsTab />
    </MemoryRouter>
  );
}

describe("ReservationsTab", () => {

  beforeEach(() => {
    mockNavigate.mockReset();
    fetch.mockReset();
    mockUseCurrentUser.mockReturnValue({
      authenticated: true,
      user: { id: 10, roleID: 2 },
    });
  });

  // -----------------------------------------------------
  // 1) LOADING + FETCH + RENDER
  // -----------------------------------------------------
  test("loads reservations and users then renders table", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, userID: 10, courtID: 2, hours: 1, reservedAt: Date.now(), createdAt: Date.now() },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 10, firstName: "John", lastName: "Doe", email: "john@doe.com" },
        ],
      });

    renderReservationsTab();

    // loading
    expect(screen.getByText("Loading reservations…")).toBeInTheDocument();

    // table megjelenik
    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    );
  });

  // -----------------------------------------------------
  // 2) DELETE gomb megnyitja a confirm popupot
  // -----------------------------------------------------
  test("delete button opens confirm popup", async () => {
    const now = Date.now();

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, userID: 10, courtID: 2, hours: 1, reservedAt: now, createdAt: now },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 10, firstName: "John", lastName: "Doe", email: "john@doe.com" },
        ],
      });

    renderReservationsTab();

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.click(screen.getByText("Delete"));

    expect(screen.getByTestId("confirm-popup")).toBeInTheDocument();
  });

  // -----------------------------------------------------
  // 3) Confirm törlés → DELETE fetch hívás → modál bezárul
  // -----------------------------------------------------
  test("confirm delete sends DELETE request and shows success popup", async () => {
    const now = Date.now();

    // 1. load reservations + users
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, userID: 10, courtID: 2, hours: 1, reservedAt: now, createdAt: now },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 10, firstName: "John", lastName: "Doe", email: "john@doe.com" },
        ],
      })
      // 2. delete request
      .mockResolvedValueOnce({ ok: true });

    renderReservationsTab();

    // wait for rows
    await waitFor(() => screen.getByText("John Doe"));

    // delete
    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByTestId("confirm-popup")).toBeInTheDocument();

    // confirm
    fireEvent.click(screen.getByTestId("confirm-yes"));

    await waitFor(() =>
      expect(fetch).toHaveBeenLastCalledWith(
        "http://localhost:5044/api/Reservations/1",
        expect.objectContaining({
          method: "DELETE",
        })
      )
    );

    // success popup renderel
    await waitFor(() =>
      expect(screen.getByText("Deleted")).toBeInTheDocument()
    );
  });

  // -----------------------------------------------------
  // 4) Cancel delete bezárja popupot
  // -----------------------------------------------------
  test("cancel delete closes confirm popup", async () => {
    const now = Date.now();

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, userID: 10, courtID: 2, hours: 1, reservedAt: now, createdAt: now },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 10, firstName: "John", lastName: "Doe", email: "john@doe.com" },
        ],
      });

    renderReservationsTab();

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.click(screen.getByText("Delete"));

    fireEvent.click(screen.getByTestId("confirm-no"));

    await waitFor(() =>
      expect(screen.queryByTestId("confirm-popup")).toBeNull()
    );
  });
});
