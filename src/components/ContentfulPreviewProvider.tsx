"use client";

import { ContentfulLivePreviewProvider } from "@contentful/live-preview/react";
import { ReactNode } from "react";

interface ContentfulPreviewProviderProps {
  children: ReactNode;
  isPreviewActive?: boolean;
}

export function ContentfulPreviewProvider({
  children,
  isPreviewActive = false,
}: ContentfulPreviewProviderProps) {
  return (
    <ContentfulLivePreviewProvider
      locale="en-US"
      enableInspectorMode={isPreviewActive}
      enableLiveUpdates={isPreviewActive}
    >
      {children}
    </ContentfulLivePreviewProvider>
  );
}

export default ContentfulPreviewProvider;
