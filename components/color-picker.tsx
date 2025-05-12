import { useTranslations } from "next-intl";
import { HexAlphaColorPicker, HexColorPicker } from "react-colorful";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  className?: string;
  hexColor: string;
  disabledAlpha?: boolean;
  onSelect: (hexColor: string) => void;
};

export function ColorPicker({
  className,
  hexColor,
  disabledAlpha = false,
  onSelect,
}: Props) {
  const t = useTranslations("ColorPicker");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "border-input size-6 rounded-sm border outline-none",
            className
          )}
          style={{
            backgroundColor: hexColor,
          }}
        >
          <span className="sr-only">{t("SelectColor")}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-none p-0"
        sideOffset={10}
        collisionPadding={16}
      >
        {disabledAlpha ? (
          <HexColorPicker
            className="color-picker"
            color={hexColor}
            onChange={onSelect}
          />
        ) : (
          <HexAlphaColorPicker
            className="color-picker"
            color={hexColor}
            onChange={onSelect}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
