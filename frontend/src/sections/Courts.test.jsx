import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Courts from "./Courts";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// -----------------------------------------------------------
// MOCK navigate
// -----------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// -----------------------------------------------------------
// MOCK CourtCard (csak a struktúrát ellenőrizzük)
// -----------------------------------------------------------
vi.mock("../components/CourtCard", () => ({
  __esModule: true,
  default: ({ court, onClick }) => (
    <div data-testid="court-card" onClick={onClick}>
      Court {court.id}
    </div>
  ),
}));

// -----------------------------------------------------------
// RENDER helper
// -----------------------------------------------------------
function renderCourts() {
  return render(
    <MemoryRouter>
      <Courts />
    </MemoryRouter>
  );
}

describe("Courts Page", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------
  // 1) Fetch → render courts
  // -----------------------------------------------------------
  test("renders fetched courts", async () => {
    const sample = [
      { id: 1 }, { id: 2 }, { id: 3 }
    ];

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => sample,
    });

    renderCourts();

    const cards = await screen.findAllByTestId("court-card");
    expect(cards.length).toBe(3);
  });

  // -----------------------------------------------------------
  // 2) Navigation arrows visible only if > 4 courts
  // -----------------------------------------------------------
  test("shows navigation only when more than 4 courts", async () => {
    // 3 courts → no navigation arrows
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1 }, { id: 2 }, { id: 3 }],
    });

    renderCourts();

    await screen.findAllByTestId("court-card");

    expect(screen.queryByRole("button")).toBeNull();
  });

  test("shows navigation when more than 4 courts", async () => {
    const sample = [
      { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
    ];

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => sample,
    });

    renderCourts();

    await screen.findAllByTestId("court-card");

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
  });

  // -----------------------------------------------------------
  // 3) Slider movement (translateX)
  // -----------------------------------------------------------
  test("next button shifts slider to next position", async () => {
    const sampleCourts = [
        { id: 1, name: "Court 1" },
        { id: 2, name: "Court 2" },
        { id: 3, name: "Court 3" },
        { id: 4, name: "Court 4" },
        { id: 5, name: "Court 5" },
    ];

    // mock fetch
    vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => sampleCourts,
    });

    renderCourts();

    // várjuk meg a kártyákat
    const cards = await screen.findAllByTestId("court-card");

    // a slider a card → parent → parent elem
    const slider = cards[0].parentElement;

    expect(slider.style.transform).toBe("translateX(-0px)");

    const nextBtn = screen.getAllByRole("button")[1];

    fireEvent.click(nextBtn);

    await waitFor(() => {
        expect(slider.style.transform).toBe("translateX(-280px)");
    });
  });

  // -----------------------------------------------------------
  // 4) Card click navigates to "/courts"
  // -----------------------------------------------------------
  test("clicking a court card navigates correctly", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1 }],
    });

    renderCourts();

    const card = await screen.findByTestId("court-card");

    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith("/courts");
  });

  // -----------------------------------------------------------
  // 5) Previous button disabled at start
  // -----------------------------------------------------------
  test("previous button is disabled at index 0", async () => {
    const sample = [
      { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
    ];

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => sample,
    });

    renderCourts();

    await screen.findAllByTestId("court-card");

    const [prevBtn] = screen.getAllByRole("button");
    expect(prevBtn).toBeDisabled();
  });
});
