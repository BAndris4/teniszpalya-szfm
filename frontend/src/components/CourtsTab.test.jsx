import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CourtsTab from "./CourtsTab";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// ---- MOCK NAVIGATE ----
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// ---- MOCK useCurrentUser ----
const mockUseCurrentUser = vi.fn();
vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

// ---- MOCK ConfirmResponsePopup ----
// ---- MOCK ConfirmResponsePopup ----
vi.mock("./ConfirmResponsePopup", () => ({
  __esModule: true,
  default: ({
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  }) => (
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}

      {onConfirm && (
        <button
          data-testid="confirm-delete"
          onClick={onConfirm}
        >
          {confirmText || "Confirm"}
        </button>
      )}

      {onCancel && (
        <button
          data-testid="close-popup"
          onClick={onCancel}
        >
          {cancelText || "Close"}
        </button>
      )}
    </div>
  ),
}));


// ---- GLOBAL FETCH MOCK ----
global.fetch = vi.fn();

// scrollIntoView mock
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}
window.scrollTo = window.scrollTo || vi.fn();

// Helper
function renderCourtsTab({ authenticated = true, roleID = 2 } = {}) {
  mockUseCurrentUser.mockReturnValue({
    authenticated,
    user: roleID != null ? { roleID } : null,
  });

  return render(
    <MemoryRouter>
      <CourtsTab />
    </MemoryRouter>
  );
}

describe("CourtsTab – full integration", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    fetch.mockReset();
  });

  // -----------------------------------
  // AUTH GUARD
  // -----------------------------------
  test("redirects to /login when not authenticated", async () => {
    renderCourtsTab({ authenticated: false, roleID: null });
    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });

  test("redirects to / when user is not admin", async () => {
    renderCourtsTab({ authenticated: true, roleID: 1 });
    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });

  // -----------------------------------
  // LOADING + LIST
  // -----------------------------------
  test("loads courts and renders list", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 2, outdoors: true, material: "Grass" },
        { id: 1, outdoors: false, material: "Clay" },
      ],
    });

    renderCourtsTab();

    expect(screen.getByText("Loading courts…")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Court #1")).toBeInTheDocument();
      expect(screen.getByText("Court #2")).toBeInTheDocument();
    });
  });

  test("shows error message when load fails", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    renderCourtsTab();

    await waitFor(() => {
      expect(screen.getByText("Courts error 500")).toBeInTheDocument();
    });
  });

  test("shows empty state when no courts", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderCourtsTab();

    await waitFor(() => {
      expect(
        screen.getByText('No courts found. Click “Add New Court”.')
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------
  // CREATE PANEL
  // -----------------------------------
  test("clicking Add New Court opens create panel", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderCourtsTab();

    await waitFor(() =>
      screen.getByText('No courts found. Click “Add New Court”.')
    );

    fireEvent.click(screen.getByText("Add New Court"));

    expect(screen.getByText("Create Court")).toBeInTheDocument();

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");

    const clayBtn = screen.getByRole("button", { name: "Clay" });
    expect(clayBtn.className).toContain("bg-dark-green");
  });

  test("toggle and material buttons work", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderCourtsTab();

    await waitFor(() =>
      screen.getByText('No courts found. Click “Add New Court”.')
    );

    fireEvent.click(screen.getByText("Add New Court"));

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");

    const grassBtn = screen.getByRole("button", { name: "Grass" });
    fireEvent.click(grassBtn);
    expect(grassBtn.className).toContain("bg-dark-green");
  });

  // -----------------------------------
  // CREATE FLOW
  // -----------------------------------
  test("create flow works and triggers reload", async () => {
    // GET → []
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    // POST
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderCourtsTab();

    await waitFor(() =>
      screen.getByText('No courts found. Click “Add New Court”.')
    );

    fireEvent.click(screen.getByText("Add New Court"));

    const hardBtn = screen.getByRole("button", { name: "Hard" });
    fireEvent.click(hardBtn);

    const createBtn = screen.getByTitle("Create court");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("Created")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Close"));

    expect(mockedNavigate).toHaveBeenCalledWith(0);
  });

  // -----------------------------------
  // UPDATE FLOW
  // -----------------------------------
  test("update flow works", async () => {
    // GET
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 5, outdoors: true, material: "Clay" }],
    });
    // PUT update
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderCourtsTab();

    await waitFor(() => {
      expect(screen.getByText("Court #5")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByText("Edit Court #5")).toBeInTheDocument();

    const hardBtn = screen.getByRole("button", { name: "Hard" });
    fireEvent.click(hardBtn);

    const saveBtn = screen.getByTitle("Save changes");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("Updated")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Close"));
    expect(mockedNavigate).toHaveBeenCalledWith(0);
  });

  // -----------------------------------
  // DELETE FLOW (fixed)
  // -----------------------------------
  test("delete flow: confirm popup, DELETE, remove from list, success popup (no reload)", async () => {
    // GET
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 10, outdoors: true, material: "Clay" },
        { id: 11, outdoors: false, material: "Grass" },
      ],
    });
    // DELETE
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderCourtsTab();

    await waitFor(() => {
      expect(screen.getByText("Court #10")).toBeInTheDocument();
      expect(screen.getByText("Court #11")).toBeInTheDocument();
    });

    // The Delete buttons in the list
    const deleteButtons = screen.getAllByTitle("Delete court");
    fireEvent.click(deleteButtons[0]); // Click first court delete

    await waitFor(() => {
      expect(screen.getByText("Delete Court")).toBeInTheDocument();
    });

    // Popup Confirm Delete button
    // Confirm popup delete
    const confirmDeleteButton = screen.getByTestId("confirm-delete");
    fireEvent.click(confirmDeleteButton);


    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    // Court #10 eltűnik
    await waitFor(() => {
      expect(screen.queryByText("Court #10")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Deleted")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));

    // Delete success does NOT reload
    expect(mockedNavigate).not.toHaveBeenCalledWith(0);
  });

  // -----------------------------------
  // CANCEL create/edit
  // -----------------------------------
  test("cancel create closes panel", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderCourtsTab();

    await waitFor(() =>
      screen.getByText('No courts found. Click “Add New Court”.')
    );

    fireEvent.click(screen.getByText("Add New Court"));

    expect(screen.getByText("Create Court")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByText("Create Court")).not.toBeInTheDocument();
  });

  test("cancel edit closes panel", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 7, outdoors: true, material: "Clay" }],
    });

    renderCourtsTab();

    await waitFor(() => screen.getByText("Court #7"));

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByText("Edit Court #7")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByText("Edit Court #7")).not.toBeInTheDocument();
  });
});
