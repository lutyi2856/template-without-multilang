/**
 * POST /api/jetform-submit — proxy for JetFormBuilder Formless REST endpoints
 *
 * Accepts form data + optional `_formEndpoint` (e.g. "jet-fb/v1/sidebar-calc").
 * Defaults to callback endpoint when `_formEndpoint` is omitted.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_URL =
  process.env.NEXT_PUBLIC_WP_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://localhost:8002";
const DEFAULT_ENDPOINT = "jet-fb/v1/callback";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const endpoint = body._formEndpoint || DEFAULT_ENDPOINT;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _formEndpoint, ...formData } = body;

    const targetUrl = `${WP_URL.replace(/\/$/, "")}/wp-json/${endpoint}`;

    const wpResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await wpResponse.json().catch(() => ({}));

    if (!wpResponse.ok) {
      return NextResponse.json(
        { error: data.message || data.code || "Form submission failed" },
        { status: wpResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/jetform-submit] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
