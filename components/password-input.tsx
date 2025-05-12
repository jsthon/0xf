"use client";

import { useState } from "react";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("PasswordInput");

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("no-password-reveal pr-10", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        className="text-muted-foreground hover:text-accent-foreground absolute top-0 right-2 bottom-0 my-auto size-6 transition-colors outline-none [&_svg]:pointer-events-none [&_svg]:size-4"
        onClick={() => setShowPassword((value) => !value)}
      >
        {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
        <span className="sr-only">{showPassword ? t("Hide") : t("Show")}</span>
      </button>
    </div>
  );
}
