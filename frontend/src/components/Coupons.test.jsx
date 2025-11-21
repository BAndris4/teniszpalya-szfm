import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Coupons from "./Coupons";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// ---- MOCK NAVIGATE ----
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockedNavigate };
});

// ---- MOCK FETCH ----
global.fetch = vi.fn();

// Helper: render with router
function renderCoupons() {
  return render(
    <MemoryRouter>
      <Coupons />
    </MemoryRouter>
  );
}

describe("Coupons component", () => {

  beforeEach(() => {
    mockedNavigate.mockClear();
    fetch.mockReset();
  });

  // ------------------------
  // 1. LOADING STATE
  // ------------------------
  test("shows loading state initially", () => {
    fetch.mockReturnValue(
      new Promise(() => {}) // pending fetch → loading state
    );

    renderCoupons();

    expect(screen.getByText("Loading your coupons...")).toBeInTheDocument();
  });

  // ------------------------
  // 2. API ERROR
  // ------------------------
  test("shows error when fetch fails", async () => {
    fetch.mockResolvedValue({
      ok: false,
    });

    renderCoupons();

    await waitFor(() => {
      expect(screen.getByText("Could not load coupons.")).toBeInTheDocument();
    });
  });

  // ------------------------
  // 3. EMPTY COUPON LIST
  // ------------------------
  test("shows empty state when user has no coupons", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderCoupons();

    await waitFor(() => {
      expect(screen.getByText("No coupons yet")).toBeInTheDocument();
    });
  });

  // ------------------------
  // 4. EMPTY STATE → NAVIGATE
  // ------------------------
  test("navigates to /minigame when clicking empty-state button", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderCoupons();

    await waitFor(() =>
      expect(screen.getByText("No coupons yet")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("🎾 Play mini game & win a coupon"));

    expect(mockedNavigate).toHaveBeenCalledWith("/minigame");
  });

  // ------------------------
  // 5. COUPON LIST RENDERS
  // ------------------------
  test("renders coupon cards when user has coupons", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: 1, code: "ABC123", used: false },
          { id: 2, code: "XYZ999", used: true },
        ]),
    });

    renderCoupons();

    await waitFor(() => {
      expect(screen.getByText("ABC123")).toBeInTheDocument();
      expect(screen.getByText("XYZ999")).toBeInTheDocument();
    });
  });

  // ------------------------
  // 6. ACTIVE / USED BADGES
  // ------------------------
  test("shows Active and Used badges correctly", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: 1, code: "ACTIVE1", used: false },
          { id: 2, code: "USED22", used: true },
        ]),
    });

    renderCoupons();

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Used")).toBeInTheDocument();
    });
  });

  // ------------------------
  // 7. PLAY MINIGAME BUTTON WHEN COUPONS EXIST
  // ------------------------
  test("play mini game button navigates in non-empty state", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1, code: "A1", used: false }]),
    });

    renderCoupons();

    await waitFor(() =>
      expect(screen.getByText("A1")).toBeInTheDocument()
    );

    fireEvent.click(
      screen.getByText("🎾 Play mini game and earn a new coupon")
    );

    expect(mockedNavigate).toHaveBeenCalledWith("/minigame");
  });

});