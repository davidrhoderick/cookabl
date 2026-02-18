import { describe, expect, it } from "vitest";
import { createId, createToken } from "./id";

describe("createId", () => {
  it("returns a valid UUID string", () => {
    const id = createId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 50 }, () => createId()));
    expect(ids.size).toBe(50);
  });
});

describe("createToken", () => {
  it("returns a 32-character hex string", () => {
    const token = createToken();
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });

  it("returns unique values", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => createToken()));
    expect(tokens.size).toBe(50);
  });
});
