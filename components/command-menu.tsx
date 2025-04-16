"use client";

import { useCallback, useEffect, useState } from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Monitor, Moon, SearchIcon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { isAppleDevice } from "@/lib/platform";
import { cn } from "@/lib/utils";
import { useNavigationMessages } from "@/hooks/use-navigation-messages";
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
import { Icon } from "@/components/icons";

function getSearchValue(item: { title: string; keywords?: string[] }) {
  return [item.title, ...(item.keywords || [])].join(" ");
}

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { header, sections } = useNavigationMessages();
  const t = useTranslations("CommandMenu");
  const tTheme = useTranslations("ThemeSwitcher");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
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

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "bg-muted/50 text-muted-foreground relative h-8 w-full justify-start rounded-xl text-sm font-normal shadow-none md:h-9"
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <SearchIcon className="size-4 opacity-50" />
        <span className="hidden md:inline-flex">{t("SearchText")}</span>
        <span className="inline-flex md:hidden">{t("SearchTextShort")}</span>
        {isMounted && (
          <kbd className="bg-background pointer-events-none absolute top-1.5 right-2 hidden h-5.5 items-center gap-1 rounded-sm border px-1.5 font-sans text-[10px] font-medium select-none md:flex">
            {isAppleDevice ? "⌘" : "Ctrl"} K
          </kbd>
        )}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("CommandPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("NoResults")}</CommandEmpty>

          <CommandGroup heading={t("HeaderHeading")}>
            {header
              .filter((item) => !item.disabled && !item.external)
              .map((item) => (
                <CommandItem
                  key={item.href}
                  value={getSearchValue(item)}
                  onSelect={() => {
                    runCommand(() => router.push(item.href as string));
                  }}
                >
                  <Icon name={item.icon || "circle"} />
                  {item.title}
                </CommandItem>
              ))}
          </CommandGroup>

          {sections.map(({ title, categories }) => (
            <CommandGroup key={title} heading={title}>
              {categories.map(({ items }) =>
                items
                  .filter((item) => !item.disabled && !item.external)
                  .map((item) => (
                    <CommandItem
                      key={item.href}
                      value={getSearchValue(item)}
                      onSelect={() => {
                        runCommand(() => router.push(item.href as string));
                      }}
                    >
                      <Icon name={item.icon || "circle"} />
                      {item.title}
                    </CommandItem>
                  ))
              )}
            </CommandGroup>
          ))}

          <CommandSeparator />
          <CommandGroup heading={tTheme("Theme")}>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Monitor />
              {tTheme("SystemTheme")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun />
              {tTheme("LightTheme")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon />
              {tTheme("DarkTheme")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
