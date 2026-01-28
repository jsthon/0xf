import { ArrowUpRight } from "lucide-react";

import { useNavigationMessages } from "@/hooks/use-navigation-messages";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function MainNav() {
  const { headers } = useNavigationMessages();

  return (
    <div className="mr-4 hidden items-center justify-center md:flex">
      <nav className="flex items-center gap-2">
        {headers.map((item) => {
          return (
            !item.disabled &&
            item.href && (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className="gap-0"
                asChild
              >
                <Link
                  key={item.title}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                >
                  {item.title}
                  {item.external && (
                    <ArrowUpRight className="text-muted-foreground mb-2.5 size-2.5" />
                  )}
                </Link>
              </Button>
            )
          );
        })}
      </nav>
    </div>
  );
}
