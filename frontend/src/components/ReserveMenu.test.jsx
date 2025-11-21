import { render, screen, fireEvent } from "@testing-library/react";
import ReserveMenu from "./ReserveMenu";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

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
// MOCK useReserveMenu
// -----------------------------------------------------
const mockSetVisible = vi.fn();
vi.mock("../contexts/ReserveMenuContext", () => ({
  useReserveMenu: () => ({
    isReserveMenuVisible: true,
    setIsReserveMenuVisible: mockSetVisible,
  }),
}));

// -----------------------------------------------------
// MOCK useCurrentUser
// -----------------------------------------------------
const mockUseCurrentUser = vi.fn();
vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

// -----------------------------------------------------
function renderMenu() {
  return render(
    <MemoryRouter>
      <ReserveMenu />
    </MemoryRouter>
  );
}

describe("ReserveMenu", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSetVisible.mockReset();
    mockUseCurrentUser.mockReset();
  });

    // -----------------------------------------------------
    // 1) RENDER - visible állapot
    // -----------------------------------------------------
    test("renders menu when visible", () => {
    mockUseCurrentUser.mockReturnValue({ authenticated: true });

    renderMenu();

    // két reserve gomb
    expect(screen.getAllByText("Reserve").length).toBe(2);

    // overlay container (selectorrel)
    const container = document.querySelector(".fixed.w-full.h-full");
    expect(container).not.toBeNull();
    expect(container.className).toContain("opacity-100");
    expect(container.className).toContain("pointer-events-auto");
    });

    // -----------------------------------------------------
    // 2) Close button → setIsReserveMenuVisible(false)
    // -----------------------------------------------------
    test("close button hides menu", () => {
    mockUseCurrentUser.mockReturnValue({ authenticated: true });

    renderMenu();

    // close button belsejében lévő ikon
    const closeIcon = screen.getByAltText(""); 
    fireEvent.click(closeIcon.parentElement);

    expect(mockSetVisible).toHaveBeenCalledWith(false);
    });


  // -----------------------------------------------------
  // 3) Reserve by Courts → authenticated → navigate to /reserveByCourt
  // -----------------------------------------------------
  test("Reserve by Courts navigates to correct route when authenticated", () => {
    mockUseCurrentUser.mockReturnValue({ authenticated: true });

    renderMenu();

    const btn = screen.getAllByText("Reserve")[0]; // első: courts

    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/reserveByCourt");
  });

  // -----------------------------------------------------
  // 4) Reserve by Courts → NOT authenticated → navigate to /login
  // -----------------------------------------------------
  test("Reserve by Courts redirects to login when not authenticated", () => {
    mockUseCurrentUser.mockReturnValue({ authenticated: false });

    renderMenu();

    const btn = screen.getAllByText("Reserve")[0];

    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // -----------------------------------------------------
  // 5) Reserve by Time → authenticated → navigate to /reserveByTime
  // -----------------------------------------------------
  test("Reserve by Time navigates correctly when authenticated", () => {
    mockUseCurrentUser.mockReturnValue({ authenticated: true });

    renderMenu();

    const btn = screen.getAllByText("Reserve")[1]; // második: time

    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/reserveByTime");
  });

  // -----------------------------------------------------
  // 6) Reserve by Time → NOT authenticated → login
  // -----------------------------------------------------
  test("Reserve by Time redirects to login when not authenticated", () => {
    mockUseCurrentUser.mockReturnValue({ authenticated: false });

    renderMenu();

    const btn = screen.getAllByText("Reserve")[1];

    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});