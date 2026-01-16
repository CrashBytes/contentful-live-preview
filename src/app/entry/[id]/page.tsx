import { draftMode } from "next/headers";
import * as contentfulClient from "@/lib/contentful";
import PreviewBanner from "@/components/PreviewBanner";
import FieldRenderer from "@/components/FieldRenderer";
import Template from "../../template";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EntryPage({ params }: PageProps) {
  const { id } = params;
  const { isEnabled } = draftMode();

  // Fetch the entry
  let entry = null;
  let error = null;
  let contentType = null;

  try {
    entry = await contentfulClient.fetchEntry(id, isEnabled);
    
    if (entry) {
      // Fetch content type information
      const contentTypes = await contentfulClient.fetchContentTypes();
      contentType = contentTypes.find(
        (ct: any) => ct.sys.id === entry.sys.contentType.sys.id
      );
    } else {
      error = `Entry "${id}" not found`;
    }
  } catch (e: any) {
    error = e.message || "An error occurred fetching entry";
    console.error("Error fetching entry:", e);
  }

  const contentTypeId = entry?.sys?.contentType?.sys?.id;
  const fields = entry?.fields || {};
  const fieldKeys = Object.keys(fields);

  // Try to find a good title
  const title =
    fields.title ||
    fields.name ||
    fields.heading ||
    fields.label ||
    `Entry ${id.slice(0, 12)}`;

  return (
    <Template isPreviewActive={isEnabled}>
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
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
              {contentType && contentTypeId && (
                <li>
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
                    <Link
                      href={`/content-type/${contentTypeId}`}
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                    >
                      {contentType.name}
                    </Link>
                  </div>
                </li>
              )}
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
                    Entry
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <PreviewBanner isPreview={isEnabled} />

          {/* Error State */}
          {error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
          ) : entry ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Entry Header */}
              <div className="bg-gray-800 text-white px-6 py-4">
                <h1 className="text-3xl font-bold mb-2">{String(title)}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className="font-mono">{id}</span>
                  {contentType && (
                    <>
                      <span>•</span>
                      <span>{contentType.name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>
                    Updated: {new Date(entry.sys.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Entry Fields */}
              <div className="p-6">
                {fieldKeys.length === 0 ? (
                  <p className="text-gray-500 italic">No fields in this entry</p>
                ) : (
                  <dl className="space-y-2">
                    {fieldKeys.map((fieldKey) => (
                      <FieldRenderer
                        key={fieldKey}
                        fieldName={fieldKey}
                        fieldValue={fields[fieldKey]}
                      />
                    ))}
                  </dl>
                )}
              </div>

              {/* Metadata Section */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Metadata
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500 font-medium">Entry ID</dt>
                    <dd className="font-mono text-gray-900">{entry.sys.id}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Content Type</dt>
                    <dd className="text-gray-900">
                      {contentType?.name || contentTypeId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Created</dt>
                    <dd className="text-gray-900">
                      {new Date(entry.sys.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Last Updated</dt>
                    <dd className="text-gray-900">
                      {new Date(entry.sys.updatedAt).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Revision</dt>
                    <dd className="text-gray-900">{entry.sys.revision}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Locale</dt>
                    <dd className="text-gray-900">
                      {entry.sys.locale || "Default"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </Template>
  );
}
