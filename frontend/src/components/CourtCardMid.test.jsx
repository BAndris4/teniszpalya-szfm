import { render, screen, fireEvent } from "@testing-library/react";
import CourtCardMid from "./CourtCardMid";
import { vi } from "vitest";

describe("CourtCardMid", () => {
  const sampleCourt = {
    id: 7,
    material: "Clay",
    outdoors: true,
    disabled: false,
  };

  function renderCard(props = {}) {
    const utils = render(<CourtCardMid court={sampleCourt} onClick={() => {}} {...props} />);
    const card = utils.container.firstChild; // OUTER CARD
    return { ...utils, card };
  }

  // -------------------------
  // RENDERING BASIC INFO
  // -------------------------
  test("renders court id, material and type", () => {
    renderCard();

    expect(screen.getByText("Tennis Court #7")).toBeInTheDocument();
    expect(screen.getByText("Clay")).toBeInTheDocument();
    expect(screen.getByText("Outdoor")).toBeInTheDocument();
  });

  // -------------------------
  // CLICK HANDLING
  // -------------------------
  test("calls onClick when clicked (not disabled)", () => {
    const onClick = vi.fn();
    renderCard({ onClick });

    fireEvent.click(screen.getByText("Tennis Court #7"));
    expect(onClick).toHaveBeenCalled();
  });

  // -------------------------
  // ACTIVE STYLE
  // -------------------------
  test("applies active styles when active=true", () => {
    const { card } = renderCard({ active: true });

    expect(card.className).toContain("bg-dark-green");

    expect(screen.getByText("Tennis Court #7").className).toContain("text-white");
    expect(screen.getByText("Clay").className).toContain("text-white");
    expect(screen.getByText("Outdoor").className).toContain("text-white");
  });

  // -------------------------
  // INACTIVE STYLE
  // -------------------------
  test("inactive cards display default colors", () => {
    const { card } = renderCard({ active: false });

    expect(card.className).toContain("bg-white");

    expect(screen.getByText("Tennis Court #7").className).toContain("text-dark-green");
    expect(screen.getByText("Clay").className).toContain("text-dark-green-half");
    expect(screen.getByText("Outdoor").className).toContain("text-dark-green-half");
  });

  // -------------------------
  // DISABLED STATE
  // -------------------------
  test("disabled cards apply disabled styles", () => {
    const disabledCourt = { ...sampleCourt, disabled: true };

    const { card } = renderCard({ court: disabledCourt });

    expect(card.className).toContain("opacity-50");
    expect(card.className).toContain("pointer-events-none");
    });

});
