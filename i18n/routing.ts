import { defineRouting } from "next-intl/routing";

import { defaultLocale, localePrefixes } from "@/i18n/locales";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: Object.keys(localePrefixes),

  // Used when no locale matches
  defaultLocale,

  // Hide default locale prefix
  localePrefix: {
    mode: "as-needed",
    prefixes: localePrefixes,
  },
});
