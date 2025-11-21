import { render, screen, fireEvent } from "@testing-library/react";
import DatePicker from "./DatePicker";
import { vi } from "vitest";

describe("DatePicker", () => {

  beforeAll(() => {
    vi.spyOn(Date.prototype, "toLocaleDateString").mockReturnValue("10.01.2030");
  });

  function setup(initialDate = new Date("2030-01-10")) {
    const setDate = vi.fn();
    render(<DatePicker date={initialDate} setDate={setDate} />);
    return { setDate, initialDate };
  }

  test("renders formatted HU date", () => {
    setup(new Date("2030-01-10"));

    expect(screen.getByText("10.01.2030")).toBeInTheDocument();
  });

  test("next button increases date by +1 day", () => {
    const { setDate } = setup(new Date("2030-01-10"));

    const nextBtn = screen.getByTestId("next-btn");
    fireEvent.click(nextBtn);

    expect(setDate).toHaveBeenCalledTimes(1);
    const newDate = setDate.mock.calls[0][0];
    expect(newDate.getDate()).toBe(11);
  });

  test("prev button decreases date by -1 day", () => {
    const { setDate } = setup(new Date("2030-01-10"));

    const prevBtn = screen.getByTestId("prev-btn");
    fireEvent.click(prevBtn);

    expect(setDate).toHaveBeenCalledTimes(1);
    const newDate = setDate.mock.calls[0][0];
    expect(newDate.getDate()).toBe(9);
  });

  test("prev button does NOT go into the past (relative to today)", () => {
    const today = new Date();
    const { setDate } = setup(today);

    const prevBtn = screen.getByTestId("prev-btn");
    fireEvent.click(prevBtn);

    expect(setDate).not.toHaveBeenCalled();
  });
});
