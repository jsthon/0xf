import { useTranslations } from "next-intl";

// Note that `app/[locale]/[...rest]/page.tsx`
// is necessary for this page to render.

export default function LocaleNotFound() {
  const t = useTranslations("NotFound");

  return (
    <>
      <h1>{t("Title")}</h1>
    </>
  );
}
