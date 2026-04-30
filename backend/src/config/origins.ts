import { env } from './env';

const explicitOrigins = Array.from(
  new Set([env.CLIENT_URL, env.CANDIDATE_URL, env.ADMIN_URL, env.HR_URL].filter(Boolean)),
);

const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const allowNoOrigin =
  (process.env.ALLOW_NO_ORIGIN ?? (env.NODE_ENV === 'development' ? 'true' : 'false')).toLowerCase() === 'true';
const allowLocalhostOrigins =
  (process.env.ALLOW_LOCALHOST_ORIGINS ?? (env.NODE_ENV === 'development' ? 'true' : 'false')).toLowerCase() ===
  'true';

const allowedLocalhostPorts = new Set(
  String(process.env.LOCALHOST_ORIGIN_PORTS || '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0),
);

function isAllowedLocalhostOrigin(origin: string): boolean {
  if (!allowLocalhostOrigins || !localhostPattern.test(origin)) {
    return false;
  }

  if (allowedLocalhostPorts.size === 0) {
    return true;
  }

  try {
    const port = new URL(origin).port;
    if (!port) return false;
    return allowedLocalhostPorts.has(Number(port));
  } catch {
    return false;
  }
}

export function isAllowedOrigin(origin?: string): boolean {
  // Allow non-browser / curl requests that have no Origin header only when explicitly enabled.
  if (!origin) {
    return allowNoOrigin;
  }

  if (explicitOrigins.includes(origin)) {
    return true;
  }

  // Allow localhost origins only when explicitly enabled.
  return isAllowedLocalhostOrigin(origin);
}

export function getAllowedOriginsForLog(): string[] {
  const details = [...explicitOrigins];
  if (allowNoOrigin) details.push('NO_ORIGIN_REQUESTS');
  if (allowLocalhostOrigins) {
    details.push(
      allowedLocalhostPorts.size > 0
        ? `LOCALHOST_PORTS:${Array.from(allowedLocalhostPorts).join(',')}`
        : 'LOCALHOST_ALL_PORTS',
    );
  }
  return details;
}
