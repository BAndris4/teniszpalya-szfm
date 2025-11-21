import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AccountDropdown from "./AccountDropdown";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const mockedNavigate = vi.fn();

// 🔥 Partial mock – helyes megoldás!
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// 🔥 Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

function renderDropdown(props = {}) {
  return render(
    <MemoryRouter>
      <AccountDropdown hidden={false} user={{ roleID: 1 }} {...props} />
    </MemoryRouter>
  );
}

describe("AccountDropdown", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    global.fetch.mockClear();
  });

  test("renders menu items", () => {
    renderDropdown();

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Coupons")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("navigates correctly when clicking menu items", () => {
    renderDropdown();

    fireEvent.click(screen.getByText("Settings"));
    expect(mockedNavigate).toHaveBeenCalledWith("/profile?tab=settings");

    fireEvent.click(screen.getByText("History"));
    expect(mockedNavigate).toHaveBeenCalledWith("/profile?tab=history");

    fireEvent.click(screen.getByText("Coupons"));
    expect(mockedNavigate).toHaveBeenCalledWith("/profile?tab=coupons");
  });

  test("admin menu appears only for admins", () => {
    renderDropdown({ user: { roleID: 2 } });
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  test("admin menu is hidden for non-admin users", () => {
    renderDropdown({ user: { roleID: 1 } });
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  test("logout triggers fetch and navigate(0)", async () => {
    renderDropdown();

    fireEvent.click(screen.getByText("Logout"));

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5044/api/auth/logout",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(0);
    });
  });
});
