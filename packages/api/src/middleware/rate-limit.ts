import { HttpError } from "../lib/http-error";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 40;

export const assertRateLimit = (key: string): void => {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return;
  }

  if (existing.count >= MAX_REQUESTS) {
    throw new HttpError(429, "Too many requests");
  }

  existing.count += 1;
};
