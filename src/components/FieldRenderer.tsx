"use client";

import { Document } from "@contentful/rich-text-types";
import RichText from "./RichText";
import ContentfulImage from "./ContentfulImage";
import Link from "next/link";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

interface FieldRendererProps {
  fieldName: string;
  fieldValue: unknown;
}

export default function FieldRenderer({
  fieldName,
  fieldValue,
}: FieldRendererProps) {
  // Handle null or undefined values
  if (fieldValue === null || fieldValue === undefined) {
    return (
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
        <div className="text-gray-500 italic">No value</div>
      </div>
    );
  }

  // Handle Rich Text (Document)
  if (
    isRecord(fieldValue) &&
    (fieldValue.nodeType === "document" || fieldValue.content)
  ) {
    return (
      <div className="mb-6">
        <div className="font-semibold text-gray-700 mb-2">{fieldName}</div>
        <div className="prose max-w-none">
          <RichText content={fieldValue as Document} />
        </div>
      </div>
    );
  }

  // Handle Asset (Images, Files)
  if (
    isRecord(fieldValue) &&
    isRecord(fieldValue.sys) &&
    (fieldValue.sys.type === "Asset" || fieldValue.sys.linkType === "Asset")
  ) {
    const asset = (fieldValue.fields || fieldValue) as Record<string, unknown>;
    const file = asset.file as Record<string, unknown> | undefined;

    if (!file) {
      return (
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
          <div className="text-gray-500 italic">Asset (no file)</div>
        </div>
      );
    }

    const contentType = file.contentType as string | undefined;
    const isImage = contentType?.startsWith("image/");
    const fileUrl = file.url as string;
    const fileDetails = file.details as Record<string, unknown> | undefined;
    const fileSize = fileDetails?.size as number | undefined;

    return (
      <div className="mb-6">
        <div className="font-semibold text-gray-700 mb-2">{fieldName}</div>
        {asset.title && (
          <div className="text-sm font-medium text-gray-600 mb-1">
            {String(asset.title)}
          </div>
        )}
        {asset.description && (
          <div className="text-sm text-gray-500 mb-2">{String(asset.description)}</div>
        )}
        <div>
          {isImage ? (
            <ContentfulImage
              asset={fieldValue}
              alt={String(asset.title || asset.description || fieldName)}
              className="rounded-lg shadow-md"
            />
          ) : (
            <a
              href={`https:${fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {String(asset.title || asset.fileName || "Download file")}
              <span className="text-sm text-gray-500">
                ({((fileSize ?? 0) / 1024).toFixed(1)} KB)
              </span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // Handle Entry References (Links to other entries)
  if (
    isRecord(fieldValue) &&
    isRecord(fieldValue.sys) &&
    (fieldValue.sys.type === "Entry" || fieldValue.sys.linkType === "Entry")
  ) {
    const entryId = fieldValue.sys.id as string;
    const entryFields = fieldValue.fields as Record<string, unknown> | undefined;

    return (
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
        <div>
          <Link
            href={`/entry/${entryId}`}
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            {String(entryFields?.title ||
              entryFields?.name ||
              `Entry: ${entryId.slice(0, 8)}...`)}
          </Link>
        </div>
      </div>
    );
  }

  // Handle Arrays
  if (Array.isArray(fieldValue)) {
    if (fieldValue.length === 0) {
      return (
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
          <div className="text-gray-500 italic">Empty array</div>
        </div>
      );
    }

    // Check if array contains entries or assets
    const firstItem = fieldValue[0];
    if (
      isRecord(firstItem) &&
      isRecord(firstItem.sys) &&
      (firstItem.sys.type === "Entry" || firstItem.sys.type === "Asset")
    ) {
      return (
        <div className="mb-6">
          <div className="font-semibold text-gray-700 mb-2">
            {fieldName} ({fieldValue.length} items)
          </div>
          <div className="space-y-2">
            {fieldValue.map((item: unknown, index: number) => {
              const itemId = isRecord(item) && isRecord((item as Record<string, unknown>).sys)
                ? String((item as Record<string, unknown>).sys)
                : null;
              return (
                <FieldRenderer
                  key={itemId || index}
                  fieldName={`Item ${index + 1}`}
                  fieldValue={item}
                />
              );
            })}
          </div>
        </div>
      );
    }

    // Simple array of primitives
    return (
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
        <div>
          <ul className="list-disc list-inside space-y-1">
            {fieldValue.map((item: unknown, index: number) => (
              <li key={index} className="text-gray-800">
                {String(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Handle Location (Lat/Lon)
  if (
    typeof fieldValue === "object" &&
    fieldValue !== null &&
    "lat" in fieldValue &&
    "lon" in fieldValue
  ) {
    return (
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
        <div className="text-gray-800">
          Latitude: {String((fieldValue as Record<string, unknown>).lat)}, Longitude: {String((fieldValue as Record<string, unknown>).lon)}
        </div>
      </div>
    );
  }

  // Handle Date/DateTime
  if (typeof fieldValue === "string" && fieldValue.match(/^\d{4}-\d{2}-\d{2}/)) {
    const date = new Date(fieldValue);
    return (
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
        <div className="text-gray-800">{date.toLocaleString()}</div>
      </div>
    );
  }

  // Handle Boolean
  if (typeof fieldValue === "boolean") {
    return (
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
        <div className="text-gray-800">{fieldValue ? "Yes" : "No"}</div>
      </div>
    );
  }

  // Handle Numbers
  if (typeof fieldValue === "number") {
    return (
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
        <div className="text-gray-800">{fieldValue.toLocaleString()}</div>
      </div>
    );
  }

  // Handle Object (JSON)
  if (typeof fieldValue === "object") {
    return (
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
        <div>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
            {JSON.stringify(fieldValue, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Handle String and everything else
  return (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
      <div className="text-gray-800 whitespace-pre-wrap">{String(fieldValue)}</div>
    </div>
  );
}
