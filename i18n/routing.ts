import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  // Don't forget to update the middleware
  locales: ["en-US", "zh-CN"],

  // Used when no locale matches
  defaultLocale: "en-US",

  // Hide default locale prefix
  localePrefix: {
    mode: "as-needed",
    prefixes: {
      "en-US": "/en",
      "zh-CN": "/zh",
    },
  },
});
