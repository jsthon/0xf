"use client";

import { memo, useCallback, useEffect, useRef } from "react";

import { NavItem } from "@/types/nav";
import { cn } from "@/lib/utils";
import { useNavigationTranslations } from "@/hooks/use-navigation-translations";
import { Link, usePathname } from "@/i18n/navigation";

export function SidebarNav() {
  const pathname = usePathname();
  const shouldScrollNav = useRef(true);
  const navRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const { sidebarNav } = useNavigationTranslations();

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
        const sidebar = aside.querySelector(".overflow-auto");
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

  return sidebarNav.length ? (
    <div className="flex flex-col gap-6">
      {sidebarNav.map((item, index) => (
        <div key={index} className="flex flex-col gap-1">
          <h4 className="rounded-md px-2 py-1 text-sm font-semibold">
            {item.title}{" "}
            {item.label && (
              <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none font-normal text-[#000000] no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
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
    </div>
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
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <Link
            key={index}
            href={item.href}
            ref={(el) => setNavRef(el, item.href)}
            className={cn(
              "group text-foreground hover:bg-accent hover:text-accent-foreground flex h-8 w-full items-center rounded-lg px-2 font-normal underline-offset-2",
              item.disabled && "cursor-not-allowed opacity-60",
              pathname === item.href &&
                "bg-accent text-accent-foreground font-medium"
            )}
            target={item.external ? "_blank" : ""}
            rel={item.external ? "noreferrer" : ""}
          >
            {item.title}
            {item.label && (
              <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
          </Link>
        ) : (
          <span
            key={index}
            className={cn(
              "text-muted-foreground flex w-full cursor-not-allowed items-center rounded-md p-2 hover:underline",
              item.disabled && "cursor-not-allowed opacity-60"
            )}
          >
            {item.title}
            {item.label && (
              <span className="bg-muted text-muted-foreground ml-2 rounded-md px-1.5 py-0.5 text-xs leading-none no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
          </span>
        )
      )}
    </div>
  ) : null;
}
