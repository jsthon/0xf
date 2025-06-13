import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

export function ScrollArea({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("overflow-hidden", className)}
      scrollHideDelay={0}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full py-6 pr-4 xl:pr-6">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        className="bg-muted data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=visible]:fade-in data-[state=hidden]:fade-out flex w-1 touch-none transition-[width] select-none hover:w-1.5"
        orientation="vertical"
      >
        <ScrollAreaPrimitive.Thumb className="bg-primary/40 hover:bg-primary/60 relative flex-1 rounded-lg transition-colors before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}
