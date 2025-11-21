import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Login from "./Login";
import { MemoryRouter } from "react-router-dom";

// ---- MOCK navigate ----
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ---- MOCK useCurrentUser ----
let mockAuth = false;
vi.mock("../hooks/useCurrentUser", () => ({
  __esModule: true,
  useCurrentUser: () => ({ authenticated: mockAuth }),
}));

// ---- GLOBAL mocks ----
global.fetch = vi.fn();
global.alert = vi.fn();

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = false;
  });

  it("renders login fields", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("name@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Log in")).toBeInTheDocument();
  });

  it("redirects to / when authenticated = true", () => {
    mockAuth = true;

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("typing into inputs works", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "test@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret" },
    });

    expect(screen.getByPlaceholderText("name@example.com").value).toBe("test@mail.com");
    expect(screen.getByPlaceholderText("Password").value).toBe("secret");
  });

  it("successful login navigates to /", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "valid" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "valid" },
    });

    // REAL submit fix – no getByRole("form")!
    const form = container.querySelector("form");
    fireEvent.submit(form);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  it("invalid login shows alert", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "bad" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "bad" },
    });

    const form = container.querySelector("form");
    fireEvent.submit(form);

    await waitFor(() => expect(alert).toHaveBeenCalled());
    expect(alert).toHaveBeenCalledWith("Invalid email or password");
  });

  it("Sign up link navigates to /register", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Sign up"));

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });
});
