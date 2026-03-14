/**
 * GET /api/doctors — пагинация списка врачей для кнопки «Загрузить ещё»
 *
 * Query: first (default 12), after (cursor), category, clinic
 */
import { NextResponse } from "next/server";
import { getDoctorsConnection } from "@/lib/wordpress";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const first = Math.min(Number(searchParams.get("first")) || 12, 50);
  const after = searchParams.get("after") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const clinic = searchParams.get("clinic") ?? undefined;

  const filters =
    category || clinic
      ? {
          categorySlug: category || undefined,
          clinicSlug: clinic || undefined,
        }
      : undefined;

  try {
    const { doctors, pageInfo } = await getDoctorsConnection(
      first,
      after,
      filters
    );
    return NextResponse.json({ doctors, pageInfo });
  } catch (error) {
    console.error("[api/doctors] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
