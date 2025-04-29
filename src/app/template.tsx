"use client";

import { ReactNode } from "react";
import ContentfulPreviewProvider from "@/components/ContentfulPreviewProvider";

interface TemplateProps {
  children: ReactNode;
  isPreviewActive: boolean;
}

export default function Template({ children, isPreviewActive }: TemplateProps) {
  return (
    <ContentfulPreviewProvider isPreviewActive={isPreviewActive}>
      {children}
    </ContentfulPreviewProvider>
  );
}
