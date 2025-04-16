import { useTranslations } from "next-intl";

// Note that `app/[locale]/[...rest]/page.tsx`
// is necessary for this page to render.

export default function LocaleNotFound() {
  const t = useTranslations("NotFoundPage");

  return (
    <>
      <h1>{t("Title")}</h1>
    </>
  );
}
