import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { CommandMenu } from "@/components/command-menu";
import { CustomIcons } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteHeader() {
  return (
    <header className="border-grid bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 flex w-full items-center gap-x-2 backdrop-blur max-md:h-14 max-md:border-b max-md:px-4 md:flex-wrap">
      <div className="flex w-full items-center justify-between gap-4 md:h-14 md:border-b md:px-4 xl:px-6">
        <div className="flex items-center gap-4 md:flex-1">
          <Link href="/" className="flex items-center gap-2">
            <CustomIcons.logo className="size-6" />
            <span className="inline-block font-bold">{siteConfig.name}</span>
          </Link>
        </div>
        <div className="w-full max-w-3xs flex-1 md:max-w-sm">
          <CommandMenu />
        </div>
        <div className="hidden flex-1 items-center justify-end gap-4 md:flex">
          <ThemeSwitcher />
        </div>
      </div>
      <MainNav />
    </header>
  );
}
