import { use } from "react";
import { Metadata } from "next";
import { Locale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage.Meta" });

  return {
    title: t("Title"),
    description: t("Description"),
  };
}

export default function HomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = use(params);

  // enable static rendering
  setRequestLocale(locale);

  const t = useTranslations("HomePage");

  return (
    <>
      <div className="container-wrapper">
        <div className="container py-6">
          <h1>{t("Welcome")}</h1>
        </div>
      </div>
    </>
  );
}
