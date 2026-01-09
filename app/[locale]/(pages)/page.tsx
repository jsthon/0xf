import { use } from "react";
import { Metadata } from "next";
import { Locale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { useNavigationToolItems } from "@/hooks/use-navigation-messages";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "HomePage.Meta",
  });

  return {
    title: t("Title"),
    description: t("Description"),
  };
}

export default function HomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = use(params);

  // enable static rendering
  setRequestLocale(locale as Locale);

  const tRoot = useTranslations() as (key: string) => string;

  const toolItems = useNavigationToolItems();

  return (
    <>
      <section className="container-wrapper px-4 xl:px-6">
        <div className="pb-8 lg:pb-16">
          <div className="grid grid-cols-2 gap-0 border-t border-l sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {toolItems?.map((item) => {
              return (
                <Link
                  className="hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 group relative flex gap-3 border-r border-b p-5 transition-colors outline-none focus-visible:ring-[3px]"
                  key={item.intl}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                >
                  <div className="flex flex-col gap-2 md:gap-4">
                    <div className="flex size-6 items-center justify-center">
                      <Icon name={item.icon || "circle"} className="size-6" />
                    </div>
                    <div className="flex flex-col gap-1 md:gap-2">
                      <h2 className="flex text-sm leading-snug font-semibold group-hover:underline md:text-base">
                        {tRoot(`${item.intl}.Meta.Title`)}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-snug text-balance md:text-base">
                        {tRoot(`${item.intl}.Meta.Description`)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
