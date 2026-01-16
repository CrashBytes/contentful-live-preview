import { NextResponse } from "next/server";
import { createClient } from "contentful";

export async function GET() {
  try {
    // Log environment variables
    console.log("API - CONTENTFUL_SPACE_ID:", process.env.CONTENTFUL_SPACE_ID);
    console.log(
      "API - CONTENTFUL_ENVIRONMENT:",
      process.env.CONTENTFUL_ENVIRONMENT
    );
    console.log(
      "API - CONTENTFUL_DELIVERY_TOKEN (exists):",
      !!process.env.CONTENTFUL_DELIVERY_TOKEN
    );

    // Check if required environment variables are set
    if (!process.env.CONTENTFUL_SPACE_ID) {
      return NextResponse.json(
        { error: "CONTENTFUL_SPACE_ID is not set" },
        { status: 500 }
      );
    }

    if (!process.env.CONTENTFUL_DELIVERY_TOKEN) {
      return NextResponse.json(
        { error: "CONTENTFUL_DELIVERY_TOKEN is not set" },
        { status: 500 }
      );
    }

    // Create Contentful client directly here to test
    const client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID,
      accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
      environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
    });

    // Test the connection by getting content types
    const contentTypes = await client.getContentTypes();

    // Return success response
    return NextResponse.json({
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
      contentTypes: contentTypes.items.map((ct) => ct.name),
    });
  } catch (error: any) {
    console.error("Contentful test error:", error);

    // Return error response
    return NextResponse.json(
      {
        error:
          error.message ||
          "An error occurred while testing Contentful connection",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
