import { render, screen, fireEvent } from "@testing-library/react";
import AdminTopbar from "./AdminTopbar";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const mockedNavigate = vi.fn();

// 🔥 Partial mock, csak useNavigate-et írjuk felül
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("AdminTopbar", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  function renderTopbar(activeTab = "reservations", onTabChange = vi.fn()) {
    return render(
      <MemoryRouter>
        <AdminTopbar activeTab={activeTab} onTabChange={onTabChange} />
      </MemoryRouter>
    );
  }

  test("renders header texts", () => {
    renderTopbar();

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Teniszpálya – Control Panel")).toBeInTheDocument();
    expect(screen.getByText("Reservations")).toBeInTheDocument();
    expect(screen.getByText("Courts")).toBeInTheDocument();
    expect(screen.getByText("Back to site")).toBeInTheDocument();
  });

  test("calls onTabChange with 'reservations' and 'courts'", () => {
    const mockHandler = vi.fn();
    renderTopbar("reservations", mockHandler);

    fireEvent.click(screen.getByText("Reservations"));
    expect(mockHandler).toHaveBeenCalledWith("reservations");

    fireEvent.click(screen.getByText("Courts"));
    expect(mockHandler).toHaveBeenCalledWith("courts");
  });

  test("highlights active tab", () => {
    renderTopbar("courts");

    const courtsBtn = screen.getByText("Courts");
    const reservationsBtn = screen.getByText("Reservations");

    // active button should have dark-green background
    expect(courtsBtn.className).toContain("bg-dark-green");
    expect(courtsBtn.className).toContain("text-white");

    // non-active should NOT have these classes
    expect(reservationsBtn.className).not.toContain("bg-dark-green ");
  });

  test("Back to site triggers navigate('/')", () => {
    renderTopbar();

    fireEvent.click(screen.getByText("Back to site"));
    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });
});
