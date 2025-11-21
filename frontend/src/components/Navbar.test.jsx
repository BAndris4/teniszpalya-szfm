import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./Navbar";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// -------------------------
// MOCK useNavigate
// -------------------------
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// -------------------------
// MOCK useCurrentUser (paraméterezhető)
// -------------------------
const mockUseCurrentUser = vi.fn();
vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

// -------------------------
// MOCK ReserveMenu Context
// -------------------------
const mockSetReserveVisible = vi.fn();
vi.mock("../contexts/ReserveMenuContext", () => ({
  useReserveMenu: () => ({
    isReserveMenuVisible: false,
    setIsReserveMenuVisible: mockSetReserveVisible,
  }),
}));

// -------------------------
// MOCK AccountDropdown
//  - mindig renderel, csak data-hidden propot változtatjuk
// -------------------------
vi.mock("./AccountDropdown", () => ({
  __esModule: true,
  default: ({ hidden, user }) => (
    <div
      data-testid="account-dropdown"
      data-hidden={hidden ? "true" : "false"}
    >
      MockDropdown for {user?.firstName ?? "guest"}
    </div>
  ),
}));

// -------------------------
// MOCK ReserveMenu
// -------------------------
vi.mock("./ReserveMenu", () => ({
  __esModule: true,
  default: () => <div data-testid="reserve-menu">ReserveMenu</div>,
}));

// scrollIntoView mock
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    mockSetReserveVisible.mockReset();
    mockUseCurrentUser.mockReset();
  });

  // -----------------------------------
  // BASIC RENDER – authenticated user
  // -----------------------------------
  test("renders all navbar menu items when authenticated", () => {
    mockUseCurrentUser.mockReturnValue({
      authenticated: true,
      user: { firstName: "Test", lastName: "User", roleID: 1 },
    });

    renderNavbar();

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Courts")).toBeInTheDocument();
    expect(screen.getByText("Price List")).toBeInTheDocument();
    expect(screen.getByText("Tournaments")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Reserve")).toBeInTheDocument();

    // authenticated esetben legyen account dropdown komponens
    expect(screen.getByTestId("account-dropdown")).toBeInTheDocument();
    expect(screen.queryByText("Login")).toBeNull();
  });

  // -----------------------------------
  // NAVIGATION
  // -----------------------------------
  test("clicking Tournaments navigates to /tournaments", () => {
    mockUseCurrentUser.mockReturnValue({
      authenticated: true,
      user: { firstName: "Test", lastName: "User", roleID: 1 },
    });

    renderNavbar();

    fireEvent.click(screen.getByText("Tournaments"));
    expect(mockedNavigate).toHaveBeenCalledWith("/tournaments");
  });

  test("clicking Contact navigates to /contact", () => {
    mockUseCurrentUser.mockReturnValue({
      authenticated: true,
      user: { firstName: "Test", lastName: "User", roleID: 1 },
    });

    renderNavbar();

    fireEvent.click(screen.getByText("Contact"));
    expect(mockedNavigate).toHaveBeenCalledWith("/contact");
  });

  // -----------------------------------
  // RESERVE BUTTON → context hívás
  // -----------------------------------
  test("clicking Reserve calls setIsReserveMenuVisible(true)", () => {
    mockUseCurrentUser.mockReturnValue({
      authenticated: true,
      user: { firstName: "Test", lastName: "User", roleID: 1 },
    });

    renderNavbar();

    fireEvent.click(screen.getByText("Reserve"));
    expect(mockSetReserveVisible).toHaveBeenCalledWith(true);
  });

  // -----------------------------------
  // NOT AUTHENTICATED → Login gomb
  // -----------------------------------
  test("shows Login button when not authenticated", () => {
    mockUseCurrentUser.mockReturnValue({
      authenticated: false,
      user: null,
    });

    renderNavbar();

    expect(screen.getByText("Login")).toBeInTheDocument();
    
    expect(screen.queryByTestId("account-dropdown")).toBeNull();
  });
});
