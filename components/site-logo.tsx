import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { CustomIcons } from "@/components/icons";

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("-m-1 flex items-center gap-2", className)}>
      <CustomIcons.logo className="m-1 h-4.5 w-auto" />
      <span className="sr-only">{siteConfig.name}</span>
    </Link>
  );
}
