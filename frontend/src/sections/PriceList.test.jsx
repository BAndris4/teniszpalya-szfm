import { render, screen } from "@testing-library/react";
import PriceList from "./PriceList";

// --- MOCK usePrice ---
vi.mock("../hooks/usePrice", () => ({
  default: () => ({
    getPrice: ({ season, outside, student, morning }) => {
      // dummy predictable values
      if (season === "summer") {
        if (outside) return 4000;
        return 9000;
      }
      if (season === "winter") {
        if (outside) return null; // outside no price in winter
        return 7000;
      }
      return null;
    },
  }),
}));

describe("PriceList Component", () => {
  test("renders headers and sections", () => {
    render(<PriceList />);

    expect(
      screen.getByText("Simple, transparent pricing")
    ).toBeInTheDocument();

    expect(screen.getByText("Summer Season")).toBeInTheDocument();
    expect(screen.getByText("Winter Season")).toBeInTheDocument();

    // Table titles
    expect(screen.getAllByText("Service").length).toBe(2);
    expect(screen.getAllByText("Price").length).toBe(2);

    expect(screen.getAllByText("Outside").length).toBe(2);
    expect(screen.getAllByText("Inside").format);
  });

  test("summer prices render correctly using mocked getPrice", () => {
    render(<PriceList />);

    // Summer outside (mock returns 4000)
    const summerPricesOutside = screen.getAllByText(/Ft 4 000|Ft 4000/);
    expect(summerPricesOutside.length).toBe(4);

    // Summer inside (mock returns 9000)
    const summerPricesInside = screen.getAllByText(/Ft 9 000|Ft 9000/);
    expect(summerPricesInside.length).toBe(4);
  });

  test("winter outside renders – for null price", () => {
    render(<PriceList />);

    const winterDash = screen.getAllByText("Ft –");
    // Winter outside has 4 rows → 4 dashes expected
    expect(winterDash.length).toBe(4);
  });

  test("winter inside shows correct price", () => {
    render(<PriceList />);

    const winterInside = screen.getAllByText(/Ft 7 000|Ft 7000/);
    expect(winterInside.length).toBe(4);
  });
});
