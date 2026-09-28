import type { MetadataRoute } from "next";

/** App privada del proyecto: ningún robot debe indexarla. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}