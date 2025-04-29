import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import { Document } from "@contentful/rich-text-types";
import Link from "next/link";
import ContentfulImage from "./ContentfulImage";

interface RichTextProps {
  content: Document;
  entryId?: string;
  fieldId?: string;
}

export const RichText: React.FC<RichTextProps> = ({
  content,
  entryId,
  fieldId,
}) => {
  // Use Contentful Live Preview to keep the content updated in real-time
  const liveContent = useContentfulLiveUpdates(content);

  if (!liveContent) {
    return null;
  }

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
      [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text: React.ReactNode) => <u>{text}</u>,
      [MARKS.CODE]: (text: React.ReactNode) => (
        <code className="bg-gray-100 p-1 rounded font-mono text-sm">
          {text}
        </code>
      ),
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: any, children: React.ReactNode) => (
        <p className="mb-4">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (node: any, children: React.ReactNode) => (
        <h1 className="text-3xl font-bold mt-6 mb-4">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (node: any, children: React.ReactNode) => (
        <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (node: any, children: React.ReactNode) => (
        <h3 className="text-xl font-bold mt-5 mb-2">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (node: any, children: React.ReactNode) => (
        <h4 className="text-lg font-bold mt-4 mb-2">{children}</h4>
      ),
      [BLOCKS.HEADING_5]: (node: any, children: React.ReactNode) => (
        <h5 className="text-base font-bold mt-3 mb-1">{children}</h5>
      ),
      [BLOCKS.HEADING_6]: (node: any, children: React.ReactNode) => (
        <h6 className="text-sm font-bold mt-3 mb-1">{children}</h6>
      ),
      [BLOCKS.UL_LIST]: (node: any, children: React.ReactNode) => (
        <ul className="mb-4 ml-6 list-disc">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node: any, children: React.ReactNode) => (
        <ol className="mb-4 ml-6 list-decimal">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: any, children: React.ReactNode) => (
        <li className="mb-1">{children}</li>
      ),
      [BLOCKS.QUOTE]: (node: any, children: React.ReactNode) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-6" />,
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        const { data } = node;
        const { target } = data;

        if (!target || !target.sys || !target.fields) {
          return null;
        }

        return (
          <div className="my-4">
            <ContentfulImage asset={target} className="rounded" />
          </div>
        );
      },
      [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { data } = node;
        const { uri } = data;

        // If the URL is internal (starts with a slash), use Next.js Link
        const isInternal = uri.startsWith("/");

        if (isInternal) {
          return (
            <Link href={uri} className="text-blue-600 hover:underline">
              {children}
            </Link>
          );
        }

        // External URL - open in new tab
        return (
          <a
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {children}
          </a>
        );
      },
      [INLINES.ENTRY_HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { data } = node;
        const { target } = data;

        if (
          target?.sys?.contentType?.sys?.id === "page" &&
          target?.fields?.slug
        ) {
          const slug = target.fields.slug;
          return (
            <Link href={`/${slug}`} className="text-blue-600 hover:underline">
              {children}
            </Link>
          );
        }

        return <span>{children}</span>;
      },
    },
  };

  return <>{documentToReactComponents(liveContent, options)}</>;
};

export default RichText;
