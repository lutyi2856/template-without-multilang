import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchAllContentTypes } from "@/lib/wordpress/search";

const querySchema = z.object({
  q: z
    .string()
    .min(1)
    .transform((s) => s.trim())
    .refine((s) => s.length >= 3, "Минимум 3 символа для поиска"),
});

/**
 * GET /api/search/suggestions?q=...
 *
 * Autocomplete для поиска — подсказки при вводе (3+ символа)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";

  const result = querySchema.safeParse({ q });
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid query", details: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const data = await searchAllContentTypes(result.data.q, 5);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
