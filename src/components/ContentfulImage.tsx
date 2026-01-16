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

export const ContentfulImage: React.FC<ContentfulImageProps> = ({
  asset,
  width,
  height,
  className,
  alt = "",
  priority = false,
  entryId,
  fieldId,
}) => {
  // Use Contentful Live Preview to keep the asset updated in real-time
  const liveAsset = useContentfulLiveUpdates(asset);

  if (!liveAsset?.fields?.file) {
    return null;
  }

  const { url, details } = liveAsset.fields.file;
  const imageUrl = `https:${url}`;

  const imageWidth = width || details.image?.width || 800;
  const imageHeight = height || details.image?.height || 600;
  const imageAlt = alt || liveAsset.fields.title || "";

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
};

export default ContentfulImage;
