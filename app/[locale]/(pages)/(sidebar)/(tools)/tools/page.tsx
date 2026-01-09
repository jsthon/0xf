import { use } from "react";
import { Locale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { useNavigationToolItems } from "@/hooks/use-navigation-messages";
import { Link } from "@/i18n/navigation";

export default function ToolsPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = use(params);

  // enable static rendering
  setRequestLocale(locale as Locale);

  const tRoot = useTranslations() as (key: string) => string;

  const items = useNavigationToolItems();

  return (
    <div className="columns-1 gap-4 sm:columns-2 md:gap-6 lg:columns-3">
      {items?.map((item) => {
        return (
          <Link
            className="hover:bg-accent/50 bg-card focus-visible:border-ring focus-visible:ring-ring/50 group mb-4 inline-flex w-full break-inside-avoid rounded-md border p-4 transition-colors outline-none focus-visible:ring-[3px] md:mb-6"
            key={item.intl}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
          >
            <div className="flex flex-col gap-2">
              <h2 className="flex text-base leading-snug font-medium group-hover:underline">
                {tRoot(`${item.intl}.Meta.Title`)}
              </h2>
              <p className="text-muted-foreground text-sm text-balance">
                {tRoot(`${item.intl}.Meta.Description`)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
