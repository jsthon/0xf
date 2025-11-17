import { use } from "react";
import { Metadata } from "next";
import { Locale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageIntro } from "@/components/page-intro";

const META_NAMESPACE = "KeyboardEventPage.Meta";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: META_NAMESPACE,
  });

  return {
    title: t("Title"),
    description: t("Description"),
  };
}

export default function KeyboardEventLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = use(params);

  // enable static rendering
  setRequestLocale(locale as Locale);

  const t = useTranslations(META_NAMESPACE);

  return (
    <>
      <PageIntro title={t("Title")} description={t("Description")} />
      {children}
    </>
  );
}
