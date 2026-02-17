import { describe, expect, it } from "vitest";
import { assertRateLimit } from "./rate-limit";

describe("assertRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Date.now()}-allow`;
    expect(() => assertRateLimit(key)).not.toThrow();
  });

  it("throws after exceeding the limit", () => {
    const key = `test-${Date.now()}-exceed`;
    for (let i = 0; i < 40; i++) {
      assertRateLimit(key);
    }
    expect(() => assertRateLimit(key)).toThrow("Too many requests");
  });
});
