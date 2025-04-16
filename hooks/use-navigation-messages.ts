import { useMemo } from "react";
import { useMessages } from "next-intl";

import { Navigations, NavSection } from "@/types/nav";
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

    return navs.sections.find((section) =>
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
