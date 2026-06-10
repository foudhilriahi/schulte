import type { RequestHandler } from "express";

type EntryState = "pending" | "done";

interface IdempotencyEntry {
  state: EntryState;
  statusCode: number;
  payload: unknown;
  expiresAt: number;
}

const store = new Map<string, IdempotencyEntry>();
let opCount = 0;

const cleanupExpired = (now: number) => {
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
};

const buildStoreKey = (req: any, headerKey: string) => {
  const idempotencyKey = String(req.header(headerKey) || "").trim();
  const actor = req.user?.userId || req.ip || "anonymous";
  return `${actor}:${req.method}:${req.path}:${idempotencyKey}`;
};

export function idempotency(windowMs = 10 * 60 * 1000): RequestHandler {
  const headerName = "x-idempotency-key";

  return (req: any, res, next) => {
    const rawHeader = req.header(headerName);
    if (!rawHeader || String(rawHeader).trim().length === 0) {
      next();
      return;
    }

    const now = Date.now();
    opCount += 1;
    if (opCount % 100 === 0) {
      cleanupExpired(now);
    }

    const key = buildStoreKey(req, headerName);
    const cached = store.get(key);

    if (cached && cached.expiresAt > now) {
      if (cached.state === "pending") {
        res.status(409).json({
          error: "Une requete identique est deja en cours. Patientez quelques secondes.",
        });
        return;
      }

      res.setHeader("X-Idempotent-Replay", "true");
      res.status(cached.statusCode).json(cached.payload);
      return;
    }

    store.set(key, {
      state: "pending",
      statusCode: 202,
      payload: { ok: true },
      expiresAt: now + windowMs,
    });

    const originalJson = res.json.bind(res);
    let wasPersisted = false;
    res.json = (payload: unknown) => {
      const statusCode = typeof res.statusCode === "number" ? res.statusCode : 200;
      if (statusCode < 500) {
        store.set(key, {
          state: "done",
          statusCode,
          payload,
          expiresAt: Date.now() + windowMs,
        });
        wasPersisted = true;
      } else {
        store.delete(key);
      }
      return originalJson(payload);
    };

    res.on("finish", () => {
      if (wasPersisted) return;
      const entry = store.get(key);
      if (!entry || entry.state !== "pending") return;

      const statusCode = typeof res.statusCode === "number" ? res.statusCode : 500;
      if (statusCode < 500) {
        store.set(key, {
          state: "done",
          statusCode,
          payload: { ok: true },
          expiresAt: Date.now() + windowMs,
        });
      } else {
        store.delete(key);
      }
    });

    res.on("close", () => {
      const entry = store.get(key);
      if (entry?.state === "pending") {
        store.delete(key);
      }
    });

    next();
  };
}
