"use client";

import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t py-10 md:py-6">
      <div className="container-fluid">
        <div className="text-muted-foreground text-center text-sm leading-loose text-balance md:text-left">
          {t.rich("Text", {
            name: siteConfig.name,
            url: (chunks) => (
              <a
                href={siteConfig.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                {chunks}
              </a>
            ),
            github: (chunks) => (
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                {chunks}
              </a>
            ),
          })}
        </div>
      </div>
    </footer>
  );
}
