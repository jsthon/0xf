import { use } from "react";
import { Metadata } from "next";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CodeIcon,
  ZapIcon,
} from "lucide-react";
import { Locale, useMessages, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { siteConfig } from "@/config/site";
import { useNavigationToolItems } from "@/hooks/use-navigation-messages";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomIcons, Icon, IconKey } from "@/components/icons";

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
    title: {
      absolute: t("Title"),
    },
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

  const messages = useMessages();
  const t = useTranslations("HomePage");
  const tRoot = useTranslations() as (key: string) => string;

  const toolItems = useNavigationToolItems();
  const featureItems = (
    messages.HomePage as {
      Features: {
        Items: Array<{ Title: string; Description: string; Icon: IconKey }>;
      };
    }
  ).Features.Items;

  return (
    <>
      <section className="container-fixed">
        <div className="my-12 flex flex-col items-center gap-4 md:my-16 lg:my-20 lg:gap-6">
          <Badge variant="secondary" className="bg-transparent" asChild>
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
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

          <div className="flex items-center justify-center gap-4">
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

      <section className="container-fixed">
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

      <section className="container-fixed">
        <div className="mt-12 flex flex-col gap-8 md:mt-16 md:gap-12 lg:mt-20 lg:gap-16">
          <div className="flex flex-col gap-4 text-center text-balance">
            <strong className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {t("Features.Badge")}
            </strong>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              {t("Features.Title")}
            </h2>
            <p className="text-muted-foreground md:text-lg">
              {t("Features.Description")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((item) => (
              <div
                key={item.Title}
                className="bg-card relative flex flex-col items-start border p-8"
              >
                <span className="bg-muted/70 absolute inset-x-0 bottom-0 h-2 w-full border-t border-dashed"></span>
                <span className="bg-muted/70 absolute inset-x-0 top-0 h-2 w-full border-b border-dashed"></span>
                <span className="bg-muted/70 absolute inset-y-0 left-0 h-full w-2 border-e border-dashed"></span>
                <span className="bg-muted/70 absolute inset-y-0 right-0 h-full w-2 border-s border-dashed"></span>

                <div className="bg-muted rounded-lg p-2">
                  <Icon name={item.Icon || "circle"} className="size-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{item.Title}</h3>
                <p className="text-foreground/80 mt-2">{item.Description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-fixed">
        <div className="my-12 flex flex-col gap-8 md:my-16 lg:my-20">
          <div className="flex flex-col gap-4 text-center text-balance">
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              {t("Ready.Title")}
            </h2>
            <p className="text-muted-foreground md:text-lg">
              {t("Ready.Description")}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <Button size="lg" asChild>
              <Link href="/tools">
                {t("Ready.GetStarted")}
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
              >
                <CustomIcons.gitHub /> {t("Ready.GitHub")}
                <ArrowUpRightIcon />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
