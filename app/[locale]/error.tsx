"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <h1>{t("Title")}</h1>
      <button type="button" onClick={reset}>
        {t("Reset")}
      </button>
    </>
  );
}
