import { describe, expect, it } from "vitest";
import { assertCsrf } from "./csrf";

const createRequest = (method: string, origin?: string): Request => {
  const headers = new Headers();
  if (origin) {
    headers.set("origin", origin);
  }
  return new Request("https://cookabl.app/auth/login", { method, headers });
};

describe("assertCsrf", () => {
  it("skips validation when appUrl is not set", () => {
    expect(() => assertCsrf(createRequest("POST"), undefined)).not.toThrow();
  });

  it("skips GET requests", () => {
    expect(() => assertCsrf(createRequest("GET"), "https://cookabl.app")).not.toThrow();
  });

  it("skips HEAD requests", () => {
    expect(() => assertCsrf(createRequest("HEAD"), "https://cookabl.app")).not.toThrow();
  });

  it("skips OPTIONS requests", () => {
    expect(() => assertCsrf(createRequest("OPTIONS"), "https://cookabl.app")).not.toThrow();
  });

  it("throws when origin header is missing on POST", () => {
    expect(() => assertCsrf(createRequest("POST"), "https://cookabl.app")).toThrow(
      "Missing origin header",
    );
  });

  it("throws when origin does not match appUrl", () => {
    expect(() =>
      assertCsrf(createRequest("POST", "https://evil.com"), "https://cookabl.app"),
    ).toThrow("Invalid origin");
  });

  it("passes when origin matches appUrl", () => {
    expect(() =>
      assertCsrf(createRequest("POST", "https://cookabl.app"), "https://cookabl.app"),
    ).not.toThrow();
  });
});
