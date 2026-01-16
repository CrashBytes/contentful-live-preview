import { createClient } from "contentful";

// Initialize Contentful client for published content
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || "",
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN || "",
  environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
});

// Preview client for draft content with Content Source Maps for inspector mode
const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || "",
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN || "",
  environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
  host: "preview.contentful.com",
  // Enable Content Source Maps for inspector mode
  includeContentSourceMaps: true,
});

// Choose which client to use based on preview mode
export const getClient = (preview = false) =>
  preview ? previewClient : client;

// Fetch a single entry by ID
export async function fetchEntry(id: string, preview = false) {
  try {
    const currentClient = getClient(preview);
    const entry = await currentClient.getEntry(id);
    return entry;
  } catch (error) {
    console.error(`Error fetching entry with ID: ${id}`, error);
    return null;
  }
}

// Fetch entries by content type
export async function fetchEntries(
  contentType: string,
  preview = false,
  options = {}
) {
  try {
    const currentClient = getClient(preview);
    const entries = await currentClient.getEntries({
      content_type: contentType,
      ...options,
    });
    return entries.items;
  } catch (error) {
    console.error(`Error fetching entries of type: ${contentType}`, error);
    return [];
  }
}

// Fetch entries by a specific field value
export async function fetchEntriesByField(
  contentType: string,
  fieldName: string,
  fieldValue: string,
  preview = false
) {
  try {
    const currentClient = getClient(preview);
    const entries = await currentClient.getEntries({
      content_type: contentType,
      [`fields.${fieldName}${fieldValue === "*" ? "[exists]" : ""}`]:
        fieldValue === "*" ? true : fieldValue,
    });
    return entries.items;
  } catch (error) {
    console.error(
      `Error fetching entries of type: ${contentType} with field ${fieldName}=${fieldValue}`,
      error
    );
    return [];
  }
}
