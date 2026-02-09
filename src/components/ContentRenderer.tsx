"use client";

import { Document } from "@contentful/rich-text-types";
import RichText from "./RichText";

interface ContentRendererProps {
  content: Document;
  entryId: string;
}

const ContentRenderer = ({ content }: ContentRendererProps) => {
  return (
    <div className="prose max-w-none">
      <RichText content={content} />
    </div>
  );
};

export default ContentRenderer;
