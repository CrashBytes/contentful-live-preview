import Image from "next/image";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import { Asset } from "contentful";

interface ContentfulImageProps {
  asset: Asset;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
  entryId?: string;
  fieldId?: string;
}

export function ContentfulImage({
  asset,
  width,
  height,
  className,
  alt = "",
  priority = false,
  entryId,
  fieldId,
}: ContentfulImageProps) {
  // Use Contentful Live Preview to keep the asset updated in real-time
  const liveAsset = useContentfulLiveUpdates(asset);

  if (!liveAsset?.fields?.file) {
    return null;
  }

  const file = liveAsset.fields.file as {
    url: string;
    details?: { image?: { width?: number; height?: number } };
  };
  const { url, details } = file;
  const imageUrl = `https:${url}`;

  const imageWidth = width || details?.image?.width || 800;
  const imageHeight = height || details?.image?.height || 600;
  const imageAlt = alt || (liveAsset.fields.title as string) || "";

  return (
    <Image
      src={imageUrl}
      width={imageWidth}
      height={imageHeight}
      alt={imageAlt}
      className={className}
      priority={priority}
    />
  );
}

export default ContentfulImage;
