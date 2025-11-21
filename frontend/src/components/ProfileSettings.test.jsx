import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileSettings from "./ProfileSettings";
import { vi } from "vitest";

global.fetch = vi.fn();

function renderProfile(onUpdateSuccess = vi.fn()) {
  return {
    onUpdateSuccess,
    ...render(
      <ProfileSettings
        firstName="John"
        lastName="Doe"
        email="john@doe.com"
        phoneNumber="+36301234567"
        onUpdateSuccess={onUpdateSuccess}
      />
    ),
  };
}

describe("ProfileSettings Component", () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  test("renders all input fields correctly", () => {
    renderProfile();

    expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("john@doe.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("+36301234567")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Put your current password...")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Put your new password...")
    ).toBeInTheDocument();
  });

  test("updates details and calls onUpdateSuccess", async () => {
    const { onUpdateSuccess } = renderProfile();

    fetch.mockResolvedValueOnce({ ok: true });

    fireEvent.change(screen.getByPlaceholderText("John"), {
      target: { value: "Jonathan" },
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Save Changes" })[0]
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5044/api/Users/edit",
        expect.objectContaining({
          method: "PUT",
        })
      );
    });

    expect(onUpdateSuccess).toHaveBeenCalled();
  });

  test("successful password change calls onUpdateSuccess", async () => {
    const { onUpdateSuccess } = renderProfile();

    fetch.mockResolvedValueOnce({ ok: true });

    fireEvent.change(
      screen.getByPlaceholderText("Put your current password..."),
      {
        target: { value: "OldPassword123" },
      }
    );

    fireEvent.change(screen.getByPlaceholderText("Put your new password..."), {
      target: { value: "NewPassword123" },
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Save Changes" })[1]
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5044/api/ChangePassword",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    expect(onUpdateSuccess).toHaveBeenCalled();
  });

  test("invalid new password shows error and blocks update", async () => {
    const { onUpdateSuccess } = renderProfile();

    fireEvent.change(
      screen.getByPlaceholderText("Put your current password..."),
      {
        target: { value: "OldPassword123" },
      }
    );

    fireEvent.change(screen.getByPlaceholderText("Put your new password..."), {
      target: { value: "bad" },
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Save Changes" })[1]
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Invalid new password")
      ).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(onUpdateSuccess).not.toHaveBeenCalled();
  });

  test("invalid first name resets field", () => {
    renderProfile();

    const firstNameInput = screen.getByPlaceholderText("John");

    fireEvent.change(firstNameInput, {
      target: { value: "123" },
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Save Changes" })[0]
    );

    expect(firstNameInput.value).toBe("");
  });
});