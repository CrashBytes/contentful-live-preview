import { Asset, Entry, EntrySkeletonType } from "contentful";
import { Document } from "@contentful/rich-text-types";

// Page content type
export interface PageFields {
  title: string;
  slug: string;
  description?: string;
  content?: Document;
  featuredImage?: Asset;
  publishDate?: string;
}

export type PageSkeleton = EntrySkeletonType<PageFields, "page">;
export type Page = Entry<PageSkeleton>;

// Homepage content type
export interface HomepageFields {
  title: string;
  description?: string;
  content?: Document;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: Asset;
  featuredPages?: Page[];
}

export type HomepageSkeleton = EntrySkeletonType<HomepageFields, "homepage">;
export type Homepage = Entry<HomepageSkeleton>;

// Section content type
export interface SectionFields {
  title: string;
  content?: Document;
  image?: Asset;
  ctaText?: string;
  ctaLink?: string;
  layout?: string;
}

export type SectionSkeleton = EntrySkeletonType<SectionFields, "section">;
export type Section = Entry<SectionSkeleton>;

// Author content type
export interface AuthorFields {
  name: string;
  bio?: Document;
  picture?: Asset;
  email?: string;
}

export type AuthorSkeleton = EntrySkeletonType<AuthorFields, "author">;
export type Author = Entry<AuthorSkeleton>;

// Category content type
export interface CategoryFields {
  name: string;
  slug: string;
  description?: string;
  icon?: Asset;
}

export type CategorySkeleton = EntrySkeletonType<CategoryFields, "category">;
export type Category = Entry<CategorySkeleton>;

// Navigation item content type
export interface NavigationItemFields {
  label: string;
  link: string;
  openInNewTab?: boolean;
}

export type NavigationItemSkeleton = EntrySkeletonType<
  NavigationItemFields,
  "navigationItem"
>;
export type NavigationItem = Entry<NavigationItemSkeleton>;

// Navigation content type
export interface NavigationFields {
  name: string;
  items: NavigationItem[];
}

export type NavigationSkeleton = EntrySkeletonType<
  NavigationFields,
  "navigation"
>;
export type Navigation = Entry<NavigationSkeleton>;
