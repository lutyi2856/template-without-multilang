/**
 * Склонение слова "врач" по числу (русская грамматика).
 * 1 врач, 2-4 врача, 5-20 врачей, 21 врач, 22-24 врача, 25-30 врачей, ...
 */

export type DoctorWord = "врач" | "врача" | "врачей";

/**
 * Возвращает правильную форму слова "врач" для числа n.
 * @param count - количество (целое неотрицательное)
 */
export function getDoctorWord(count: number): DoctorWord {
  const n = Math.abs(Math.floor(count));
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (n === 1 || (mod10 === 1 && mod100 !== 11)) {
    return "врач";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "врача";
  }
  return "врачей";
}
