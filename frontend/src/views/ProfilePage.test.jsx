import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ProfilePage from "./ProfilePage";
import { MemoryRouter } from "react-router-dom";

// -------------------- MOCK LOCATION & NAVIGATE --------------------
let mockLocationSearch = "";
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      search: mockLocationSearch,
    }),
  };
});

// -------------------- MOCK USER --------------------
let mockAuthenticated = false;
let mockUser = null;

vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    authenticated: mockAuthenticated,
    user: mockUser,
  }),
}));

// -------------------- MOCK CHILD COMPONENTS --------------------
vi.mock("../components/ProfileSettings", () => ({
  default: () => <div data-testid="settings-page">SETTINGS</div>,
}));

vi.mock("../components/History", () => ({
  default: () => <div data-testid="history-page">HISTORY</div>,
}));

vi.mock("../components/Coupons", () => ({
  default: () => <div data-testid="coupons-page">COUPONS</div>,
}));

// ---------------------------------------------------------------------

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticated = false;
    mockUser = null;
    mockLocationSearch = "";
  });

  it("redirects to /login when not authenticated", () => {
    mockAuthenticated = false;

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows user first name when authenticated", async () => {
    mockAuthenticated = true;
    mockUser = {
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      phoneNumber: "+123",
    };

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Welcome, John/)).toBeInTheDocument();
  });

  it("renders settings tab by default", async () => {
    mockAuthenticated = true;
    mockUser = {
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      phoneNumber: "+123",
    };

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId("settings-page")).toBeInTheDocument();
  });

  it("switches to history tab when clicking", async () => {
    mockAuthenticated = true;
    mockUser = {
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      phoneNumber: "+123",
    };

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <ProfilePage />
      </MemoryRouter>
    );

    const historyTab = (await screen.findAllByText("History"))[0];
    fireEvent.click(historyTab);

    expect(mockNavigate).toHaveBeenCalledWith("/profile?tab=history");
  });

  it("loads history tab when ?tab=history", async () => {
    mockAuthenticated = true;
    mockUser = {
      firstName: "Bob",
      lastName: "X",
      email: "xx",
      phoneNumber: "yy",
    };

    mockLocationSearch = "?tab=history";

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId("history-page")).toBeInTheDocument();
  });

});
