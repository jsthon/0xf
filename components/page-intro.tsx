import { cn } from "@/lib/utils";

export function PageIntro({
  className,
  title,
  description,
  children,
}: {
  className?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  if (!title && !description && !children) return null;

  return (
    <div className={cn("flex flex-col gap-2 pb-8", className)}>
      {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
      {description && (
        <p className="text-muted-foreground text-base">{description}</p>
      )}
      {children}
    </div>
  );
}
