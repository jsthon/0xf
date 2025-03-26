"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LocaleSwitcher() {
  const t = useTranslations("Header.LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 px-0">
          <Languages className="size-4" />
          <span className="sr-only">{t("Label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
        {routing.locales.map((lang) => (
          <Link key={lang} href={pathname} locale={lang}>
            <DropdownMenuCheckboxItem checked={lang === locale}>
              {t("Locale", { locale: lang })}
            </DropdownMenuCheckboxItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
