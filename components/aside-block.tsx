"use client";

import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function AsideBlock({ className }: React.ComponentProps<"div">) {
  const t = useTranslations("AsideBlock");
  const descriptions = t.raw("Description") as string[];

  return (
    <div
      className={cn(
        "group bg-muted/50 relative flex flex-col gap-2 rounded-lg p-6 text-sm",
        className
      )}
    >
      <div className="text-base leading-tight font-semibold text-balance group-hover:underline">
        {t("Title", { name: siteConfig.name })}
      </div>
      {descriptions.map((desc, index) => (
        <div key={index} className="text-muted-foreground">
          {desc.replace("{name}", siteConfig.name)}
        </div>
      ))}
      <Button size="sm" className="mt-2 w-fit">
        {t("Button")}
      </Button>
      <Link
        href={siteConfig.links.productHunt}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0"
      >
        <span className="sr-only">{t("Button")}</span>
      </Link>
    </div>
  );
}
