/**
 * Server-only: createSearchParamsCache и валидация Zod для фильтров врачей
 *
 * Использовать в page.tsx (Server Component)
 * Парсеры из nuqs/server — серверные, withDefault() не вызывает client-only код.
 * После parse — filtersSchema.safeParse() для безопасных дефолтов при ошибке.
 */

import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
} from "nuqs/server";
import { z } from "zod";

const doctorsFilterParsers = {
  category: parseAsString,
  clinic: parseAsString,
  page: parseAsInteger.withDefault(1),
};

export const doctorsSearchParamsCache = createSearchParamsCache(
  doctorsFilterParsers
);

const doctorsFiltersSchema = z.object({
  category: z.string().optional(),
  clinic: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type DoctorsFiltersParsed = z.infer<typeof doctorsFiltersSchema>;

/**
 * Валидация фильтров после nuqs parse. При ошибке возвращает безопасные дефолты.
 */
export function validateDoctorsFilters(
  parsed: Record<string, unknown>
): { category?: string; clinic?: string; page: number } {
  const result = doctorsFiltersSchema.safeParse(parsed);
  if (!result.success) {
    return { page: 1 };
  }
  return {
    category: result.data.category ?? undefined,
    clinic: result.data.clinic ?? undefined,
    page: result.data.page,
  };
}
