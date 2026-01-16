import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // Check the secret
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  // Check if slug exists
  if (!slug) {
    return new Response("Missing slug parameter", { status: 400 });
  }

  // Enable draft mode
  draftMode().enable();

  // Redirect to the path from the fetched entry
  // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
  const url = slug === "homepage" ? "/" : `/${slug}`;

  redirect(url);
}
