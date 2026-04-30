import { beforeEach, describe, expect, it, vi } from "vitest";

const authSessionMocks = vi.hoisted(() => ({
  getUserRaw: vi.fn(),
  getAccessToken: vi.fn(),
  clear: vi.fn(),
  setAccessToken: vi.fn(),
  setUserRaw: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("@/lib/authSession", () => ({
  authSession: authSessionMocks,
}));

vi.mock("@/lib/axios", () => ({
  api: apiMocks,
}));

describe("authStore loadFromStorage", () => {
  beforeEach(() => {
    vi.resetModules();
    authSessionMocks.getUserRaw.mockReset();
    authSessionMocks.getAccessToken.mockReset();
    authSessionMocks.clear.mockReset();
    apiMocks.post.mockReset();
  });

  it("recovers safely when stored user JSON is corrupted", async () => {
    authSessionMocks.getUserRaw.mockReturnValue("{broken-json");
    authSessionMocks.getAccessToken.mockReturnValue("token");

    const { useAuthStore } = await import("@/store/authStore");

    expect(() => useAuthStore.getState().loadFromStorage()).not.toThrow();
    expect(authSessionMocks.clear).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});

