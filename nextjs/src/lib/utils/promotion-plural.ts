/**
 * Склонение слова "акция" по числу (русская грамматика).
 * 1 акция, 2-4 акции, 5-20 акций, 21 акция, 22-24 акции, 25-30 акций, ...
 */

export type PromotionWord = "акция" | "акции" | "акций";

/**
 * Возвращает правильную форму слова "акция" для числа n.
 * @param count - количество (целое неотрицательное)
 */
export function getPromotionWord(count: number): PromotionWord {
  const n = Math.abs(Math.floor(count));
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (n === 1 || (mod10 === 1 && mod100 !== 11)) {
    return "акция";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "акции";
  }
  return "акций";
}
