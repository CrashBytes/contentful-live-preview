import { draftMode } from "next/headers";
import * as contentfulClient from "@/lib/contentful";
import PreviewBanner from "@/components/PreviewBanner";
import Template from "../../template";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ContentTypePage({ params }: PageProps) {
  const { id } = params;
  const { isEnabled } = draftMode();

  // Fetch the content type information
  let contentTypes = [];
  let contentType = null;
  let entries = [];
  let error = null;

  try {
    contentTypes = await contentfulClient.fetchContentTypes();
    contentType = contentTypes.find((ct) => ct.sys.id === id);
    
    if (contentType) {
      entries = await contentfulClient.fetchEntries(id, isEnabled);
    } else {
      error = `Content type "${id}" not found`;
    }
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "An error occurred fetching entries";
    console.error("Error fetching entries:", e);
  }

  return (
    <Template isPreviewActive={isEnabled}>
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Content Types
                </Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {contentType?.name || id}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {contentType?.name || id}
            </h1>
            {contentType?.description && (
              <p className="text-lg text-gray-600">{contentType.description}</p>
            )}
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
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Entries Grid */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Entries ({entries.length})
                </h2>

                {entries.length === 0 ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-700">
                      No entries found for this content type. Create some entries in Contentful to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entries.map((entry) => {
                      const entryId = entry.sys.id;
                      const fields = entry.fields || {};
                      
                      // Try to find a good title field
                      const title =
                        fields.title ||
                        fields.name ||
                        fields.heading ||
                        fields.label ||
                        `Entry ${entryId.slice(0, 8)}`;

                      // Try to find a description or summary
                      const description =
                        fields.description ||
                        fields.summary ||
                        fields.excerpt ||
                        "";

                      return (
                        <Link
                          key={entryId}
                          href={`/entry/${entryId}`}
                          className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-500"
                        >
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {String(title)}
                            </h3>
                            <p className="text-xs text-gray-500 font-mono">
                              {entryId}
                            </p>
                          </div>

                          {description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {String(description)}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Updated: {new Date(entry.sys.updatedAt).toLocaleDateString()}
                            </span>
                            <span className="text-blue-600 hover:text-blue-800">
                              View →
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </Template>
  );
}
