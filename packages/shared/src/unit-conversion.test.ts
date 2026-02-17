import { describe, expect, it } from "vitest";
import {
  gramsToOunces,
  ouncesToGrams,
  millilitersToFluidOunces,
  fluidOuncesToMilliliters,
  roundTo,
} from "./unit-conversion";

describe("gramsToOunces", () => {
  it("converts 100g correctly", () => {
    expect(roundTo(gramsToOunces(100))).toBe(3.53);
  });

  it("returns 0 for 0g", () => {
    expect(gramsToOunces(0)).toBe(0);
  });
});

describe("ouncesToGrams", () => {
  it("converts 1oz correctly", () => {
    expect(roundTo(ouncesToGrams(1))).toBe(28.35);
  });

  it("round-trips with gramsToOunces", () => {
    const grams = 250;
    expect(roundTo(ouncesToGrams(gramsToOunces(grams)))).toBe(grams);
  });
});

describe("millilitersToFluidOunces", () => {
  it("converts 100ml correctly", () => {
    expect(roundTo(millilitersToFluidOunces(100))).toBe(3.38);
  });

  it("returns 0 for 0ml", () => {
    expect(millilitersToFluidOunces(0)).toBe(0);
  });
});

describe("fluidOuncesToMilliliters", () => {
  it("converts 1 fl oz correctly", () => {
    expect(roundTo(fluidOuncesToMilliliters(1))).toBe(29.57);
  });

  it("round-trips with millilitersToFluidOunces", () => {
    const ml = 500;
    expect(roundTo(fluidOuncesToMilliliters(millilitersToFluidOunces(ml)))).toBe(ml);
  });
});

describe("roundTo", () => {
  it("rounds to 2 decimal places by default", () => {
    expect(roundTo(3.14159)).toBe(3.14);
  });

  it("rounds to specified decimal places", () => {
    expect(roundTo(3.14159, 3)).toBe(3.142);
  });

  it("rounds to 0 decimal places", () => {
    expect(roundTo(3.7, 0)).toBe(4);
  });
});
