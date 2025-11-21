import { vi, describe, it, beforeEach, expect } from "vitest";

// ===== React MOCK a state-setterek elkapásához =====
let capturedSetScreen = null;
let capturedSetScore = null;

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  const originalUseState = actual.useState;

  function customUseState(initial) {
    const [value, setValue] = originalUseState(initial);

    // screen state: const [screen, setScreen] = useState("menu");
    if (initial === "menu") {
      capturedSetScreen = setValue;
    }

    // score state: { p:0, b:0, adv:null, over:false, winner:null }
    if (
      initial &&
      typeof initial === "object" &&
      "p" in initial &&
      "b" in initial &&
      "over" in initial &&
      "winner" in initial
    ) {
      capturedSetScore = setValue;
    }

    return [value, setValue];
  }

  return {
    ...actual,
    useState: customUseState,
  };
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { act } from "react-dom/test-utils"; // deprecation warning ok, nem fatal
import TennisMiniGame from "./TennisMiniGame";

// ===== CANVAS MOCK – minden szükséges metódussal =====
HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  strokeRect: () => {},
  beginPath: () => {},
  closePath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  arc: () => {},
  rect: () => {},
  fill: () => {},
  stroke: () => {},
  save: () => {},
  restore: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  transform: () => {},
  setTransform: () => {},
  resetTransform: () => {},
  drawImage: () => {},
  measureText: () => ({ width: 100 }),
  clip: () => {},
  lineWidth: 1,
  globalAlpha: 1,
  strokeStyle: "",
  fillStyle: "",
  createPattern: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  ellipse: () => {},
  quadraticCurveTo: () => {},

  // 👇 EZ HIÁNYZOTT – emiatt jött a TypeError: ctx.fillText is not a function
  fillText: () => {},

  // opcionális, de nem árt, ha a kód állítja ezeket:
  font: "",
  textAlign: "center",
  textBaseline: "middle",
});

// ===== NAVIGÁCIÓ MOCK =====
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ===== AUTH MOCK =====
let mockAuthenticated = true;
vi.mock("../hooks/useCurrentUser.js", () => ({
  useCurrentUser: () => ({
    authenticated: mockAuthenticated,
  }),
}));

// ===== NAVBAR MOCK (ha a view használja) =====
vi.mock("../components/Navbar", () => ({
  default: () => <div />,
}));

// ===== TESZTEK =====
describe("TennisMiniGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticated = true;
    capturedSetScreen = null;
    capturedSetScore = null;
  });

  it("redirects to login when not authenticated", () => {
    mockAuthenticated = false;

    render(
      <MemoryRouter>
        <TennisMiniGame />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("renders menu screen by default", () => {
    render(
      <MemoryRouter>
        <TennisMiniGame />
      </MemoryRouter>
    );

    expect(screen.getByText(/Swing, win/i)).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  it("starts the game when pressing Start", () => {
    render(
      <MemoryRouter>
        <TennisMiniGame />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Start"));

    expect(screen.queryByText(/Swing, win/i)).not.toBeInTheDocument();
  });

  it("pauses and resumes the game with ESC", async () => {
    render(
      <MemoryRouter>
        <TennisMiniGame />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Start"));

    // PAUSE
    fireEvent.keyDown(window, { key: "Escape" });

    expect(await screen.findByText(/Paused/i)).toBeInTheDocument();

    // RESUME
    fireEvent.click(screen.getByText("Resume match"));

    expect(screen.queryByText(/Paused/i)).not.toBeInTheDocument();
  });

  // 🔥 GAME OVER OVERLAY TESZT – komponens módosítása nélkül
  it("shows game over overlay when score.over is true", async () => {
    render(
      <MemoryRouter>
        <TennisMiniGame />
      </MemoryRouter>
    );

    // useEffect-ek lefutnak, state-ek beállnak
    await act(async () => {});

    // screen = "playing", score.over = true, winner = "player"
    await act(async () => {
      if (capturedSetScreen) capturedSetScreen("playing");
      if (capturedSetScore)
        capturedSetScore((prev) => ({
          ...prev,
          over: true,
          winner: "player",
        }));
    });

    // Most már a valódi overlay renderel
    expect(await screen.findByText(/You won/i)).toBeInTheDocument();
    expect(screen.getByText(/Play Again/i)).toBeInTheDocument();
  });

  it("navigates back to coupons from menu", () => {
    render(
      <MemoryRouter>
        <TennisMiniGame />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Back to coupons"));

    expect(mockNavigate).toHaveBeenCalledWith("/profile?tab=coupons");
  });
});
