/**
 * GET /api/promotions — пагинация списка акций для кнопки «Загрузить ещё»
 *
 * Query: first (default 12), after (cursor), category
 */
import { NextResponse } from "next/server";
import { getPromotionsConnection } from "@/lib/wordpress";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const first = Math.min(Number(searchParams.get("first")) || 12, 50);
  const after = searchParams.get("after") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const filters =
    category && category.trim()
      ? { categorySlug: category.trim() }
      : undefined;

  try {
    const { promotions, pageInfo } = await getPromotionsConnection(
      first,
      after,
      filters
    );
    return NextResponse.json({ promotions, pageInfo });
  } catch (error) {
    console.error("[api/promotions] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}
