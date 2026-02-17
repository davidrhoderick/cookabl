import { describe, expect, it } from "vitest";
import { nowIso, plusDaysIso } from "./now";

describe("nowIso", () => {
  it("returns a valid ISO 8601 string", () => {
    const iso = nowIso();
    expect(new Date(iso).toISOString()).toBe(iso);
  });
});

describe("plusDaysIso", () => {
  it("returns a date in the future", () => {
    const future = new Date(plusDaysIso(7));
    expect(future.getTime()).toBeGreaterThan(Date.now());
  });

  it("adds the correct number of days", () => {
    const now = Date.now();
    const result = new Date(plusDaysIso(3)).getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const diff = result - now;
    expect(diff).toBeGreaterThan(threeDaysMs - 1000);
    expect(diff).toBeLessThan(threeDaysMs + 1000);
  });
});
