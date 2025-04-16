"use client";

import { useCallback } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ThemeSelector({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();

  const t = useTranslations("ThemeSwitcher");

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("group/toggle size-8 px-0", className)}
      onClick={toggleTheme}
    >
      <SunIcon className="hidden [html.dark_&]:block" />
      <MoonIcon className="hidden [html.light_&]:block" />
      <span className="sr-only">{t("Theme")}</span>
    </Button>
  );
}
