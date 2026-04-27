import { env } from './env';

const explicitOrigins = Array.from(
  new Set([env.CLIENT_URL, env.CANDIDATE_URL, env.ADMIN_URL, env.HR_URL].filter(Boolean)),
);

const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const tryCloudflarePattern = /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/i;
const ngrokPattern = /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i;
const ngrokReservedPattern = /^https:\/\/[a-z0-9-]+\.ngrok\.app$/i;

export function isAllowedOrigin(origin?: string): boolean {
  // Allow non-browser / curl requests that have no Origin header.
  if (!origin) {
    return true;
  }

  if (explicitOrigins.includes(origin)) {
    return true;
  }

  return (
    localhostPattern.test(origin) ||
    tryCloudflarePattern.test(origin) ||
    ngrokPattern.test(origin) ||
    ngrokReservedPattern.test(origin)
  );
}

export function getAllowedOriginsForLog(): string[] {
  return explicitOrigins;
}
