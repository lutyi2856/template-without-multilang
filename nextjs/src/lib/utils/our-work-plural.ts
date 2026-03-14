/**
 * Склонение слова "кейс" по числу (русская грамматика).
 * 1 кейс, 2-4 кейса, 5-20 кейсов, 21 кейс, 22-24 кейса, 25-30 кейсов, ...
 */

export type OurWorkWord = "кейс" | "кейса" | "кейсов";

/**
 * Возвращает правильную форму слова "кейс" для числа n.
 * @param count - количество (целое неотрицательное)
 */
export function getOurWorkWord(count: number): OurWorkWord {
  const n = Math.abs(Math.floor(count));
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (n === 1 || (mod10 === 1 && mod100 !== 11)) {
    return "кейс";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "кейса";
  }
  return "кейсов";
}
