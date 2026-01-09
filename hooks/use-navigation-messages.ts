import { useMemo } from "react";
import { useMessages } from "next-intl";

import { Navigations, NavItem, NavSection } from "@/types/nav";
import { usePathname } from "@/i18n/navigation";

export function useNavigationMessages(): Navigations {
  const messages = useMessages();
  return messages.Navigation as Navigations;
}

export function useActiveNavigationSection(): NavSection | undefined {
  const navs = useNavigationMessages();
  const pathname = usePathname();

  const section = useMemo(() => {
    if (!pathname) return undefined;

    return navs.sections.find(
      (section) =>
        section.slug ===
          navs.headers.find((item) => pathname === item.href)?.slug ||
        section.categories?.some((category) =>
          category.items?.some((item) => {
            if (item.href === "/" && pathname !== "/") return false;

            return item.href && pathname.startsWith(item.href);
          })
        )
    );
  }, [navs, pathname]);

  return section;
}

export type NavToolItem = NavItem & { intl: string; href: string };

export function useNavigationToolItems(): NavToolItem[] {
  const navigations = useNavigationMessages();

  return useMemo(() => {
    const section = navigations.sections.find(
      (section) => section.slug === "tools"
    );

    return (
      section?.categories
        .flatMap((category) => category.items)
        .filter((item): item is NavToolItem =>
          Boolean(item.intl && item.href)
        ) ?? []
    );
  }, [navigations]);
}
