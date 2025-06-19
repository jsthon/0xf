"use client";

import { Fragment, useCallback, useState } from "react";
import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import {
  useActiveNavigationSection,
  useNavigationMessages,
} from "@/hooks/use-navigation-messages";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { header } = useNavigationMessages();
  const section = useActiveNavigationSection();
  const t = useTranslations("MobileNav");

  const onOpenChange = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 px-0 text-base md:hidden"
        >
          <MenuIcon className="size-5" />
          <span className="sr-only">{t("ToggleMenu")}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[60svh] p-0">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{t("Menu")}</DrawerTitle>
          <DrawerDescription>{t("ToggleMenu")}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-auto p-6">
          <div className="flex flex-col gap-3">
            {header.map((item) => {
              return (
                !item.disabled &&
                item.href && (
                  <MobileLink
                    key={item.title}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    onOpenChange={setOpen}
                    className="text-lg font-medium"
                  >
                    {item.title}
                  </MobileLink>
                )
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            {section?.categories.map((category) => (
              <div key={category.title} className="flex flex-col gap-3 pt-6">
                <h4 className="font-medium">{category.title}</h4>
                {category.items.map((item) => (
                  <Fragment key={item.title}>
                    {!item.disabled &&
                      (item.href ? (
                        <MobileLink
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noreferrer" : undefined}
                          onOpenChange={setOpen}
                          className="text-muted-foreground"
                        >
                          {item.title}
                        </MobileLink>
                      ) : (
                        item.title
                      ))}
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface MobileLinkProps {
  href: string;
  target?: string;
  rel?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn("text-base", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
