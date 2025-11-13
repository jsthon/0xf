import { use } from "react";
import { Locale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { useNavigationMessages } from "@/hooks/use-navigation-messages";
import { Link } from "@/i18n/navigation";

export default function ToolsPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = use(params);

  // enable static rendering
  setRequestLocale(locale);

  const t = useTranslations() as (key: string) => string;

  const navigations = useNavigationMessages();
  const section = navigations.sections.find(
    (section) => section.slug === "tools"
  );
  const items = section?.categories
    .flatMap((category) => category.items)
    .filter((item): item is typeof item & { intl: string; href: string } =>
      Boolean(item.intl && item.href)
    );

  return (
    <div className="columns-1 gap-4 sm:columns-2 md:gap-6 lg:columns-3">
      {items?.map((item) => {
        return (
          <Link
            className="[a]:hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 mb-4 inline-flex w-full break-inside-avoid rounded-md border p-4 transition-colors duration-100 outline-none focus-visible:ring-[3px] md:mb-6 [a]:transition-colors"
            key={item.intl}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
          >
            <div className="flex flex-col gap-2">
              <h2 className="flex text-base leading-snug font-medium">
                {t(`${item.intl}.Meta.Title`)}
              </h2>
              <p className="text-muted-foreground text-sm text-balance">
                {t(`${item.intl}.Meta.Description`)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
