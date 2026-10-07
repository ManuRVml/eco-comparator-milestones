// Type definitions for Next.js app router page props
// These types are inferred from Next.js 14+ app router pattern

export type LayoutProps<T extends string = string> = {
  children: React.ReactNode;
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[]>>;
};

export type PageProps<T extends string = string> = {
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[]>>;
};
