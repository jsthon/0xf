"use client";

import { memo, useCallback, useEffect, useRef } from "react";

import { NavItem } from "@/types/nav";
import { cn } from "@/lib/utils";
import { useActiveNavigationSection } from "@/hooks/use-navigation-messages";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/icons";

export function SidebarNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const section = useActiveNavigationSection();

  useEffect(() => {
    if (!pathname) return;

    // wait for refs to be populated
    requestAnimationFrame(() => {
      // check if sidebar exists and is visible (hidden on mobile)
      const aside = navRef.current?.closest("aside.hidden");
      if (!aside || window.getComputedStyle(aside).display === "none") return;

      // find the scrollable container within the sidebar
      const sidebar = aside.querySelector("[data-radix-scroll-area-viewport]");
      if (!sidebar) return;

      // scroll to top if no active nav item
      const activeNav = itemRefs.current.get(pathname);
      if (!activeNav) {
        sidebar.scrollTop = 0;
        return;
      }

      // check if active nav item is fully visible in sidebar
      const { top: navTop, height: navHeight } =
        activeNav.getBoundingClientRect();
      const { top: sidebarTop, height: sidebarHeight } =
        sidebar.getBoundingClientRect();
      const isVisible =
        navTop >= sidebarTop &&
        navTop + navHeight <= sidebarTop + sidebarHeight;

      // scroll to the center of the active nav item
      if (!isVisible) {
        const offset = navTop - sidebarTop - (sidebarHeight - navHeight) / 2;
        sidebar.scrollTop += offset;
      }
    });
  }, [pathname]);

  return section?.categories?.length ? (
    <nav ref={navRef} className="flex flex-col gap-4">
      {section?.categories.map((category) => (
        <div key={category.title} className="flex flex-col gap-2">
          <h4 className="flex h-9 w-full items-center px-2 text-sm font-medium">
            {category.title}
          </h4>
          {category?.items?.length && (
            <MemoSidebarNavItems
              items={category.items}
              pathname={pathname}
              itemRefs={itemRefs}
            />
          )}
        </div>
      ))}
    </nav>
  ) : null;
}

// prevent unnecessary re-renders
const MemoSidebarNavItems = memo(SidebarNavItems);

function SidebarNavItems({
  items,
  pathname,
  itemRefs,
}: {
  items: NavItem[];
  pathname: string | null;
  itemRefs: React.RefObject<Map<string, HTMLAnchorElement>>;
}) {
  // optimized ref callback
  const setItemRef = useCallback(
    (el: HTMLAnchorElement | null, href: string | undefined) => {
      if (el && itemRefs.current && href) {
        itemRefs.current.set(href, el);
      }
    },
    [itemRefs]
  );

  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max gap-0.5 text-sm">
      {items.map((item) =>
        item.href && !item.disabled ? (
          <Link
            key={item.title}
            href={item.href}
            ref={(el) => setItemRef(el, item.href)}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
            className={cn(
              "flex h-9 w-full items-center rounded-lg px-2 transition-colors",
              pathname === item.href
                ? "bg-ring/20 font-medium"
                : "hover:bg-accent dark:hover:bg-accent/60 font-normal"
            )}
          >
            <div className="mr-2 flex size-4 items-center justify-center">
              <Icon name={item.icon || "circle"} className="size-4" />
            </div>
            {item.title}
          </Link>
        ) : (
          <span
            key={item.title}
            className={cn(
              "text-muted-foreground flex h-9 w-full cursor-not-allowed items-center rounded-md px-2 opacity-60 hover:underline"
            )}
          >
            <div className="mr-2 flex size-4 items-center justify-center">
              <Icon name={item.icon || "circle"} className="size-4" />
            </div>
            {item.title}
          </span>
        )
      )}
    </div>
  ) : null;
}
