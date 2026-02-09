import { createClient } from "contentful";
import { env } from "./env";

// Initialize Contentful client for published content
const client = createClient({
  space: env.CONTENTFUL_SPACE_ID,
  accessToken: env.CONTENTFUL_DELIVERY_TOKEN,
  environment: env.CONTENTFUL_ENVIRONMENT,
});

// Preview client for draft content with Content Source Maps for inspector mode
const previewClient = createClient({
  space: env.CONTENTFUL_SPACE_ID,
  accessToken: env.CONTENTFUL_PREVIEW_TOKEN,
  environment: env.CONTENTFUL_ENVIRONMENT,
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

// Fetch all content types in the space
export async function fetchContentTypes() {
  try {
    const currentClient = getClient(false); // Content types are same for both preview and published
    const contentTypes = await currentClient.getContentTypes();
    return contentTypes.items;
  } catch (error) {
    console.error("Error fetching content types:", error);
    return [];
  }
}
