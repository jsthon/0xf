import { colord, Colord, extend, getFormat } from "colord";
import cmykPlugin from "colord/plugins/cmyk";
import hwbPlugin from "colord/plugins/hwb";
import lchPlugin from "colord/plugins/lch";
import namesPlugin from "colord/plugins/names";

// Enable colord plugins
extend([cmykPlugin, hwbPlugin, lchPlugin, namesPlugin]);

// Type for color format
export const COLOR_FORMATS = [
  "hex",
  "rgb",
  "hsl",
  "hwb",
  "lch",
  "cmyk",
] as const;
export type ColorFormat = (typeof COLOR_FORMATS)[number];

// Get color format from color string
export const getColorFormat = (color: string): ColorFormat | undefined => {
  const format = getFormat(color) as ColorFormat;
  return COLOR_FORMATS.includes(format) ? format : undefined;
};

// Format color from string or colord object
export const formatColor = (color: string | Colord, format: ColorFormat) => {
  const c = typeof color === "string" ? colord(color) : color;

  switch (format) {
    case "hex":
      return c.toHex();
    case "rgb":
      return c.toRgbString();
    case "hsl":
      return c.toHslString();
    case "hwb":
      return c.toHwbString();
    case "lch":
      return c.toLchString();
    case "cmyk":
      return c.toCmykString();
  }
};
