import { draftMode } from "next/headers";
import * as contentfulClient from "@/lib/contentful";
import PreviewBanner from "@/components/PreviewBanner";
import ContentRenderer from "@/components/ContentRenderer";
import Template from "./template";
import EnvDebug from "@/components/EnvDebug";
import ContentfulTest from "@/components/ContentfulTest";

export default async function Home() {
  // Get the draft mode status
  const { isEnabled } = draftMode();

  // Get environment variables for debugging
  const spaceId = process.env.CONTENTFUL_SPACE_ID || "";
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "";

  // We'll handle errors better here
  let homepage = null;
  let error = null;

  try {
    // Fetch the homepage content (with preview data if in draft mode)
    homepage = await contentfulClient.fetchEntry("homepage", isEnabled);
  } catch (e) {
    error = e.message || "An error occurred fetching content";
    console.error("Error fetching homepage:", e);
  }

  const entryId = homepage?.sys?.id || "";

  return (
    <Template isPreviewActive={isEnabled}>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between">
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <h2 className="text-xl font-bold">Error loading content</h2>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-6">
                {homepage?.fields?.title ||
                  "Welcome to Contentful Live Preview"}
              </h1>

              {homepage?.fields?.description && (
                <p className="text-xl mb-6">{homepage.fields.description}</p>
              )}

              {homepage?.fields?.content && (
                <ContentRenderer
                  content={homepage.fields.content}
                  entryId={entryId}
                />
              )}
            </>
          )}

          <ContentfulTest initialError={error} />
          <EnvDebug spaceId={spaceId} environment={environment} />
          <PreviewBanner isPreview={isEnabled} />
        </div>
      </main>
    </Template>
  );
}
