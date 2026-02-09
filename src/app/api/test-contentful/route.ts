import { NextResponse } from "next/server";
import { createClient } from "contentful";
import { env } from "@/lib/env";

export async function GET() {
  try {
    // Create Contentful client directly here to test
    const client = createClient({
      space: env.CONTENTFUL_SPACE_ID,
      accessToken: env.CONTENTFUL_DELIVERY_TOKEN,
      environment: env.CONTENTFUL_ENVIRONMENT,
    });

    // Test the connection by getting content types
    const contentTypes = await client.getContentTypes();

    // Return success response
    return NextResponse.json({
      spaceId: env.CONTENTFUL_SPACE_ID,
      environment: env.CONTENTFUL_ENVIRONMENT,
      contentTypes: contentTypes.items.map((ct) => ct.name),
    });
  } catch (error: unknown) {
    console.error("Contentful test error:", error);

    const message = error instanceof Error ? error.message : "An error occurred while testing Contentful connection";
    const stack = error instanceof Error ? error.stack : undefined;

    // Return error response
    return NextResponse.json(
      {
        error: message,
        stack: env.NODE_ENV === "development" ? stack : undefined,
      },
      { status: 500 }
    );
  }
}
