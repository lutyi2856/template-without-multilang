/**
 * GET /api/our-works — пагинация списка работ для кнопки «Загрузить ещё»
 *
 * Query: first (default 4), after (cursor), category
 */
import { NextResponse } from "next/server";
import { getOurWorksConnection } from "@/lib/wordpress";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const first = Math.min(Number(searchParams.get("first")) || 4, 50);
  const after = searchParams.get("after") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const filters =
    category && category.trim()
      ? { categorySlug: category.trim() }
      : undefined;

  try {
    const { works, pageInfo } = await getOurWorksConnection(
      first,
      after,
      filters
    );
    return NextResponse.json({ works, pageInfo });
  } catch (error) {
    console.error("[api/our-works] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch our-works" },
      { status: 500 }
    );
  }
}
