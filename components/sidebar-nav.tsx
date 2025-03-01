"use client";

import { useEffect, useRef } from "react";

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
    requestAnimationFrame(() => {
      // only scroll on initial page load, not on route change
      if (!shouldScrollNav.current) return;

      // check if active nav item exists
      const activeNav = navRefs.current.get(pathname || "");
      if (!activeNav) return;

      // check if sidebar exists and is visible
      const sidebar = activeNav.closest(".overflow-auto");
      if (!sidebar || window.getComputedStyle(sidebar).display === "none")
        return;

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

      shouldScrollNav.current = false;
    });
  }, [pathname]);

  return sidebarNav.length ? (
    <div className="flex flex-col gap-6">
      {sidebarNav.map((item, index) => (
        <div key={index} className="flex flex-col gap-1">
          <h4 className="rounded-md px-2 py-1 text-sm font-semibold">
            {item.title}{" "}
            {item.label && (
              <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs font-normal leading-none text-[#000000] no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
          </h4>
          {item?.items?.length && (
            <SidebarNavItems
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

function SidebarNavItems({
  items,
  pathname,
  navRefs,
}: {
  items: NavItem[];
  pathname: string | null;
  navRefs: React.RefObject<Map<string, HTMLAnchorElement>>;
}) {
  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max gap-0.5 text-sm">
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <Link
            key={index}
            href={item.href}
            ref={(el) => {
              if (el && navRefs.current && item.href) {
                navRefs.current.set(item.href, el);
              }
            }}
            className={cn(
              "group flex h-8 w-full items-center rounded-lg px-2 font-normal text-foreground underline-offset-2 hover:bg-accent hover:text-accent-foreground",
              item.disabled && "cursor-not-allowed opacity-60",
              pathname === item.href &&
                "bg-accent font-medium text-accent-foreground"
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
              "flex w-full cursor-not-allowed items-center rounded-md p-2 text-muted-foreground hover:underline",
              item.disabled && "cursor-not-allowed opacity-60"
            )}
          >
            {item.title}
            {item.label && (
              <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
          </span>
        )
      )}
    </div>
  ) : null;
}
