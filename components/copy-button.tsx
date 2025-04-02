"use client";

import { useEffect, useState } from "react";
import type { VariantProps } from "class-variance-authority";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

interface CopyButtonProps
  extends Omit<React.ComponentProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  value: string;
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
  children?: (hasCopied?: boolean) => React.ReactNode;
}

export function CopyButton({
  value,
  className,
  variant = "ghost",
  size = "icon",
  children,
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const t = useTranslations("CopyButton");

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasCopied(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasCopied]);

  const defaultChildren = (hasCopied: boolean) => (
    <>
      {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
      <span className="sr-only">{t("Copy")}</span>
    </>
  );

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        !children &&
          "relative z-10 size-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50 [&_svg]:size-3",
        className
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setHasCopied(true);
        } catch {
          toast.error(t("Error"));
        }
      }}
      {...props}
    >
      {children ? children(hasCopied) : defaultChildren(hasCopied)}
    </Button>
  );
}
