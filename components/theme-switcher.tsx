"use client";

import { Fragment, useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

export const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("ThemeSwitcher");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    {
      key: "system",
      icon: Monitor,
      label: t("SystemTheme"),
    },
    {
      key: "light",
      icon: Sun,
      label: t("LightTheme"),
    },
    {
      key: "dark",
      icon: Moon,
      label: t("DarkTheme"),
    },
  ];

  return (
    <fieldset
      className={cn(
        "bg-background ring-border dark:ring-accent flex h-7.5 rounded-full ring-1",
        className
      )}
    >
      <legend className="sr-only">{t("Theme")}</legend>
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = mounted && theme === key;

        return (
          <Fragment key={key}>
            <input
              className="sr-only"
              type="radio"
              value={key}
              aria-label={label}
            />
            <label
              className={cn(
                "flex size-7.5 items-center justify-center rounded-full",
                isActive
                  ? "ring-border dark:ring-accent text-foreground ring-1"
                  : "hover:text-foreground text-muted-foreground"
              )}
              onClick={() => setTheme(key)}
            >
              <span className="sr-only">{label}</span>
              <Icon className="size-4 transition-colors" />
            </label>
          </Fragment>
        );
      })}
    </fieldset>
  );
};
