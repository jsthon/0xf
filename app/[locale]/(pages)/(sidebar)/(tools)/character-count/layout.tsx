import { use } from "react";
import { Metadata } from "next";
import { Locale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageIntro } from "@/components/page-intro";

const META_NAMESPACE = "CharacterCountPage.Meta";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: META_NAMESPACE,
  });

  return {
    title: t("Title"),
    description: t("Description"),
  };
}

export default function CharacterCountLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = use(params);

  // enable static rendering
  setRequestLocale(locale);

  const t = useTranslations(META_NAMESPACE);

  return (
    <>
      <PageIntro title={t("Title")} description={t("Description")} />
      {children}
    </>
  );
}
