import type { MetadataRoute } from "next";
import navigations from "@/messages/en-US/navigations.json";

import { NavItem } from "@/types/nav";
import { siteConfig } from "@/config/site";
import { localePrefixes } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

const { defaultLocale, locales } = routing;

// Group locales by language code: `{ en: ["en-US"], zh: ["zh-CN", "zh-TW"] }`
const localesByLang = locales.reduce(
  (acc, locale) => {
    const lang = locale.split("-")[0];
    (acc[lang] ??= []).push(locale);
    return acc;
  },
  {} as Record<string, Locale[]>
);

// Build full URL with optional locale prefix.
function getUrl(path: string, locale?: Locale): string {
  const prefix =
    locale && locale !== defaultLocale ? localePrefixes[locale] : "";
  return `${siteConfig.url}${prefix}${path === "/" ? "" : path}`;
}

// Build hreflang alternates: x-default, region-independent, and region-specific codes.
function getAlternates(path: string): Record<string, string> {
  const entries: [string, string][] = [["x-default", getUrl(path)]];

  for (const [lang, variants] of Object.entries(localesByLang)) {
    entries.push([lang, getUrl(path, variants[0])]);
    if (variants.length > 1) {
      variants.forEach((locale) =>
        entries.push([locale, getUrl(path, locale)])
      );
    }
  }

  return Object.fromEntries(entries);
}

// Extract indexable paths from navigation config.
function getPaths(): string[] {
  const { headers, sections } = navigations.Navigation;
  const items: Omit<NavItem, "icon">[] = [
    ...headers,
    ...sections.flatMap((s) => s.categories.flatMap((c) => c.items)),
  ];

  return items
    .filter((item) => item.href && !item.external && !item.disabled)
    .map((item) => item.href!);
}

export default function sitemap(): MetadataRoute.Sitemap {
  return getPaths().map((path) => ({
    url: getUrl(path),
    lastModified: new Date(),
    alternates: { languages: getAlternates(path) },
  }));
}
