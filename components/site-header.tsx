import { CommandMenu } from "@/components/command-menu";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { SiteLogo } from "@/components/site-logo";
import { ThemeSelector } from "@/components/theme-selector";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteHeader() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container-fixed flex h-14 items-center gap-2 md:h-16 md:gap-4">
        <SiteLogo className="md:mr-4 lg:mr-10" />
        <MainNav />
        <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end md:gap-3 lg:gap-4">
          <CommandMenu />
          <ThemeSelector className="sm:ml-2.5 lg:hidden" />
          <LocaleSwitcher />
          <ThemeSwitcher className="hidden lg:flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
