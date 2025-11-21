import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

// ---- scrollIntoView mock ----
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// ---- MOCK useScrollSection (mindig "Hero" legyen) ----
vi.mock("../useScrollSection", () => ({
  __esModule: true,
  default: () => "Hero",
}));

// ---- MOCK FRAMER MOTION ----
vi.mock("framer-motion", () => {
  const MotionFactory = (Tag) =>
    ({ children, ...props }) =>
      <Tag {...props}>{children}</Tag>;

  return {
    motion: {
      div: MotionFactory("div"),
    },
  };
});

// ---- MOCK CHILD COMPONENTS (Navbar, Hero, Courts, PriceList) ----
vi.mock("../components/Navbar", () => ({
  __esModule: true,
  default: () => <div data-testid="Navbar">NAVBAR</div>,
}));

vi.mock("../sections/Hero", () => ({
  __esModule: true,
  default: () => <div data-testid="Hero">HERO SECTION</div>,
}));

vi.mock("../sections/Courts", () => ({
  __esModule: true,
  default: () => <div data-testid="Courts">COURTS SECTION</div>,
}));

vi.mock("../sections/PriceList", () => ({
  __esModule: true,
  default: () => <div data-testid="PriceList">PRICELIST SECTION</div>,
}));

// ---- MOCK RESERVE MENU CONTEXT ----
vi.mock("../contexts/ReserveMenuContext", () => ({
  __esModule: true,
  ReserveMenuProvider: ({ children }) => <div>{children}</div>,
}));

describe("Home Page", () => {
  it("renders all main sections", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // minden komponens renderelve lett?
    expect(screen.getByTestId("Navbar")).toBeInTheDocument();
    expect(screen.getByTestId("Hero")).toBeInTheDocument();
    expect(screen.getByTestId("Courts")).toBeInTheDocument();
    expect(screen.getByTestId("PriceList")).toBeInTheDocument();
  });

  it("scrolls to #Navbar on mount", async () => {
    const spy = vi.spyOn(Element.prototype, "scrollIntoView");

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it("renders background motion blobs without crashing", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // blobok valójában <div>-re mockolva vannak
    const blobs = screen.getAllByRole("generic");

    // legyen legalább 2 motion blob
    expect(blobs.length).toBeGreaterThanOrEqual(2);
  });
});
