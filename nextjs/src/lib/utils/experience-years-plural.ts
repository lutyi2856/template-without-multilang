/**
 * Склонение слова "год" по числу (русская грамматика).
 * 1 год, 2–4 года, 5–20 лет, 21 год, 22–24 года, 25–30 лет, ...
 */

export type YearsWord = "год" | "года" | "лет";

/**
 * Возвращает правильную форму слова "год" для числа n.
 * @param n - количество лет (целое неотрицательное)
 */
export function getYearsWord(n: number): YearsWord {
  const num = Math.abs(Math.floor(n));
  const mod10 = num % 10;
  const mod100 = num % 100;

  if (num === 1 || (mod10 === 1 && mod100 !== 11)) {
    return "год";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "года";
  }
  return "лет";
}
