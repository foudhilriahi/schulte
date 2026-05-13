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

  it("clears partial auth artifacts (token-only or user-only)", async () => {
    authSessionMocks.getUserRaw.mockReturnValue(null);
    authSessionMocks.getAccessToken.mockReturnValue("token");

    const { useAuthStore } = await import("@/store/authStore");

    useAuthStore.getState().loadFromStorage();

    expect(authSessionMocks.clear).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe("authStore login", () => {
  beforeEach(() => {
    vi.resetModules();
    authSessionMocks.getUserRaw.mockReset();
    authSessionMocks.getAccessToken.mockReset();
    authSessionMocks.clear.mockReset();
    authSessionMocks.setAccessToken.mockReset();
    authSessionMocks.setUserRaw.mockReset();
    apiMocks.post.mockReset();
  });

  it("stores token and user for HR role", async () => {
    apiMocks.post.mockResolvedValue({
      data: {
        accessToken: "token",
        user: { id: "hr-1", name: "HR", email: "hr@corp.tn", role: "HR" },
      },
    });

    const { useAuthStore } = await import("@/store/authStore");

    await useAuthStore.getState().login("hr@corp.tn", "pass");

    expect(authSessionMocks.setAccessToken).toHaveBeenCalledWith("token");
    expect(authSessionMocks.setUserRaw).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.role).toBe("HR");
  });

  it("rejects non-HR roles on login", async () => {
    apiMocks.post.mockResolvedValue({
      data: {
        accessToken: "token",
        user: { id: "cand-1", name: "Cand", email: "c@ex.tn", role: "CANDIDATE" },
      },
    });

    const { useAuthStore } = await import("@/store/authStore");

    await expect(useAuthStore.getState().login("c@ex.tn", "pass")).rejects.toThrow(
      "Acces refuse",
    );

    expect(authSessionMocks.setAccessToken).not.toHaveBeenCalled();
    expect(authSessionMocks.setUserRaw).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

