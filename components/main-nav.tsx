"use client";

import { cn } from "@/lib/utils";
import {
  useActiveNavigationSection,
  useNavigationMessages,
} from "@/hooks/use-navigation-messages";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeSelector } from "@/components/theme-selector";

export function MainNav() {
  const pathname = usePathname();
  const { headers } = useNavigationMessages();
  const section = useActiveNavigationSection();

  return (
    <div className="flex h-10 items-center justify-between md:w-full md:gap-2 md:border-b md:px-4 xl:px-6">
      <nav className="no-scrollbar hidden h-full gap-6 overflow-x-auto md:flex">
        {headers.map((item) => {
          const isActive =
            pathname === item.href || item.slug === section?.slug;

          return (
            !item.disabled &&
            item.href && (
              <Link
                key={item.title}
                href={item.href}
                target={item?.external ? "_blank" : undefined}
                rel={item?.external ? "noreferrer" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 border-b-2 px-1 text-sm text-nowrap transition-colors",
                  isActive
                    ? "text-foreground border-primary font-semibold"
                    : "hover:text-foreground text-muted-foreground border-transparent font-medium"
                )}
              >
                {item.title}
              </Link>
            )
          );
        })}
      </nav>
      <LocaleSwitcher />
      <ThemeSelector className="md:hidden" />
      <MobileNav />
    </div>
  );
}
