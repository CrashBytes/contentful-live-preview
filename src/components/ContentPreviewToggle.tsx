"use client";

import { useState } from "react";
import FieldRenderer from "./FieldRenderer";

interface ContentPreviewProps {
  entry: any;
  contentTypeName: string;
}

export default function ContentPreviewToggle({ entry, contentTypeName }: ContentPreviewProps) {
  const [viewMode, setViewMode] = useState<"preview" | "debug">("preview");

  return (
    <div>
      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => setViewMode("preview")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "preview"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setViewMode("debug")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "debug"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Debug
        </button>
      </div>

      {/* Content Display */}
      {viewMode === "preview" ? (
        <ContentPreview entry={entry} contentTypeName={contentTypeName} />
      ) : (
        <DebugView entry={entry} />
      )}
    </div>
  );
}

function ContentPreview({ entry, contentTypeName }: ContentPreviewProps) {
  const fields = entry.fields || {};
  
  // Smart field detection
  const title = findField(fields, ["title", "name", "heading", "label"]);
  const body = findField(fields, ["body", "content", "description", "text", "richText"]);
  const image = findField(fields, ["image", "heroImage", "featuredImage", "thumbnail", "photo"]);
  const author = findField(fields, ["author", "createdBy", "writer"]);
  const date = findField(fields, ["publishDate", "date", "createdAt", "publishedAt"]);
  const excerpt = findField(fields, ["excerpt", "summary", "description"]);

  return (
    <article className="max-w-4xl mx-auto">
      {/* Hero Image */}
      {image && (
        <div className="mb-8 -mx-4 sm:mx-0 sm:rounded-lg overflow-hidden">
          <FieldRenderer fieldName="image" fieldValue={image} />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {/* Content Type Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {contentTypeName}
          </span>
        </div>

        {/* Title */}
        {title && (
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {renderFieldValue(title)}
          </h1>
        )}

        {/* Excerpt */}
        {excerpt && excerpt !== title && (
          <p className="text-xl text-gray-600 leading-relaxed">
            {renderFieldValue(excerpt)}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500">
          {author && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{renderFieldValue(author)}</span>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(date)}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      {body && (
        <div className="prose prose-lg max-w-none mb-12">
          <FieldRenderer fieldName="content" fieldValue={body} />
        </div>
      )}

      {/* Additional Fields */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(fields)
            .filter(([key]) => !["title", "name", "heading", "label", "body", "content", "description", "text", "richText", "image", "heroImage", "featuredImage", "thumbnail", "photo", "author", "createdBy", "writer", "publishDate", "date", "createdAt", "publishedAt", "excerpt", "summary"].includes(key))
            .map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </dt>
                <dd className="text-gray-900">
                  <FieldRenderer fieldName={key} fieldValue={value} />
                </dd>
              </div>
            ))}
        </div>
      </div>
    </article>
  );
}

function DebugView({ entry }: { entry: any }) {
  const fields = entry.fields || {};

  return (
    <div className="space-y-6">
      {Object.entries(fields).map(([fieldName, fieldValue]) => (
        <div key={fieldName} className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-blue-600">{fieldName}</span>
            <span className="text-xs text-gray-500 font-normal">
              ({typeof fieldValue})
            </span>
          </h3>
          <div className="text-gray-700">
            <FieldRenderer fieldName={fieldName} fieldValue={fieldValue} />
          </div>
          {/* Show raw JSON for debugging */}
          <details className="mt-4">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 font-medium">
              ▶ Show raw JSON
            </summary>
            <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96 border border-gray-200">
              {JSON.stringify(fieldValue, null, 2)}
            </pre>
          </details>
        </div>
      ))}
    </div>
  );
}

// Helper functions
function findField(fields: Record<string, any>, possibleNames: string[]): any {
  for (const name of possibleNames) {
    if (fields[name] !== undefined && fields[name] !== null) {
      return fields[name];
    }
  }
  return null;
}

function renderFieldValue(field: any): string {
  if (typeof field === "string") return field;
  if (typeof field === "number") return field.toString();
  if (field?.fields?.title) return field.fields.title;
  if (field?.fields?.name) return field.fields.name;
  if (Array.isArray(field) && field.length > 0) {
    return field.map(renderFieldValue).join(", ");
  }
  return String(field);
}

function formatDate(dateField: any): string {
  let date: Date;
  
  if (typeof dateField === "string") {
    date = new Date(dateField);
  } else if (dateField instanceof Date) {
    date = dateField;
  } else {
    return String(dateField);
  }
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
