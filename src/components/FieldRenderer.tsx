"use client";

import { Document } from "@contentful/rich-text-types";
import RichText from "./RichText";
import ContentfulImage from "./ContentfulImage";
import Link from "next/link";

interface FieldRendererProps {
  fieldName: string;
  fieldValue: any;
  fieldType?: string;
}

export default function FieldRenderer({
  fieldName,
  fieldValue,
  fieldType,
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
    fieldValue.nodeType === "document" ||
    (typeof fieldValue === "object" && fieldValue.content)
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
    fieldValue.sys &&
    (fieldValue.sys.type === "Asset" || fieldValue.sys.linkType === "Asset")
  ) {
    const asset = fieldValue.fields || fieldValue;
    const file = asset.file;

    if (!file) {
      return (
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
          <div className="text-gray-500 italic">Asset (no file)</div>
        </div>
      );
    }

    const isImage = file.contentType?.startsWith("image/");

    return (
      <div className="mb-6">
        <div className="font-semibold text-gray-700 mb-2">{fieldName}</div>
        <div>
          {isImage ? (
            <ContentfulImage
              src={file.url}
              alt={asset.title || asset.description || fieldName}
              width={file.details?.image?.width || 800}
              height={file.details?.image?.height || 600}
            />
          ) : (
            <a
              href={file.url}
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
              {asset.title || asset.fileName || "Download file"}
              <span className="text-sm text-gray-500">
                ({(file.details?.size / 1024).toFixed(1)} KB)
              </span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // Handle Entry References (Links to other entries)
  if (
    fieldValue.sys &&
    (fieldValue.sys.type === "Entry" || fieldValue.sys.linkType === "Entry")
  ) {
    const entryId = fieldValue.sys.id;
    const entryFields = fieldValue.fields;

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
            {entryFields?.title ||
              entryFields?.name ||
              `Entry: ${entryId.slice(0, 8)}...`}
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
    if (firstItem?.sys?.type === "Entry" || firstItem?.sys?.type === "Asset") {
      return (
        <div className="mb-6">
          <div className="font-semibold text-gray-700 mb-2">
            {fieldName} ({fieldValue.length} items)
          </div>
          <div className="space-y-2">
            {fieldValue.map((item, index) => (
              <FieldRenderer
                key={item.sys?.id || index}
                fieldName={`Item ${index + 1}`}
                fieldValue={item}
              />
            ))}
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
            {fieldValue.map((item, index) => (
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
    "lat" in fieldValue &&
    "lon" in fieldValue
  ) {
    return (
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-1">{fieldName}</div>
        <div className="text-gray-800">
          Latitude: {fieldValue.lat}, Longitude: {fieldValue.lon}
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
