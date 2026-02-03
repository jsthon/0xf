"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { ChevronRight } from "lucide-react";

import { useActiveNavigationSection } from "@/hooks/use-navigation-messages";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Icon } from "@/components/icons";
import { SiteLogo } from "@/components/site-logo";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const section = useActiveNavigationSection();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!pathname) return;

    requestAnimationFrame(() => {
      const content = contentRef.current;
      const active = activeRef.current;
      if (!content || !active) return;

      const { top: activeTop, height: activeHeight } =
        active.getBoundingClientRect();
      const { top: contentTop, height: contentHeight } =
        content.getBoundingClientRect();

      const isVisible =
        activeTop >= contentTop &&
        activeTop + activeHeight <= contentTop + contentHeight;

      if (!isVisible) {
        const offset =
          activeTop - contentTop - (contentHeight - activeHeight) / 2;
        content.scrollTop += offset;
      }
    });
  }, [pathname]);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b p-0">
        <div className="flex h-14 items-center px-6 md:h-16">
          <div className="flex h-5 items-center gap-4">
            <SiteLogo />
            {section?.title && section?.slug && (
              <>
                <Separator orientation="vertical" />
                <Link
                  href={`/${section.slug}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {section.title}
                </Link>
              </>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent ref={contentRef} className="gap-0 px-2 pt-3 pb-6">
        {section?.categories?.map((category) => (
          <Collapsible
            key={category.title}
            title={category.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup className="gap-2">
              <SidebarGroupLabel
                className="group/label text-sidebar-foreground ring-sidebar-ring/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                asChild
              >
                <CollapsibleTrigger>
                  {category.title}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.items?.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          className="ring-sidebar-ring/50"
                          asChild
                          isActive={pathname === item.href}
                        >
                          {item.href && !item.disabled ? (
                            <Link
                              ref={
                                pathname === item.href ? activeRef : undefined
                              }
                              href={item.href}
                              target={item.external ? "_blank" : undefined}
                              rel={item.external ? "noreferrer" : undefined}
                            >
                              <Icon name={item.icon || "circle"} />
                              {item.title}
                            </Link>
                          ) : (
                            <span>
                              <Icon name={item.icon || "circle"} />
                              {item.title}
                            </span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
