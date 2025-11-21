import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useCurrentUser } from "./useCurrentUser";

describe("useCurrentUser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------
  // 1) Successful fetch → authenticated === true
  // -------------------------------------------------------
  test("sets user and authenticated=true when fetch succeeds", async () => {
    const mockUser = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      roleID: 1,
    };

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useCurrentUser());

    // authenticated initially null → waiting for fetch
    expect(result.current.authenticated).toBe(null);

    await waitFor(() => {
      expect(result.current.authenticated).toBe(true);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  // -------------------------------------------------------
  // 2) Fetch returns !ok → authenticated=false
  // -------------------------------------------------------
  test("sets authenticated=false when response is not ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.authenticated).toBe(false);
    });

    expect(result.current.user).toBe(null);
  });

  // -------------------------------------------------------
  // 3) Fetch throws → authenticated=false
  // -------------------------------------------------------
  test("sets authenticated=false when fetch throws error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network fail"));

    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.authenticated).toBe(false);
    });

    expect(result.current.user).toBe(null);
  });

  // -------------------------------------------------------
  // 4) Hook calls fetch exactly once
  // -------------------------------------------------------
  test("fetch is called exactly once", async () => {
    const mockFetch = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: true, json: async () => ({}) });

    renderHook(() => useCurrentUser());

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------
  // 5) Should pass credentials: include
  // -------------------------------------------------------
  test("fetch is called with correct options", async () => {
    const mockFetch = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: true, json: async () => ({}) });

    renderHook(() => useCurrentUser());

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:5044/api/auth/me",
      { credentials: "include" }
    );
  });
});
