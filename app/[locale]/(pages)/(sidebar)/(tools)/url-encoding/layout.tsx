import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "URLEncodingPage.Meta",
  });

  return {
    title: t("Title"),
    description: t("Description"),
  };
}

export default function URLEncodingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
