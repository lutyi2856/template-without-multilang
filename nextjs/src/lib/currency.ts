/**
 * Currency symbols mapping for frontend display.
 * UZS (сум) — узбекский сум.
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: "₽",
  UZS: "сум",
  USD: "$",
  EUR: "€",
};

/**
 * Returns display symbol for currency code.
 * Falls back to code itself if unknown.
 */
export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}
