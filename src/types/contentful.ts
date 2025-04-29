import { Asset, Entry } from "contentful";
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

export type Page = Entry<PageFields>;

// Homepage content type
export interface HomepageFields {
  title: string;
  description?: string;
  content?: Document;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: Asset;
  featuredPages?: Entry<PageFields>[];
}

export type Homepage = Entry<HomepageFields>;

// Section content type
export interface SectionFields {
  title: string;
  content?: Document;
  image?: Asset;
  ctaText?: string;
  ctaLink?: string;
  layout?: string;
}

export type Section = Entry<SectionFields>;

// Author content type
export interface AuthorFields {
  name: string;
  bio?: Document;
  picture?: Asset;
  email?: string;
}

export type Author = Entry<AuthorFields>;

// Category content type
export interface CategoryFields {
  name: string;
  slug: string;
  description?: string;
  icon?: Asset;
}

export type Category = Entry<CategoryFields>;

// Navigation item content type
export interface NavigationItemFields {
  label: string;
  link: string;
  openInNewTab?: boolean;
}

export type NavigationItem = Entry<NavigationItemFields>;

// Navigation content type
export interface NavigationFields {
  name: string;
  items: Entry<NavigationItemFields>[];
}

export type Navigation = Entry<NavigationFields>;
