import { defineRouting } from "next-intl/routing";

export const prefixes = {
  "en-US": "/en-us",
  "zh-CN": "/zh-cn",
  "zh-TW": "/zh-tw",
};

export const routing = defineRouting({
  // A list of all locales that are supported
  // Don't forget to update the proxy.ts
  locales: ["en-US", "zh-CN", "zh-TW"],

  // Used when no locale matches
  defaultLocale: "en-US",

  // Hide default locale prefix
  localePrefix: {
    mode: "as-needed",
    prefixes: prefixes,
  },
});
