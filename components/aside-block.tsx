import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function AsideBlock({ className }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group bg-muted/50 relative flex flex-col gap-2 rounded-lg p-6 text-sm",
        className
      )}
    >
      <div className="text-base leading-tight font-semibold text-balance group-hover:underline">
        Deploy your shadcn/ui app on Vercel
      </div>
      <div className="text-muted-foreground">
        Trusted by OpenAI, Sonos, Adobe, and more.
      </div>
      <div className="text-muted-foreground">
        Vercel provides tools and infrastructure to deploy apps and features at
        scale.
      </div>
      <Button size="sm" className="mt-2 w-fit">
        Deploy Now
      </Button>
      <Link
        href="https://vercel.com/new"
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0"
      >
        <span className="sr-only">Deploy to Vercel</span>
      </Link>
    </div>
  );
}
