import { formats } from "@/i18n/request";
import { routing } from "@/i18n/routing";

import components from "./messages/en-US/components.json";
import navigations from "./messages/en-US/navigations.json";
import pages from "./messages/en-US/pages.json";
import tools from "./messages/en-US/tools.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof components &
      typeof navigations &
      typeof pages &
      typeof tools;
    Formats: typeof formats;
  }
}
