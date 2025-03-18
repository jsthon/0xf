"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Circle, File, Laptop, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { isAppleDevice } from "@/lib/platform";
import { cn } from "@/lib/utils";
import { useNavigationTranslations } from "@/hooks/use-navigation-translations";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

function getSearchValue(item: { title: string; keywords?: string[] }) {
  return [item.title, ...(item.keywords || [])].join(" ");
}

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { mainNav, sidebarNav } = useNavigationTranslations();
  const t = useTranslations("Header.CommandMenu");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "bg-muted/50 text-muted-foreground relative h-8 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64"
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">{t("SearchText")}</span>
        <span className="inline-flex lg:hidden">{t("SearchTextShort")}</span>
        {isMounted && (
          <kbd className="bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 items-center gap-1 rounded-sm border px-1.5 font-sans text-[10px] font-medium opacity-100 select-none sm:flex">
            {isAppleDevice ? "⌘" : "Ctrl"} K
          </kbd>
        )}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("CommandPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("NoResults")}</CommandEmpty>
          <CommandGroup heading={t("MainNavHeading")}>
            {mainNav
              .filter((navitem) => !navitem.external)
              .map((navItem) => (
                <CommandItem
                  key={navItem.href}
                  value={getSearchValue(navItem)}
                  onSelect={() => {
                    runCommand(() => router.push(navItem.href as string));
                  }}
                >
                  <File />
                  {navItem.title}
                </CommandItem>
              ))}
          </CommandGroup>
          {sidebarNav.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem) => (
                <CommandItem
                  key={navItem.href}
                  value={getSearchValue(navItem)}
                  onSelect={() => {
                    runCommand(() => router.push(navItem.href as string));
                  }}
                >
                  <div className="mr-2 flex size-4 items-center justify-center">
                    <Circle className="size-3" />
                  </div>
                  {navItem.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading={t("Theme")}>
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun />
              {t("LightTheme")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon />
              {t("DarkTheme")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop />
              {t("SystemTheme")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
