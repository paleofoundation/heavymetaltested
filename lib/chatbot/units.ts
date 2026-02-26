/**
 * Unit conversion helper for heavy metal lab results.
 * Covers the most common units seen in water/food/blood testing.
 */

interface ConversionResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  fromValue: number;
  explanation: string;
}

const CONVERSIONS: Record<string, Record<string, number>> = {
  // Concentration: mass per volume (water / blood)
  'mg/l': { 'µg/l': 1000, ppb: 1000, ppm: 1, 'mg/kg': 1, 'µg/dl': 100 },
  'µg/l': { 'mg/l': 0.001, ppb: 1, ppm: 0.001, 'µg/dl': 0.1 },
  ppb: { 'µg/l': 1, 'mg/l': 0.001, ppm: 0.001, 'µg/dl': 0.1 },
  ppm: { 'mg/l': 1, 'µg/l': 1000, ppb: 1000, 'mg/kg': 1 },
  'µg/dl': { 'µg/l': 10, ppb: 10, 'mg/l': 0.01 },

  // Food concentration
  'mg/kg': { ppm: 1, 'µg/kg': 1000, 'mg/l': 1 },
  'µg/kg': { ppb: 1, 'mg/kg': 0.001 },
};

const UNIT_ALIASES: Record<string, string> = {
  'ug/l': 'µg/l',
  'ug/dl': 'µg/dl',
  'ug/kg': 'µg/kg',
  'micrograms per liter': 'µg/l',
  'micrograms per deciliter': 'µg/dl',
  'milligrams per liter': 'mg/l',
  'milligrams per kilogram': 'mg/kg',
  'parts per billion': 'ppb',
  'parts per million': 'ppm',
};

function normalize(unit: string): string {
  const lower = unit.toLowerCase().trim();
  return UNIT_ALIASES[lower] || lower;
}

export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
): ConversionResult | null {
  const from = normalize(fromUnit);
  const to = normalize(toUnit);

  if (from === to) {
    return {
      value,
      fromUnit: from,
      toUnit: to,
      fromValue: value,
      explanation: `${value} ${from} is already in ${to}.`,
    };
  }

  const factor = CONVERSIONS[from]?.[to];
  if (factor !== undefined) {
    const result = value * factor;
    return {
      value: Math.round(result * 1e6) / 1e6,
      fromUnit: from,
      toUnit: to,
      fromValue: value,
      explanation: `${value} ${from} = ${result} ${to} (multiply by ${factor})`,
    };
  }

  // Try reverse
  const reverseFactor = CONVERSIONS[to]?.[from];
  if (reverseFactor !== undefined) {
    const result = value / reverseFactor;
    return {
      value: Math.round(result * 1e6) / 1e6,
      fromUnit: from,
      toUnit: to,
      fromValue: value,
      explanation: `${value} ${from} = ${result} ${to} (divide by ${reverseFactor})`,
    };
  }

  return null;
}

export function getSupportedUnits(): string[] {
  return [...new Set([...Object.keys(CONVERSIONS), ...Object.keys(UNIT_ALIASES)])];
}
