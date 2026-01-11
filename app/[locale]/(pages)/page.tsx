import { use } from "react";
import { Metadata } from "next";
import { ArrowRightIcon, CodeIcon, ZapIcon } from "lucide-react";
import { Locale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { siteConfig } from "@/config/site";
import { useNavigationToolItems } from "@/hooks/use-navigation-messages";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomIcons, Icon } from "@/components/icons";

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

  const t = useTranslations("HomePage");
  const tRoot = useTranslations() as (key: string) => string;

  const toolItems = useNavigationToolItems();

  return (
    <>
      <section className="container-wrapper px-4 xl:px-6">
        <div className="my-12 flex flex-col items-center gap-4 md:my-16 lg:my-20 lg:gap-6">
          <Badge variant="secondary" className="bg-transparent" asChild>
            <Link href="/changelog">
              <ZapIcon className="fill-primary" />
              {t("Hero.Announcement")} <ArrowRightIcon />
            </Link>
          </Badge>

          <h1 className="text-foreground text-center text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t("Hero.Title")}
          </h1>

          <p className="text-foreground/80 pb-2 text-center text-balance md:text-lg">
            {t("Hero.Description")}
          </p>

          <div className="flex w-full items-center justify-center gap-4">
            <Button asChild>
              <Link href="/tools">{t("Hero.GetStarted")}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
              >
                <CustomIcons.gitHub /> {t("Hero.GitHub")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-wrapper px-4 xl:px-6">
        <div className="outline-border grid grid-cols-2 bg-[repeating-linear-gradient(315deg,var(--muted)_0,var(--muted)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed outline -outline-offset-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div className="bg-card flex items-center gap-2 border-r border-b p-4 text-base leading-tight font-semibold md:gap-4 md:px-6 md:py-5 md:text-lg">
            <CodeIcon className="size-6" />
            {t("Tools.Title")}
          </div>
          <div className="border-b sm:col-span-2 lg:col-span-3 xl:col-span-4"></div>

          {toolItems?.map((item) => {
            return (
              <Link
                className="focus-visible:border-ring focus-visible:ring-ring/50 group bg-card flex border-r border-b outline-none focus-visible:ring-[3px]"
                key={item.intl}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
              >
                <div className="hover:bg-accent/50 flex flex-1 flex-col gap-1 p-4 transition-colors md:gap-2 md:p-6">
                  <div className="mb-1 flex size-6 items-center justify-center">
                    <Icon name={item.icon || "circle"} className="size-6" />
                  </div>
                  <h3 className="flex text-sm leading-snug font-semibold group-hover:underline md:text-base">
                    {tRoot(`${item.intl}.Meta.Title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-snug text-pretty md:text-base">
                    {tRoot(`${item.intl}.Meta.Description`)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
