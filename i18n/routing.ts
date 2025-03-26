import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  // Don't forget to update the middleware
  locales: ["en", "zh"],

  // Used when no locale matches
  defaultLocale: "en",

  // Don’t use a locale prefix for the default locale
  localePrefix: "as-needed",
});
