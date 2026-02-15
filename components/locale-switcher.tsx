"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

import { localeNames } from "@/i18n/locales";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getLocaleName = (locale: string) => localeNames[locale] ?? locale;

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="max-md:has-[>svg]:px-2"
          aria-labelledby="current-locale"
        >
          <Globe />
          <span id="current-locale" className="hidden md:inline-flex">
            {getLocaleName(locale)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        collisionPadding={16}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {routing.locales.map((lang) => (
          <Link key={lang} href={pathname} locale={lang}>
            <DropdownMenuCheckboxItem checked={lang === locale}>
              {getLocaleName(lang)}
            </DropdownMenuCheckboxItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
