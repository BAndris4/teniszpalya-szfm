import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { ReserveMenuProvider, useReserveMenu } from "./ReserveMenuContext";

// Helper component to test the context
function TestConsumer() {
  const { isReserveMenuVisible, setIsReserveMenuVisible } = useReserveMenu();
  return (
    <div>
      <div data-testid="visible">{String(isReserveMenuVisible)}</div>
      <button
        data-testid="toggle"
        onClick={() => setIsReserveMenuVisible((v) => !v)}
      >
        Toggle
      </button>
    </div>
  );
}

describe("ReserveMenuContext", () => {
  
  // ---------------------------------------------------
  // 1) Provider default value
  // ---------------------------------------------------
  test("provides default value (false)", () => {
    render(
      <ReserveMenuProvider>
        <TestConsumer />
      </ReserveMenuProvider>
    );

    expect(screen.getByTestId("visible").textContent).toBe("false");
  });

  // ---------------------------------------------------
  // 2) Setter works and updates consumers
  // ---------------------------------------------------
  test("setIsReserveMenuVisible updates value in consumer", () => {
    render(
      <ReserveMenuProvider>
        <TestConsumer />
      </ReserveMenuProvider>
    );

    const display = screen.getByTestId("visible");
    const button = screen.getByTestId("toggle");

    // Toggle → false → true
    fireEvent.click(button);
    expect(display.textContent).toBe("true");

    // Toggle again → true → false
    fireEvent.click(button);
    expect(display.textContent).toBe("false");
  });

  // ---------------------------------------------------
  // 3) useReserveMenu without provider returns undefined object
  // ---------------------------------------------------
  test("useReserveMenu without provider returns undefined values", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Render without provider
    function Wrapper() {
      const ctx = useReserveMenu();
      return <div data-testid="ctx">{String(ctx)}</div>;
    }

    render(<Wrapper />);

    // The context value is undefined because no provider wraps it
    expect(screen.getByTestId("ctx").textContent).toBe("undefined");

    consoleSpy.mockRestore();
  });
});
