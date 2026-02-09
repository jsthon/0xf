import { defineRouting } from "next-intl/routing";

export const prefixes = {
  "de-DE": "/de",
  "fr-FR": "/fr",
  "en-US": "/en",
  "es-ES": "/es",
  "ja-JP": "/ja",
  "zh-CN": "/zh-cn",
  "zh-TW": "/zh-tw",
};

export const routing = defineRouting({
  // A list of all locales that are supported
  // Don't forget to update the proxy.ts
  locales: ["de-DE", "fr-FR", "en-US", "es-ES", "ja-JP", "zh-CN", "zh-TW"],

  // Used when no locale matches
  defaultLocale: "en-US",

  // Hide default locale prefix
  localePrefix: {
    mode: "as-needed",
    prefixes: prefixes,
  },
});
