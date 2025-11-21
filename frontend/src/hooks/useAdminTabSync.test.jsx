import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { useAdminTabSync } from "./useAdminTabSync";

// Wrapper component to expose location + hook result
function TestComponent({ defaultTab }) {
  const { activeTab, setActiveTab } = useAdminTabSync(defaultTab);
  const location = useLocation();

  return (
    <div>
      <div data-testid="search">{location.search}</div>
      <div data-testid="activeTab">{activeTab}</div>
      <button onClick={() => setActiveTab("courts")} data-testid="setCourts">
        setCourts
      </button>
      <button onClick={() => setActiveTab("INVALID")} data-testid="setInvalid">
        setInvalid
      </button>
    </div>
  );
}

function renderWithRouter(initialEntries = ["/admin"], defaultTab = "reservations") {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/admin" element={<TestComponent defaultTab={defaultTab} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("useAdminTabSync", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------------
  test("reads active tab from URL (tab=courts)", () => {
    renderWithRouter(["/admin?tab=courts"]);

    expect(screen.getByTestId("activeTab").textContent).toBe("courts");
    expect(screen.getByTestId("search").textContent).toBe("?tab=courts");
  });

  // -------------------------------------------------------
  test("uses localStorage when URL has no tab", () => {
    localStorage.setItem("admin.activeTab", "courts");

    renderWithRouter(["/admin"]);

    expect(screen.getByTestId("activeTab").textContent).toBe("courts");
  });

  // -------------------------------------------------------
  test("falls back to default tab when no URL or LS", () => {
    renderWithRouter(["/admin"], "reservations");

    expect(screen.getByTestId("activeTab").textContent).toBe("reservations");
  });

  // -------------------------------------------------------
  test("sanitize: invalid tab in URL gets ignored", () => {
    localStorage.setItem("admin.activeTab", "courts");

    renderWithRouter(["/admin?tab=INVALID"]);

    expect(screen.getByTestId("activeTab").textContent).toBe("courts");
    expect(screen.getByTestId("search").textContent).toBe("?tab=courts");
  });

  // -------------------------------------------------------
  test("adds ?tab=<value> to URL if missing", () => {
    renderWithRouter(["/admin"], "reservations");

    expect(screen.getByTestId("search").textContent).toBe("?tab=reservations");
  });

  // -------------------------------------------------------
  test("setActiveTab updates both URL and LS", () => {
    renderWithRouter(["/admin?tab=reservations"]);

    act(() => {
      screen.getByTestId("setCourts").click();
    });

    expect(screen.getByTestId("search").textContent).toBe("?tab=courts");
    expect(localStorage.getItem("admin.activeTab")).toBe("courts");
  });

  // -------------------------------------------------------
  test("setActiveTab sanitizes invalid values", () => {
    renderWithRouter(["/admin"], "reservations");

    act(() => {
      screen.getByTestId("setInvalid").click();
    });

    expect(screen.getByTestId("search").textContent).toBe("?tab=reservations");
    expect(localStorage.getItem("admin.activeTab")).toBe("reservations");
  });
});
