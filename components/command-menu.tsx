"use client";

import { useCallback, useEffect, useState } from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Monitor, Moon, SearchIcon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { NavItem } from "@/types/nav";
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

function getSearchValue(item: NavItem) {
  return [item.title, item.href, ...(item.keywords || [])].join(" ");
}

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();
  const { headers, sections } = useNavigationMessages();
  const t = useTranslations("CommandMenu");
  const tTheme = useTranslations("ThemeSwitcher");

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
        variant="ghost"
        size="sm"
        className={cn(
          "sm:text-muted-foreground dark:border-input sm:dark:bg-input/30 relative justify-start font-normal has-[>svg]:px-2 sm:w-40 sm:border sm:has-[>svg]:px-2.5 lg:w-48"
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <SearchIcon />
        <span className="hidden sm:inline-flex">{t("Search")}</span>
        <kbd className="bg-background dark:bg-card pointer-events-none absolute top-1/2 right-[5px] hidden h-5 -translate-y-1/2 items-center gap-1 rounded-sm border px-1.5 font-sans text-[10px] font-medium select-none md:flex">
          /
        </kbd>
      </Button>
      <CommandDialog
        className="top-[15%] translate-y-0"
        title={t("Search")}
        open={open}
        onOpenChange={setOpen}
      >
        <CommandInput placeholder={t("CommandPlaceholder")} />
        <CommandList className="max-h-[350px]">
          <CommandEmpty>{t("Empty")}</CommandEmpty>

          <CommandGroup heading={t("LinksHeading")}>
            {headers
              .filter((item) => !item.disabled && !item.external)
              .map((item) => (
                <CommandItem
                  key={item.href}
                  value={getSearchValue(item)}
                  onSelect={() => {
                    runCommand(() => router.push(item.href as string));
                  }}
                >
                  <Icon name={item.icon || "arrow-right"} />
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
