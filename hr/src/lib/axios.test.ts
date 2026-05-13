import { beforeEach, describe, expect, it, vi } from "vitest";

const authSessionMocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  clear: vi.fn(),
}));

const axiosMocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("@/lib/authSession", () => ({
  authSession: authSessionMocks,
}));

vi.mock("axios", async () => {
  const actual = await vi.importActual<any>("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      post: axiosMocks.post,
    },
  };
});

describe("api interceptors", () => {
  beforeEach(() => {
    vi.resetModules();
    authSessionMocks.getAccessToken.mockReset();
    authSessionMocks.setAccessToken.mockReset();
    authSessionMocks.clear.mockReset();
    axiosMocks.post.mockReset();
    vi.unstubAllGlobals();
    vi.stubGlobal("location", { href: "" });
  });

  it("adds Authorization header when token exists", async () => {
    authSessionMocks.getAccessToken.mockReturnValue("token");

    const { api } = await import("@/lib/axios");

    let captured: any = null;
    api.defaults.adapter = async (config) => {
      captured = config;
      return {
        data: { ok: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    await api.get("/offers");

    expect(captured.headers?.Authorization).toBe("Bearer token");
  });

  it("refreshes token on 401 and retries request", async () => {
    let currentToken = "old-token";
    authSessionMocks.getAccessToken.mockImplementation(() => currentToken);
    authSessionMocks.setAccessToken.mockImplementation((token: string) => {
      currentToken = token;
    });
    axiosMocks.post.mockResolvedValue({ data: { accessToken: "new-token" } });

    const { api } = await import("@/lib/axios");

    let calls = 0;
    let retryAuth: string | undefined;

    api.defaults.adapter = async (config) => {
      calls += 1;
      if (calls === 1) {
        return Promise.reject({ config, response: { status: 401 } });
      }
      retryAuth = config.headers?.Authorization as string | undefined;
      return {
        data: { ok: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    const res = await api.get("/offers");

    expect(res.data.ok).toBe(true);
    expect(axiosMocks.post).toHaveBeenCalled();
    expect(authSessionMocks.setAccessToken).toHaveBeenCalledWith("new-token");
    expect(retryAuth).toBe("Bearer new-token");
  });

  it("clears session and redirects on admin 403", async () => {
    authSessionMocks.getAccessToken.mockReturnValue("token");

    const { api } = await import("@/lib/axios");

    api.defaults.adapter = async (config) => {
      return Promise.reject({ config, response: { status: 403 } });
    };

    await expect(api.get("/admin/hr-accounts")).rejects.toBeDefined();

    expect(authSessionMocks.clear).toHaveBeenCalledTimes(1);
    expect((window as any).location.href).toBe("/login");
  });
});
