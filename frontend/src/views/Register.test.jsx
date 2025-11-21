import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Register from "./Register";
import { MemoryRouter } from "react-router-dom";

// -------------------- MOCK FETCH --------------------
global.fetch = vi.fn();

// -------------------- MOCK NAVIGATE --------------------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// -------------------- MOCK AUTH --------------------
let mockAuthenticated = false;
vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    authenticated: mockAuthenticated,
  }),
}));

// ----------------------------------------------------

describe("Register page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticated = false;
  });

  // ----------------------------------------------------
  it("redirects to home if user is already authenticated", () => {
    mockAuthenticated = true;

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // ----------------------------------------------------
  it("toggles password visibility when clicking the eye icon", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const toggleButton = screen.getByLabelText("Show password");

    // alapból password
    expect(passwordInput.type).toBe("password");

    fireEvent.click(toggleButton);

    // szöveg legyen
    expect(passwordInput.type).toBe("text");
  });

  // ----------------------------------------------------
  it("shows validation errors for invalid inputs", async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("John"), {
      target: { value: "123" },
    });

    fireEvent.change(screen.getByPlaceholderText("Carter"), {
      target: { value: "987" },
    });

    fireEvent.change(screen.getByPlaceholderText("+36201234567"), {
      target: { value: "INVALID" },
    });

    fireEvent.change(screen.getByPlaceholderText("user@example.com"), {
      target: { value: "bademail" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "short" },
    });

    fireEvent.click(screen.getByDisplayValue("Sign up"));

    expect(await screen.findByText("First name can only contain letters")).toBeInTheDocument();
    expect(screen.getByText("Last name can only contain letters")).toBeInTheDocument();
    expect(
      screen.getByText("Phone number must contain only digits and may contain a leading '+'")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a valid email address (e.g., user@example.com)")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Password must be at least 8 characters and include uppercase, lowercase and number"
      )
    ).toBeInTheDocument();
  });

  // ----------------------------------------------------
  it("submits valid data → calls register → calls login → navigates home", async () => {
    mockAuthenticated = false;

    // mock register, login
    fetch.mockResolvedValueOnce({ ok: true });
    fetch.mockResolvedValueOnce({ ok: true });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("John"), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByPlaceholderText("Carter"), {
      target: { value: "Doe" },
    });

    fireEvent.change(screen.getByPlaceholderText("+36201234567"), {
      target: { value: "+36201234567" },
    });

    fireEvent.change(screen.getByPlaceholderText("user@example.com"), {
      target: { value: "john@doe.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "Password1" },
    });

    fireEvent.click(screen.getByDisplayValue("Sign up"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    // register endpoint
    expect(fetch.mock.calls[0][0]).toBe("http://localhost:5044/api/auth/register");

    // login endpoint
    expect(fetch.mock.calls[1][0]).toBe("http://localhost:5044/api/auth/login");

    // redirect home
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
