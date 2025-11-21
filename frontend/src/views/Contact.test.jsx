import { render, screen, fireEvent, act } from "@testing-library/react";
import Contact from "./Contact";
import { vi } from "vitest";

// --------------------------------------------------
// MOCK: react-router navigate
// --------------------------------------------------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// --------------------------------------------------
// MOCK: framer-motion → sima wrapper elemek
// --------------------------------------------------
vi.mock("framer-motion", () => {
  const MotionFactory = (Tag) =>
    ({ children, ...props }) =>
      <Tag {...props}>{children}</Tag>;

  return {
    motion: {
      div: MotionFactory("div"),
      img: MotionFactory("img"),
      h2: MotionFactory("h2"),
      p: MotionFactory("p"),
      span: MotionFactory("span"),
      // ezek a fontosak:
      input: MotionFactory("input"),
      textarea: MotionFactory("textarea"),
      button: MotionFactory("button"),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});


describe("Contact Page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockReset();
  });

  // --------------------------------------------------
  test("shows validation error when fields are empty", () => {
    render(<Contact />);

    fireEvent.click(screen.getByText("Send message"));

    expect(screen.getByText("Please fill out all fields!")).toBeInTheDocument();
  });

    test("does not submit when email is invalid", async () => {
        render(<Contact />);

        fireEvent.change(screen.getByPlaceholderText("Name"), {
            target: { value: "John" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "invalid-email" },
        });
        fireEvent.change(screen.getByPlaceholderText("Message"), {
            target: { value: "Hello!" },
        });

        fireEvent.click(screen.getByText("Send message"));

        // Nem indul el a "Sending..." állapot
        expect(screen.queryByText("Sending...")).not.toBeInTheDocument();

        // Nem jelenik meg a köszönő üzenet sem
        expect(
            screen.queryByText("Thank you for contacting us! We will reply soon.")
        ).not.toBeInTheDocument();
    });

  // --------------------------------------------------
  test("submits form successfully and shows thank-you message", async () => {
    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Anna" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "anna@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Message"), {
      target: { value: "Hello! :)" },
    });

    fireEvent.click(screen.getByText("Send message"));
    expect(screen.getByText("Sending...")).toBeInTheDocument();

    // Wait for fake 1.2s timer
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });

    expect(
      screen.getByText("Thank you for contacting us! We will reply soon.")
    ).toBeInTheDocument();

    // Inputs should clear
    expect(screen.getByPlaceholderText("Name").value).toBe("");
    expect(screen.getByPlaceholderText("Email").value).toBe("");
    expect(screen.getByPlaceholderText("Message").value).toBe("");
  });

  // --------------------------------------------------
  test("tennis ball navigate to home on click", () => {
    render(<Contact />);

    const img = screen.getByAltText("Tennis Ball");

    fireEvent.click(img);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
