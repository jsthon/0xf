"use client";

import { useEffect, useState } from "react";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface CopyButtonProps extends ButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({
  value,
  className,
  variant = "ghost",
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

  return (
    <Button
      size="icon"
      variant={variant}
      className={cn(
        "relative z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50 [&_svg]:h-3 [&_svg]:w-3",
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
      <span className="sr-only">{t("Copy")}</span>
      {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
    </Button>
  );
}
