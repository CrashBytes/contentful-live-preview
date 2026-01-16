"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface PreviewBannerProps {
  isPreview: boolean;
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({ isPreview }) => {
  const router = useRouter();

  if (!isPreview) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white py-2 px-4 flex justify-between items-center z-50">
      <span className="font-medium">
        Preview Mode Active - You are viewing draft content
      </span>
      <Link
        href="/api/exit-preview"
        className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
        onClick={() => {
          // Refresh the page after exiting preview mode
          setTimeout(() => {
            router.refresh();
          }, 200);
        }}
      >
        Exit Preview
      </Link>
    </div>
  );
};

export default PreviewBanner;
