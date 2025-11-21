import { render, screen, fireEvent } from "@testing-library/react";
import CourtCardSmall from "./CourtCardSmall";
import { vi } from "vitest";

describe("CourtCardSmall", () => {
  const sampleCourt = {
    id: 3,
    material: "Clay",
    outdoors: true,
  };

  function renderCard(props = {}) {
    const utils = render(<CourtCardSmall court={sampleCourt} onClick={() => {}} {...props} />);
    const card = utils.container.firstChild; // outer card
    return { ...utils, card };
  }

  // -------------------------
  // RENDERING BASIC INFO
  // -------------------------
  test("renders court id, material and type", () => {
    renderCard();

    expect(screen.getByText("Tennis Court #3")).toBeInTheDocument();
    expect(screen.getByText("Clay")).toBeInTheDocument();
    expect(screen.getByText("Outdoor")).toBeInTheDocument();
  });

  // -------------------------
  // CLICK HANDLING
  // -------------------------
  test("calls onClick when card is clicked", () => {
    const onClick = vi.fn();

    render(<CourtCardSmall court={sampleCourt} onClick={onClick} />);

    fireEvent.click(screen.getByText("Tennis Court #3"));
    expect(onClick).toHaveBeenCalled();
  });

  // -------------------------
  // ACTIVE STYLE
  // -------------------------
  test("applies active styles when active=true", () => {
    const { card } = renderCard({ active: true });

    // background dark-green
    expect(card.className).toContain("bg-dark-green");

    // text becomes white
    expect(screen.getByText("Tennis Court #3").className).toContain("text-white");
    expect(screen.getByText("Clay").className).toContain("text-white");
    expect(screen.getByText("Outdoor").className).toContain("text-white");
  });

  // -------------------------
  // INACTIVE STYLE
  // -------------------------
  test("applies default styles when active=false", () => {
    const { card } = renderCard({ active: false });

    expect(card.className).toContain("bg-white");

    expect(screen.getByText("Tennis Court #3").className).toContain("text-dark-green");
    expect(screen.getByText("Clay").className).toContain("text-dark-green-half");
    expect(screen.getByText("Outdoor").className).toContain("text-dark-green-half");
  });
});
