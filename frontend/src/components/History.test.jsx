import { render, screen, waitFor } from "@testing-library/react";
import History from "./History";
import { vi } from "vitest";

global.fetch = vi.fn();

// Helper → valós timestamp-eket adunk át
function mockFetch(data) {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

describe("History", () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  test("shows empty state", async () => {
    mockFetch([]);

    render(<History />);

    const empty = await screen.findByText("No reservations found");
    expect(empty).toBeInTheDocument();
  });

  test("renders list sorted by reservedAt DESC", async () => {
    const r1 = {
      id: 1,
      courtID: 2,
      reservedAt: 1000,
      hours: 1,
      createdAt: 500,
    };
    const r2 = {
      id: 2,
      courtID: 3,
      reservedAt: 2000,
      hours: 1,
      createdAt: 1500,
    };

    mockFetch([r1, r2]);

    render(<History />);

    const items = await screen.findAllByText(/Court \d+/);

    // first reservation should be r2 because reservedAt 2000 is bigger
    expect(items[0].textContent).toContain("Court 3");
    expect(items[1].textContent).toContain("Court 2");
  });

  test("displays status badges correctly (upcoming, ongoing, completed)", async () => {
    const now = Date.now();

    const reservations = [
      {
        id: 1,
        courtID: 1,
        reservedAt: now + 60 * 60 * 1000, // 1h later → UPCOMING
        hours: 1,
        createdAt: now,
      },
      {
        id: 2,
        courtID: 2,
        reservedAt: now - 30 * 60 * 1000, // started 30 min ago + 1h → ONGOING
        hours: 1,
        createdAt: now,
      },
      {
        id: 3,
        courtID: 3,
        reservedAt: now - 3 * 60 * 60 * 1000, // 3h ago → COMPLETED
        hours: 1,
        createdAt: now,
      },
    ];

    mockFetch(reservations);

    render(<History />);

    const upcoming = await screen.findByText("Upcoming");
    const ongoing = await screen.findByText("Ongoing");
    const completed = await screen.findByText("Completed");

    expect(upcoming).toBeInTheDocument();
    expect(ongoing).toBeInTheDocument();
    expect(completed).toBeInTheDocument();
  });

  test("dates and times render (loosely checked)", async () => {
    const now = Date.now();

    mockFetch([
      {
        id: 5,
        courtID: 4,
        reservedAt: now,
        hours: 2,
        createdAt: now,
      },
    ]);

    render(<History />);

    await screen.findByText(/Court 4/);

    // Look for time formatting (“:” appears)
    const time = screen.getByText(/:/);
    expect(time).toBeInTheDocument();

    // Look for Hungarian month names (loose check)
    const date = screen.getAllByText(/20/)[0];
    expect(date.textContent).toMatch(/20/);
  });
});
