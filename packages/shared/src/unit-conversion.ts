const GRAMS_PER_OUNCE = 28.3495;
const MILLILITERS_PER_FLUID_OUNCE = 29.5735;

export const gramsToOunces = (grams: number): number => grams / GRAMS_PER_OUNCE;
export const ouncesToGrams = (ounces: number): number => ounces * GRAMS_PER_OUNCE;

export const millilitersToFluidOunces = (ml: number): number => ml / MILLILITERS_PER_FLUID_OUNCE;
export const fluidOuncesToMilliliters = (oz: number): number => oz * MILLILITERS_PER_FLUID_OUNCE;

export const roundTo = (value: number, places = 2): number => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};
