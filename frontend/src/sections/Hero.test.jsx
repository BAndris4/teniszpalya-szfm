import { render, screen, fireEvent, act } from "@testing-library/react";
import Hero from "./Hero";
import { vi, describe, test, beforeEach, afterEach, expect } from "vitest";

const mockSetVisible = vi.fn();
vi.mock("../contexts/ReserveMenuContext", () => ({
  useReserveMenu: () => ({
    isReserveMenuVisible: false,
    setIsReserveMenuVisible: mockSetVisible,
  }),
}));

describe("Hero component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSetVisible.mockReset();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test("typing animation progressively reveals text", () => {
    render(<Hero />);

    const fullText = "Your game. Your court. Just a tap away.";

    const textBox = screen.getByTestId("typewriter");

    // elején üres (csak a | van)
    expect(textBox.textContent.replace("|", "")).toBe("");

    act(() => vi.advanceTimersByTime(100)); // load-in
    act(() => vi.advanceTimersByTime(700)); // typing start delay
    act(() => vi.advanceTimersByTime(300)); // typing in progress

    expect(textBox.textContent.length).toBeGreaterThan(1);

    act(() => vi.advanceTimersByTime(5000)); // finish typing

    expect(textBox.textContent).toContain(fullText);
  });


  test("isLoaded becomes true after 100ms", () => {
    render(<Hero />);

    const imgDiv = document.querySelector(".bg-cover");
    expect(imgDiv.className).toContain("opacity-0");

    act(() => vi.advanceTimersByTime(100));

    expect(imgDiv.className).toContain("opacity-100");
  });

  test("Reserve button calls setIsReserveMenuVisible(true)", () => {
    render(<Hero />);
    fireEvent.click(screen.getByText("Reserve"));
    expect(mockSetVisible).toHaveBeenCalledWith(true);
  });

  test("View Courts button triggers scrollIntoView", () => {
    const scroll = vi.fn();
    document.body.innerHTML = `<div id="Courts"></div>`;
    document.getElementById("Courts").scrollIntoView = scroll;

    render(<Hero />);

    fireEvent.click(screen.getByText("View Courts"));
    expect(scroll).toHaveBeenCalled();
  });
});
