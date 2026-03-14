/**
 * Парсеры и cache для фильтров страницы врачей
 *
 * URL: ?category=slug&clinic=slug&page=1
 * Парсеры используются в useQueryStates (client) и createSearchParamsCache (server)
 */

import { parseAsString, parseAsInteger } from "nuqs";

export const doctorsFilterParsers = {
  category: parseAsString,
  clinic: parseAsString,
  page: parseAsInteger.withDefault(1),
};

export type DoctorsFiltersParsed = {
  category: string | null;
  clinic: string | null;
  page: number;
};
