"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useNavigationTranslations } from "@/hooks/use-navigation-translations";
import { Link, usePathname } from "@/i18n/navigation";
import { Icons } from "@/components/icons";

export function MainNav() {
  const pathname = usePathname();
  const { mainNav } = useNavigationTranslations();

  // Filter out homepage link as it's already in the logo
  const filteredNav = mainNav.filter((item) => item.href !== "/");

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        {filteredNav.map((item) => {
          const href = item.href || "/";
          return (
            <Link
              key={item.title}
              href={href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname && pathname.startsWith(href)
                  ? "text-foreground"
                  : "text-foreground/80"
              )}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
