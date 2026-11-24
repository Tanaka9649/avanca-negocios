import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/eventos`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/compra-e-venda-de-empresas`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/privacidade`, lastModified: now, priority: 0.2 },
  ];
}
