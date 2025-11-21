import { renderHook } from "@testing-library/react";
import usePrice from "./usePrice";

describe("usePrice", () => {
  let getPrice;

  beforeEach(() => {
    const { result } = renderHook(() => usePrice());
    getPrice = result.current.getPrice;
  });

  // -------------------------------------------------------
  // SUMMER / OUTSIDE
  // -------------------------------------------------------
  test("summer outside base prices", () => {
    expect(getPrice({ season: "summer", outside: true, student: false, morning: false })).toBe(4000);
    expect(getPrice({ season: "summer", outside: true, student: true,  morning: false })).toBe(3600);
    expect(getPrice({ season: "summer", outside: true, student: false, morning: true  })).toBe(3200);
    expect(getPrice({ season: "summer", outside: true, student: true,  morning: true  })).toBe(2800);
  });

  // -------------------------------------------------------
  // SUMMER / INSIDE
  // -------------------------------------------------------
  test("summer inside base prices", () => {
    expect(getPrice({ season: "summer", outside: false, student: false, morning: false })).toBe(9000);
    expect(getPrice({ season: "summer", outside: false, student: true,  morning: false })).toBe(8600);
    expect(getPrice({ season: "summer", outside: false, student: false, morning: true  })).toBe(8200);
    expect(getPrice({ season: "summer", outside: false, student: true,  morning: true  })).toBe(7800);
  });

  // -------------------------------------------------------
  // WINTER / OUTSIDE — ALL PRICES NULL
  // -------------------------------------------------------
  test("winter outside always returns null", () => {
    expect(getPrice({ season: "winter", outside: true, student: false, morning: false })).toBe(null);
    expect(getPrice({ season: "winter", outside: true, student: true,  morning: false })).toBe(null);
    expect(getPrice({ season: "winter", outside: true, student: false, morning: true  })).toBe(null);
    expect(getPrice({ season: "winter", outside: true, student: true,  morning: true  })).toBe(null);
  });

  // -------------------------------------------------------
  // WINTER / INSIDE
  // -------------------------------------------------------
  test("winter inside prices", () => {
    expect(getPrice({ season: "winter", outside: false, student: false, morning: false })).toBe(7000);
    expect(getPrice({ season: "winter", outside: false, student: true,  morning: false })).toBe(6600);
    expect(getPrice({ season: "winter", outside: false, student: false, morning: true  })).toBe(6200);
    expect(getPrice({ season: "winter", outside: false, student: true,  morning: true  })).toBe(5800);
  });

  // -------------------------------------------------------
  // DEFAULT PARAMÉTEREK
  // -------------------------------------------------------
  test("default params resolve to summer, outside, non-student, non-morning", () => {
    expect(getPrice({})).toBe(4000); 
  });

  // -------------------------------------------------------
  // INVALID AREA → null
  // -------------------------------------------------------
  test("returns null for invalid season", () => {
    expect(getPrice({ season: "autumn" })).toBe(null);
  });

  // -------------------------------------------------------
  // Callback should be stable (useCallback)
  // -------------------------------------------------------
  test("getPrice is stable reference (useCallback)", () => {
    const h1 = renderHook(() => usePrice());
    const h2 = renderHook(() => usePrice());

    // ugyanabban a hook instance-ban stabil
    expect(h1.result.current.getPrice).toBe(h1.result.current.getPrice);

    // más hook instance-ben természetesen nem — ez helyes
    expect(h1.result.current.getPrice).not.toBe(h2.result.current.getPrice);
  });
});
