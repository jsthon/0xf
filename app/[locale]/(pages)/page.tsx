import { use } from "react";
import { Metadata } from "next";
import { Locale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

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

  return (
    <div className="px-4 py-6 xl:px-6">
      <h1>{t("Welcome")}</h1>
    </div>
  );
}
