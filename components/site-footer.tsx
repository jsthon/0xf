import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t py-10 md:py-6">
      <div className="px-4 xl:px-6">
        <div className="text-muted-foreground text-center text-sm leading-loose text-balance md:text-left">
          Built by{" "}
          <a
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            {siteConfig.name}
          </a>
          . The source code is available on{" "}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
