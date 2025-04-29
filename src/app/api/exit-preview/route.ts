import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const redirectPath = searchParams.get("redirect") || "/";

  // Disable draft mode
  draftMode().disable();

  // Redirect to the homepage or specified path
  redirect(redirectPath);
}
