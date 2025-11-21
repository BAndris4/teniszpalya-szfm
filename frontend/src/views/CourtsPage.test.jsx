import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CourtsPage from "./CourtsPage";

// ---- globális mock setup ----
beforeAll(() => {
  // scrollIntoView stub (különben crash)
  Element.prototype.scrollIntoView = vi.fn();
});

// ---- MOCK NAV + LOC ----
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: "" }),
  };
});

// ---- MOCK FRAMER-MOTION (egyszerű HTML-elemekre) ----
vi.mock("framer-motion", () => {
  const MotionFactory = (Tag) =>
    ({ children, ...props }) =>
      <Tag {...props}>{children}</Tag>;
  return {
    motion: {
      div: MotionFactory("div"),
      img: MotionFactory("img"),
      h1: MotionFactory("h1"),
      h2: MotionFactory("h2"),
      p: MotionFactory("p"),
      span: MotionFactory("span"),
      button: MotionFactory("button"),
      select: MotionFactory("select"),
    },
  };
});

// ---- MOCK FETCH ----
const mockCourts = [
  { id: 1, material: "Clay", outdoors: true },
  { id: 2, material: "Grass", outdoors: false },
  { id: 3, material: "Hard", outdoors: true },
];
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockCourts),
  })
);

// ---- Helper ----
const getRenderedTitles = () =>
  screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent.trim());

describe("CourtsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders courts from API", async () => {
    render(
      <MemoryRouter>
        <CourtsPage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Tennis court #1")).toBeInTheDocument()
    );

    const titles = getRenderedTitles();
    expect(titles).toEqual([
      "Tennis court #1",
      "Tennis court #2",
      "Tennis court #3",
    ]);
  });

  it("filters by type (material)", async () => {
    render(
      <MemoryRouter>
        <CourtsPage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Tennis court #1")).toBeInTheDocument()
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "Clay" } });

    const titles = getRenderedTitles();
    expect(titles).toEqual(["Tennis court #1"]);
  });

  it("filters by location (indoor/outdoor)", async () => {
    render(
      <MemoryRouter>
        <CourtsPage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Tennis court #1")).toBeInTheDocument()
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "Indoor" } });

    const titles = getRenderedTitles();
    expect(titles).toEqual(["Tennis court #2"]);
  });

  it("sorts by type A→Z", async () => {
    render(
      <MemoryRouter>
        <CourtsPage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Tennis court #1")).toBeInTheDocument()
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[2], { target: { value: "type-asc" } });

    const titles = getRenderedTitles();
    expect(titles).toEqual([
      "Tennis court #1",
      "Tennis court #2",
      "Tennis court #3",
    ]);
  });

  it("back to home navigates correctly", async () => {
    render(
      <MemoryRouter>
        <CourtsPage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Tennis court #1")).toBeInTheDocument()
    );

    const btn = screen.getByText(/Back to home/i);
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});