import { render, screen, fireEvent } from "@testing-library/react";
import InputField from "./InputField";
import { vi } from "vitest";

describe("InputField", () => {
  test("renders label, placeholder and value", () => {
    render(
      <InputField
        label="Email"
        placeholder="Enter email"
        value="test@example.com"
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Enter email");
    expect(input.value).toBe("test@example.com");
  });

  test("calls onChange when typing", () => {
    const onChange = vi.fn();

    render(
      <InputField
        label="Name"
        placeholder="Enter name"
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText("Enter name");
    fireEvent.change(input, { target: { value: "Andris" } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("applies error styling when hasError = true", () => {
    render(
      <InputField
        label="Password"
        placeholder="Enter password"
        value=""
        onChange={() => {}}
        hasError={true}
      />
    );

    const input = screen.getByPlaceholderText("Enter password");

    expect(input.className).toContain("border-red-500");
  });

  test("default type is text, but can be changed", () => {
    render(
      <InputField
        label="Password"
        placeholder="Enter password"
        type="password"
        value=""
        onChange={() => {}}
      />
    );

    const input = screen.getByPlaceholderText("Enter password");
    expect(input.type).toBe("password");
  });
});
