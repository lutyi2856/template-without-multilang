/**
 * Склонение слова "отзыв" по числу (русская грамматика).
 * 1 отзыв, 2-4 отзыва, 5-20 отзывов, 21 отзыв, 22-24 отзыва, 25-30 отзывов, ...
 */

export type ReviewWord = "отзыв" | "отзыва" | "отзывов";

/**
 * Возвращает правильную форму слова "отзыв" для числа n.
 * @param count - количество (целое неотрицательное)
 */
export function getReviewWord(count: number): ReviewWord {
  const n = Math.abs(Math.floor(count));
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (n === 1 || (mod10 === 1 && mod100 !== 11)) {
    return "отзыв";
  }
  if ((mod10 >= 2 && mod10 <= 4) && (mod100 < 12 || mod100 > 14)) {
    return "отзыва";
  }
  return "отзывов";
}

/**
 * Форматирует количество отзывов: число + пробел + слово (например "10 000 отзывов").
 * @param count - количество отзывов
 */
export function formatReviewsCount(count: number): string {
  const n = Math.floor(count);
  const word = getReviewWord(n);
  const formatted = n.toLocaleString("ru-RU");
  return `${formatted} ${word}`;
}
