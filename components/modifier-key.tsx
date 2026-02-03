"use client";

import { useMemo } from "react";

import { isAppleDevice } from "@/lib/platform";

type ModifierKeyProps = {
  appleText?: string;
  defaultText?: string;
};

export function ModifierKey({
  appleText = "⌘",
  defaultText = "Ctrl",
}: ModifierKeyProps) {
  const label = useMemo(
    () => (isAppleDevice() ? appleText : defaultText),
    [appleText, defaultText]
  );

  return <>{label}</>;
}
