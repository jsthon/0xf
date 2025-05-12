import { colord } from "colord";
import { describe, expect, it } from "vitest";

import { COLOR_FORMATS, formatColor, getColorFormat } from "./color-format";

describe("formatColor", () => {
  // Test basic color format conversions
  it("should convert colors to hex format", () => {
    expect(formatColor("#ff0000", "hex")).toBe("#ff0000");
    expect(formatColor("rgb(255, 0, 0)", "hex")).toBe("#ff0000");
    expect(formatColor("red", "hex")).toBe("#ff0000");
  });

  it("should convert colors to rgb format", () => {
    expect(formatColor("#ff0000", "rgb")).toBe("rgb(255, 0, 0)");
    expect(formatColor("red", "rgb")).toBe("rgb(255, 0, 0)");
  });

  it("should convert colors to hsl format", () => {
    expect(formatColor("#ff0000", "hsl")).toBe("hsl(0, 100%, 50%)");
    expect(formatColor("red", "hsl")).toBe("hsl(0, 100%, 50%)");
  });

  it("should convert colors to hwb format", () => {
    expect(formatColor("#ff0000", "hwb")).toBe("hwb(0 0% 0%)");
    expect(formatColor("red", "hwb")).toBe("hwb(0 0% 0%)");
  });

  it("should convert colors to lch format", () => {
    // Use regex match for LCH due to potential rounding differences
    const redLch = formatColor("#ff0000", "lch");
    expect(redLch).toMatch(/lch\(54\.29% 106\.84 40\.85\)/);
  });

  it("should convert colors to cmyk format", () => {
    expect(formatColor("#ff0000", "cmyk")).toBe("device-cmyk(0% 100% 100% 0%)");
    expect(formatColor("red", "cmyk")).toBe("device-cmyk(0% 100% 100% 0%)");
  });

  // Test Colord object input
  it("should handle colord object as input", () => {
    const redColord = colord("red");
    expect(formatColor(redColord, "hex")).toBe("#ff0000");
  });

  // Test different color inputs
  it("should handle various colors correctly", () => {
    // Blue, green and transparent black
    expect(formatColor("blue", "hex")).toBe("#0000ff");
    expect(formatColor("green", "rgb")).toBe("rgb(0, 128, 0)");
    expect(formatColor("rgba(0, 0, 0, 0.5)", "rgb")).toBe("rgba(0, 0, 0, 0.5)");
  });

  // Test all supported formats
  it("should support all color formats", () => {
    const testColor = "#3366cc";

    COLOR_FORMATS.forEach((format) => {
      const result = formatColor(testColor, format);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });
});

describe("getColorFormat", () => {
  it("should return the correct format for valid color strings", () => {
    expect(getColorFormat("#ff0000")).toBe("hex");
    expect(getColorFormat("rgb(255, 0, 0)")).toBe("rgb");
    expect(getColorFormat("rgba(255, 0, 0, 0.5)")).toBe("rgb");
    expect(getColorFormat("hsl(0, 100%, 50%)")).toBe("hsl");
    expect(getColorFormat("hsla(0, 100%, 50%, 0.5)")).toBe("hsl");
    expect(getColorFormat("hwb(0 0% 100%)")).toBe("hwb");
    expect(getColorFormat("lch(54.29% 106.84 40.85)")).toBe("lch");
    expect(getColorFormat("device-cmyk(0% 100% 100% 0%)")).toBe("cmyk");
    // 300 is out of range, but still valid rgb
    expect(getColorFormat("rgb(300, 0, 0)")).toBe("rgb");
  });

  it("should return undefined for invalid color strings", () => {
    expect(getColorFormat("invalid-color")).toBeUndefined();
    expect(getColorFormat("#invalid")).toBeUndefined();
    expect(getColorFormat("ff0000")).toBeUndefined();
    expect(getColorFormat("rgb(255,0)")).toBeUndefined();
    expect(getColorFormat("hwb(0,0%,100%)")).toBeUndefined();
  });

  it("should handle empty string input", () => {
    expect(getColorFormat("")).toBeUndefined();
  });

  it("should return undefined for named colors that are not supported", () => {
    expect(getColorFormat("red")).toBeUndefined();
    expect(getColorFormat("turquoise")).toBeUndefined();
  });
});
