import { MenuIcon, PanelLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandMenu } from "@/components/command-menu";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ModifierKey } from "@/components/modifier-key";
import { SiteLogo } from "@/components/site-logo";
import { ThemeSelector } from "@/components/theme-selector";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations("Sidebar");

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 w-full border-b backdrop-blur">
          <div className="container-fluid flex h-14 items-center gap-2 pl-4 md:h-16">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="size-8 max-md:order-1">
                  <MenuIcon className="size-5 md:hidden" />
                  <PanelLeftIcon className="max-md:hidden" />
                  <span className="sr-only">{t("ToggleSidebar")}</span>
                </SidebarTrigger>
              </TooltipTrigger>
              <TooltipContent className="pr-1.5">
                <div className="flex items-center gap-2">
                  {t("ToggleSidebar")}
                  <KbdGroup>
                    <Kbd>
                      <ModifierKey />
                    </Kbd>
                    <Kbd>B</Kbd>
                  </KbdGroup>
                </div>
              </TooltipContent>
            </Tooltip>
            <SiteLogo className="md:hidden" />
            <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end md:gap-3 lg:gap-4">
              <CommandMenu />
              <ThemeSelector className="sm:ml-2.5 lg:hidden" />
              <LocaleSwitcher />
              <ThemeSwitcher className="max-lg:hidden" />
            </div>
          </div>
        </header>
        <div className="container-fluid flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
