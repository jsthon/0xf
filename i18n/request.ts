import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Don't forget to update the `global.d.ts` file
  return {
    locale,
    messages: {
      ...(await import(`../messages/${locale}/layouts.json`)).default,
      ...(await import(`../messages/${locale}/components.json`)).default,
      ...(await import(`../messages/${locale}/navigations.json`)).default,
      ...(await import(`../messages/${locale}/pages.json`)).default,
      ...(await import(`../messages/${locale}/tools.json`)).default,
    },
  };
});
