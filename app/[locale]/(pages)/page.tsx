import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage.Meta" });

  return {
    title: t("Title"),
    description: t("Description"),
  };
}

export default function HomePage() {
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
