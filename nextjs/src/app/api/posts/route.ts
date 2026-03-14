/**
 * GET /api/posts — пагинация списка постов для кнопки «Загрузить ещё»
 *
 * Query: first (default 6), after (cursor), category
 */
import { NextResponse } from "next/server";
import { getPostsConnection } from "@/lib/wordpress";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const first = Math.min(Number(searchParams.get("first")) || 6, 50);
  const after = searchParams.get("after") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const filters =
    category && category.trim()
      ? { categorySlug: category.trim() }
      : undefined;

  try {
    const { posts, pageInfo } = await getPostsConnection(first, after, filters);
    return NextResponse.json({ posts, pageInfo });
  } catch (error) {
    console.error("[api/posts] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
