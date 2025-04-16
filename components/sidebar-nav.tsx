"use client";

import { memo, useCallback, useEffect, useRef } from "react";

import { NavItem } from "@/types/nav";
import { cn } from "@/lib/utils";
import { useActiveNavigationSection } from "@/hooks/use-navigation-messages";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/icons";

export function SidebarNav() {
  const pathname = usePathname();
  const shouldScrollNav = useRef(true);
  const navRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const section = useActiveNavigationSection();

  useEffect(() => {
    // only execute on initial page load once
    if (!shouldScrollNav.current || !pathname) return;

    // wait for refs to be populated
    requestAnimationFrame(() => {
      try {
        // check if active nav item exists
        const activeNav = navRefs.current.get(pathname);
        if (!activeNav) return;

        // check if sidebar exists and is visible (hidden on mobile)
        const aside = activeNav.closest("aside.hidden");
        if (!aside || window.getComputedStyle(aside).display === "none") return;

        // find the scrollable container within the sidebar
        const sidebar = aside.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (!sidebar) return;

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
      } finally {
        // always set to false after attempt
        shouldScrollNav.current = false;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebar = section?.categories || [];

  return sidebar.length ? (
    <nav className="flex flex-col gap-4">
      {sidebar.map((item) => (
        <div key={item.title} className="flex flex-col gap-2">
          <h4 className="flex h-9 w-full items-center px-2 text-sm font-medium">
            {item.title}
          </h4>
          {item?.items?.length && (
            <MemoSidebarNavItems
              items={item.items}
              pathname={pathname}
              navRefs={navRefs}
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
  navRefs,
}: {
  items: NavItem[];
  pathname: string | null;
  navRefs: React.RefObject<Map<string, HTMLAnchorElement>>;
}) {
  // optimized ref callback
  const setNavRef = useCallback(
    (el: HTMLAnchorElement | null, href: string | undefined) => {
      if (el && navRefs.current && href) {
        navRefs.current.set(href, el);
      }
    },
    [navRefs]
  );

  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max gap-0.5 text-sm">
      {items.map((item) =>
        item.href && !item.disabled ? (
          <Link
            key={item.title}
            href={item.href}
            ref={(el) => setNavRef(el, item.href)}
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
