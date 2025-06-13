"use client";

import { useMemo, useState } from "react";
import { colord, extend } from "colord";
import cmykPlugin from "colord/plugins/cmyk";
import hwbPlugin from "colord/plugins/hwb";
import lchPlugin from "colord/plugins/lch";
import namesPlugin from "colord/plugins/names";
import { useTranslations } from "next-intl";

import {
  COLOR_FORMATS,
  formatColor,
  getColorFormat,
  type ColorFormat,
} from "@/lib/color-format";
import { plainTypingProps } from "@/lib/props/typing";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/color-picker";
import { CopyButton } from "@/components/copy-button";

// Enable colord plugins
extend([cmykPlugin, hwbPlugin, lchPlugin, namesPlugin]);

export default function ColorConverterPage() {
  const [inputColorText, setInputColorText] = useState<string>("#000000");
  const [inputColorFormat, setInputColorFormat] = useState<
    ColorFormat | undefined
  >("hex");

  const t = useTranslations("ColorConverterPage");

  const outputColors = useMemo(() => {
    const c = colord(inputColorText);

    return c.isValid()
      ? {
          hex: c.toHex(),
          rgb: c.toRgbString(),
          hsl: c.toHslString(),
          hwb: c.toHwbString(),
          lch: c.toLchString(),
          cmyk: c.toCmykString(),
        }
      : {};
  }, [inputColorText]);

  const handleColorPickerSelect = (hexColor: string) => {
    if (inputColorFormat) {
      setInputColorText(formatColor(hexColor, inputColorFormat));
    } else {
      setInputColorText(hexColor);
      setInputColorFormat("hex");
    }
  };

  const handleInputChange = (value: string) => {
    setInputColorText(value);
    setInputColorFormat(getColorFormat(value));
  };

  return (
    <>
      <div className="flex flex-col gap-2 pb-8">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
          {t("Meta.Title")}
        </h1>
        {t.has("Meta.Description") && (
          <p className="text-muted-foreground text-base">
            {t("Meta.Description")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Label htmlFor="color-input" className="text-lg">
              {t("Labels.Input")}
            </Label>
            {inputColorFormat && (
              <Badge>{inputColorFormat.toUpperCase()}</Badge>
            )}
          </div>

          <div className="relative">
            <ColorPicker
              className="absolute top-0 bottom-0 left-1.5 my-auto"
              hexColor={outputColors.hex || ""}
              onSelect={handleColorPickerSelect}
            />
            <Input
              id="color-input"
              className="px-9 font-mono"
              value={inputColorText}
              placeholder={t("Placeholders.Input")}
              onChange={(e) => handleInputChange(e.target.value)}
              {...plainTypingProps}
            />
            <div className="absolute inset-y-0 right-1 flex items-center">
              <CopyButton
                value={inputColorText}
                size="sm"
                variant="ghost"
                className="text-foreground hover:bg-accent hover:text-accent-foreground size-7 rounded-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Label className="text-lg">{t("Labels.Output")}</Label>

          <div className="grid gap-4 sm:grid-cols-2">
            {COLOR_FORMATS.map((format) => (
              <div key={format} className="flex flex-col gap-2">
                <Label htmlFor={`color-${format}`}>
                  {format.toUpperCase()}
                </Label>
                <div className="relative">
                  <Input
                    id={`color-${format}`}
                    className="pr-9 font-mono"
                    value={outputColors[format] || ""}
                    readOnly
                  />
                  <div className="absolute inset-y-0 right-1 flex items-center">
                    <CopyButton
                      value={outputColors[format] || ""}
                      size="sm"
                      variant="ghost"
                      className="text-foreground hover:bg-accent hover:text-accent-foreground size-7 rounded-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
