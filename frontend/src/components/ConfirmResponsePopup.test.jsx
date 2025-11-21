import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ConfirmResponsePopup from "./ConfirmResponsePopup";
import { vi } from "vitest";

describe("ConfirmResponsePopup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test("renders title and description in success mode", () => {
    render(
      <ConfirmResponsePopup
        type="success"
        title="Success!"
        description="Everything went fine."
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByText("Everything went fine.")).toBeInTheDocument();
  });

  test("auto-close calls onCancel after timeout in success mode", async () => {
    const onCancel = vi.fn();

    render(
      <ConfirmResponsePopup
        type="success"
        title="Done"
        onCancel={onCancel}
        autoCloseMs={2000}
        showCalendarButton={false}
      />
    );

    // move time forward
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("auto-close does NOT trigger when showCalendarButton = true", () => {
    const onCancel = vi.fn();

    render(
      <ConfirmResponsePopup
        type="success"
        title="Done"
        onCancel={onCancel}
        autoCloseMs={2000}
        showCalendarButton={true}
        reservationId={55}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should NOT close automatically
    expect(onCancel).not.toHaveBeenCalled();
  });

  test("shows Google Calendar button when success + showCalendarButton + reservationId", () => {
    render(
      <ConfirmResponsePopup
        type="success"
        title="Done"
        showCalendarButton={true}
        reservationId={123}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("Add to Google Calendar")).toBeInTheDocument();
  });

  test("Google Calendar button redirects to correct URL", () => {
    delete window.location;
    window.location = { href: "" };

    render(
      <ConfirmResponsePopup
        type="success"
        title="Done"
        showCalendarButton={true}
        reservationId={999}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Add to Google Calendar"));

    expect(window.location.href).toBe(
      "http://localhost:5044/api/google/auth?reservationId=999"
    );
  });

  test("confirm mode: confirm and cancel buttons call handlers", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmResponsePopup
        type="confirm"
        title="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("background click triggers onCancel", () => {
    const onCancel = vi.fn();

    const { container } = render(
        <ConfirmResponsePopup
        type="success"
        title="Test"
        onCancel={onCancel}
        />
    );

    // outer overlay div (background)
    const overlay = container.firstChild;

    fireEvent.click(overlay);

    expect(onCancel).toHaveBeenCalled();
    });

});
