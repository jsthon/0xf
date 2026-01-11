"use client";

import { useEffect } from "react";
import { ChevronLeftIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const t = useTranslations("ErrorPage");
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container mx-auto flex min-h-screen items-center px-6 py-12">
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <p className="bg-destructive/10 text-destructive rounded-full p-3 text-sm font-medium">
          <TriangleAlertIcon className="size-6" />
        </p>
        <h1 className="text-primary mt-4 text-2xl font-semibold md:text-3xl">
          {t("Meta.Title")}
        </h1>
        <p className="text-muted-foreground mt-4 text-balance">
          {t("Meta.Description")}
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <Button onClick={() => router.back()} variant="secondary">
            <ChevronLeftIcon className="size-4" />
            <span>{t("Back")}</span>
          </Button>

          <Button asChild>
            <Link href="/">{t("Home")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
