import { useState } from "react";
import { colord, extend } from "colord";
import cmykPlugin from "colord/plugins/cmyk";
import hwbPlugin from "colord/plugins/hwb";
import lchPlugin from "colord/plugins/lch";
import namesPlugin from "colord/plugins/names";

import {
  formatColor,
  getColorFormat,
  type ColorFormat,
} from "@/lib/color-format";
import { Input } from "@/components/ui/input";

import { ColorPicker } from "./color-picker";

// Enable colord plugins
extend([cmykPlugin, hwbPlugin, lchPlugin, namesPlugin]);

type Props = {
  format?: ColorFormat;
  value: string;
  disabledAlpha?: boolean;
  onChange: (value: string) => void;
};

export function ColorInput({
  format,
  value,
  disabledAlpha,
  onChange,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & Props) {
  const [color, setColor] = useState(value);
  const [colorFormat, setColorFormat] = useState<ColorFormat>(
    format || getColorFormat(value) || "hex"
  );
  const [hexColor, setHexColor] = useState(colord(value).toHex());

  const handleColorPickerSelect = (hexColor: string) => {
    const formattedColor = formatColor(hexColor, colorFormat);

    setHexColor(hexColor);
    setColor(formattedColor);
    onChange(formattedColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const valueFormat = getColorFormat(value);

    // set original value
    setColor(value);

    if (valueFormat) {
      setHexColor(colord(value).toHex());
      onChange(formatColor(value, format || valueFormat));

      // if format is not fixed from props, auto detect the format
      if (!format) setColorFormat(valueFormat);
    }
  };

  const handleInputBlur = () => {
    setColor(formatColor(color, colorFormat));
  };

  return (
    <div className="relative">
      <ColorPicker
        className="absolute top-0 bottom-0 left-1.5 my-auto"
        hexColor={hexColor}
        disabledAlpha={disabledAlpha}
        onSelect={handleColorPickerSelect}
      />
      <Input
        className="pl-9 font-mono"
        value={color}
        spellCheck={false}
        autoComplete="off"
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        {...props}
      />
    </div>
  );
}
