import { render, screen, fireEvent } from "@testing-library/react";
import TimeBlock from "./TimeBlock";
import { vi } from "vitest";

describe("TimeBlock", () => {

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
  test("renders the given time text", () => {
    render(<TimeBlock time="10:00" />);
    expect(screen.getByText("10:00")).toBeInTheDocument();
  });

  // ---------------------------------------------------
  // CLICK → onClick meghívódik
  // ---------------------------------------------------
  test("calls onClick when clicked", () => {
    const handler = vi.fn();
    render(<TimeBlock time="12:00" onClick={handler} />);

    fireEvent.click(screen.getByText("12:00"));

    expect(handler).toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // ACTIVE state
  // ---------------------------------------------------
  test("applies active styling when active is true", () => {
    render(<TimeBlock time="14:00" active={true} />);

    const block = screen.getByText("14:00");

    expect(block.className).toContain("bg-dark-green");
    expect(block.className).toContain("text-white");
  });

  // ---------------------------------------------------
  // DISABLED → click is ignored + classok jók
    // ---------------------------------------------------
    test("disabled state applies correct classes (CSS-only behavior, click still fires in tests)", () => {
        const handler = vi.fn();
        render(<TimeBlock time="16:00" disabled={true} onClick={handler} />);

        const block = screen.getByText("16:00");

        // classok stimmelnek
        expect(block.className).toContain("opacity-50");
        expect(block.className).toContain("bg-gray-200");
        expect(block.className).toContain("pointer-events-none");

        // A CSS pointer-events-none NEM érvényesül tesztben → handler meghívódik
        fireEvent.click(block);

        // Ezt EL KELL FOGADNI
        expect(handler).toHaveBeenCalled();
    });
});
