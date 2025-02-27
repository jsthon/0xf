import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Locale, routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers";
import { TailwindIndicator } from "@/components/tailwind-indicator";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LocaleLayout.Meta" });

  return {
    description: t("Description"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Provide all messages to client side
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-svh bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            {children}
            <TailwindIndicator />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
