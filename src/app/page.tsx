import { draftMode } from "next/headers";
import * as contentfulClient from "@/lib/contentful";
import PreviewBanner from "@/components/PreviewBanner";
import Template from "./template";
import Link from "next/link";

export default async function Home() {
  // Get the draft mode status
  const { isEnabled } = draftMode();

  // Fetch all content types
  let contentTypes = [];
  let error = null;

  try {
    contentTypes = await contentfulClient.fetchContentTypes();
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "An error occurred fetching content types";
    console.error("Error fetching content types:", e);
  }

  return (
    <Template isPreviewActive={isEnabled}>
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contentful Live Preview
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse and preview your Contentful content in real-time
            </p>
          </div>

          <PreviewBanner isPreview={isEnabled} />

          {/* Error State */}
          {error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading content types
                  </h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                  <p className="mt-2 text-sm text-red-700">
                    Please check your <code className="bg-red-100 px-1 rounded">.env.local</code> file and ensure your Contentful credentials are correct.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Content Types Grid */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Content Types ({contentTypes.length})
                </h2>
                
                {contentTypes.length === 0 ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-700">
                      No content types found in your Contentful space. Create some content types in Contentful to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contentTypes.map((contentType) => (
                      <Link
                        key={contentType.sys.id}
                        href={`/content-type/${contentType.sys.id}`}
                        className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-500"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {contentType.name}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {contentType.sys.id}
                          </span>
                        </div>
                        
                        {contentType.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {contentType.description}
                          </p>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          {contentType.fields?.length || 0} fields
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Setup Instructions */}
              {contentTypes.length === 0 && !error && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mt-8">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Getting Started
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Configure your environment variables in <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
                    <li>Create content types in your Contentful space</li>
                    <li>Add some entries to your content types</li>
                    <li>Refresh this page to see your content</li>
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </Template>
  );
}
