import { render, screen, fireEvent } from "@testing-library/react";
import CourtCard from "./CourtCard";
import { vi } from "vitest";

// ---- MOCK FRAMER MOTION ----
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe("CourtCard", () => {

  const sampleCourt = {
    id: 12,
    material: "Clay",
    outdoors: true,
  };

  test("renders court information correctly", () => {
    render(<CourtCard court={sampleCourt} />);

    expect(screen.getByText("Tennis court #12")).toBeInTheDocument();
    expect(screen.getByText("Type: Clay")).toBeInTheDocument();
    expect(screen.getByText("Outdoor")).toBeInTheDocument();
  });

  test("supports alternative ID fields (ID, Id)", () => {
    const variants = [
      { ID: 44, material: "Grass", outdoors: false },
      { Id: 55, material: "Hard", outdoors: true },
    ];

    render(<CourtCard court={variants[0]} />);
    expect(screen.getByText("Tennis court #44")).toBeInTheDocument();

    render(<CourtCard court={variants[1]} />);
    expect(screen.getByText("Tennis court #55")).toBeInTheDocument();
  });

  test("clicking card calls onClick with court data", () => {
    const onClick = vi.fn();

    render(<CourtCard court={sampleCourt} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledWith(sampleCourt);
  });

  test("pressing Enter key triggers onClick", () => {
    const onClick = vi.fn();

    render(<CourtCard court={sampleCourt} onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });

    expect(onClick).toHaveBeenCalledWith(sampleCourt);
  });

  test("pressing Space key triggers onClick", () => {
    const onClick = vi.fn();

    render(<CourtCard court={sampleCourt} onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole("button"), { key: " " });

    expect(onClick).toHaveBeenCalledWith(sampleCourt);
  });

  test("applies selected styling when isSelected=true", () => {
    render(<CourtCard court={sampleCourt} isSelected={true} />);

    const card = screen.getByRole("button");

    // selected classes
    expect(card.className).toContain("border-green");
    expect(card.className).toContain("shadow-lg");
    expect(card.className).toContain("-translate-y-2");

    // title color in selected state
    expect(screen.getByText("Tennis court #12").className).toContain("text-green");
  });

  test("non-selected state uses default classes", () => {
    render(<CourtCard court={sampleCourt} isSelected={false} />);

    const card = screen.getByRole("button");

    expect(card.className).toContain("border-gray-200");
    expect(card.className).toContain("hover:shadow-lg");
    expect(card.className).toContain("hover:-translate-y-2");

    // title color default
    expect(screen.getByText("Tennis court #12").className).toContain("text-dark-green");
  });

});
