"use client";

import { Globe } from "lucide-react";
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

// Message value not support "-"
const formatLocale = (locale: string) => locale.replaceAll("-", "_");

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="max-md:has-[>svg]:px-2">
          <Globe />
          <span className="hidden md:inline-flex">
            {t("Locale", { locale: formatLocale(locale) })}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {routing.locales.map((lang) => (
          <Link key={lang} href={pathname} locale={lang}>
            <DropdownMenuCheckboxItem checked={lang === locale}>
              {t("Locale", { locale: formatLocale(lang) })}
            </DropdownMenuCheckboxItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
