import { describe, expect, it } from "vitest";

import {
  decodeCharacters,
  detectEscapeType,
  encodeCharacters,
  EscapeType,
  fromCodePoint,
  fromCssEscape,
  fromEscapeSequence,
  fromHtmlCode,
  isCodePoint,
  isCssEscape,
  isEscapeSequence,
  isHtmlCode,
  isHtmlEntity,
  toCodePoint,
  toCssEscape,
  toEscapeSequence,
  toHtmlCode,
} from "./character";

describe("character utilities", () => {
  describe("EscapeType enum", () => {
    it("should have the correct values", () => {
      expect(EscapeType.CodePoint).toBe("codePoint");
      expect(EscapeType.EscapeSequence).toBe("escapeSequence");
      expect(EscapeType.CssEscape).toBe("cssEscape");
      expect(EscapeType.HtmlCode).toBe("htmlCode");
      expect(EscapeType.HtmlEntity).toBe("htmlEntity");
    });
  });

  describe("isCodePoint", () => {
    it("should identify valid code points", () => {
      expect(isCodePoint("U+0041")).toBe(true);
      expect(isCodePoint("U+1F600")).toBe(true);
      expect(isCodePoint(" U+0041 ")).toBe(true); // with whitespace
    });

    it("should reject invalid code points", () => {
      expect(isCodePoint("U+")).toBe(false);
      expect(isCodePoint("U+XYZ")).toBe(false);
      expect(isCodePoint("0041")).toBe(false);
    });
  });

  describe("isEscapeSequence", () => {
    it("should identify valid escape sequences", () => {
      expect(isEscapeSequence("\\u0041")).toBe(true);
      expect(isEscapeSequence("\\u{1F600}")).toBe(true); // Extended format
      expect(isEscapeSequence(" \\u0041 ")).toBe(true); // with whitespace
    });

    it("should reject invalid escape sequences", () => {
      expect(isEscapeSequence("\\u")).toBe(false);
      expect(isEscapeSequence("\\uXYZ")).toBe(false);
      expect(isEscapeSequence("0041")).toBe(false);
    });
  });

  describe("isHtmlCode", () => {
    it("should identify valid HTML numeric codes", () => {
      expect(isHtmlCode("&#65;")).toBe(true);
      expect(isHtmlCode("&#x41;")).toBe(true); // Hex format
      expect(isHtmlCode(" &#65; ")).toBe(true); // with whitespace
    });

    it("should reject invalid HTML numeric codes", () => {
      expect(isHtmlCode("&#")).toBe(false);
      expect(isHtmlCode("&#XYZ;")).toBe(false);
      expect(isHtmlCode("65")).toBe(false);
    });
  });

  describe("isHtmlEntity", () => {
    it("should identify valid HTML named entities", () => {
      expect(isHtmlEntity("&amp;")).toBe(true);
      expect(isHtmlEntity(" &lt; ")).toBe(true); // with whitespace
    });

    it("should reject invalid HTML named entities", () => {
      expect(isHtmlEntity("&")).toBe(false);
      expect(isHtmlEntity("&XYZ")).toBe(false);
      expect(isHtmlEntity("amp;")).toBe(false);
    });
  });

  describe("isCssEscape", () => {
    it("should identify valid CSS escape sequences", () => {
      expect(isCssEscape("\\41")).toBe(true);
      expect(isCssEscape("\\1F600")).toBe(true);
      expect(isCssEscape("\\1F600 ")).toBe(true); // with trailing space
      expect(isCssEscape(" \\41 ")).toBe(true); // with whitespace
    });

    it("should reject invalid CSS escape sequences", () => {
      expect(isCssEscape("\\")).toBe(false);
      expect(isCssEscape("\\XYZ")).toBe(false);
      expect(isCssEscape("41")).toBe(false);
    });
  });

  describe("detectEscapeType", () => {
    it("should detect code point format", () => {
      expect(detectEscapeType("U+0041")).toBe(EscapeType.CodePoint);
    });

    it("should detect escape sequence format", () => {
      expect(detectEscapeType("\\u0041")).toBe(EscapeType.EscapeSequence);
      expect(detectEscapeType("\\u{1F600}")).toBe(EscapeType.EscapeSequence);
    });

    it("should detect CSS escape sequence format", () => {
      expect(detectEscapeType("\\41")).toBe(EscapeType.CssEscape);
      expect(detectEscapeType("\\1F600")).toBe(EscapeType.CssEscape);
    });

    it("should detect HTML numeric code format", () => {
      expect(detectEscapeType("&#65;")).toBe(EscapeType.HtmlCode);
      expect(detectEscapeType("&#x41;")).toBe(EscapeType.HtmlCode); // Hex format
    });

    it("should detect HTML named entity format", () => {
      expect(detectEscapeType("&amp;")).toBe(EscapeType.HtmlEntity);
    });

    it("should return null for unknown formats", () => {
      expect(detectEscapeType("A")).toBe(null);
      expect(detectEscapeType("")).toBe(null);
    });
  });

  describe("toCodePoint", () => {
    it("should convert characters to code points", () => {
      expect(toCodePoint("A")).toBe("U+0041");
      expect(toCodePoint("😀")).toBe("U+1F600");
    });

    it("should handle empty strings", () => {
      expect(toCodePoint("")).toBe("");
    });
  });

  describe("toEscapeSequence", () => {
    it("should convert BMP characters to standard escape sequences", () => {
      expect(toEscapeSequence("A")).toBe("\\u0041");
    });

    it("should convert non-BMP characters to extended escape sequences", () => {
      expect(toEscapeSequence("😀")).toBe("\\u{1F600}");
    });

    it("should handle empty strings", () => {
      expect(toEscapeSequence("")).toBe("");
    });
  });

  describe("toHtmlCode", () => {
    it("should convert characters to HTML numeric codes", () => {
      expect(toHtmlCode("A")).toBe("&#65;");
      expect(toHtmlCode("😀")).toBe("&#128512;");
    });

    it("should handle empty strings", () => {
      expect(toHtmlCode("")).toBe("");
    });
  });

  describe("toCssEscape", () => {
    it("should convert characters to CSS escape sequences", () => {
      expect(toCssEscape("A")).toBe("\\0041");
      expect(toCssEscape("😀")).toBe("\\1F600");
    });

    it("should handle empty strings", () => {
      expect(toCssEscape("")).toBe("");
    });
  });

  describe("encodeCharacters", () => {
    it("should encode text to code points", () => {
      expect(encodeCharacters("AB", EscapeType.CodePoint)).toBe("U+0041U+0042");
    });

    it("should encode text to escape sequences", () => {
      expect(encodeCharacters("AB", EscapeType.EscapeSequence)).toBe(
        "\\u0041\\u0042"
      );
      expect(encodeCharacters("A😀", EscapeType.EscapeSequence)).toBe(
        "\\u0041\\u{1F600}"
      );
    });

    it("should encode text to HTML numeric codes", () => {
      expect(encodeCharacters("AB", EscapeType.HtmlCode)).toBe("&#65;&#66;");
    });

    it("should encode text to HTML named entities", () => {
      // Test space conversion to &nbsp;
      expect(encodeCharacters("A B", EscapeType.HtmlEntity)).toContain(
        "&nbsp;"
      );

      // Test special characters conversion to named entities
      expect(encodeCharacters("<>", EscapeType.HtmlEntity)).toBe("&lt;&gt;");
    });

    it("should encode text to CSS escape sequences", () => {
      expect(encodeCharacters("AB", EscapeType.CssEscape)).toBe("\\0041\\0042");
      expect(encodeCharacters("A😀", EscapeType.CssEscape)).toBe(
        "\\0041\\1F600"
      );
    });

    it("should handle empty strings", () => {
      expect(encodeCharacters("", EscapeType.CodePoint)).toBe("");
    });
  });

  describe("fromCodePoint", () => {
    it("should convert code points to characters", () => {
      expect(fromCodePoint("U+0041")).toBe("A");
      expect(fromCodePoint("U+1F600")).toBe("😀");
    });

    it("should return null for invalid code points", () => {
      expect(fromCodePoint("U+XXXXXX")).toBe(null);
      expect(fromCodePoint("invalid")).toBe(null);
    });
  });

  describe("fromEscapeSequence", () => {
    it("should convert standard escape sequences to characters", () => {
      expect(fromEscapeSequence("\\u0041")).toBe("A");
    });

    it("should convert extended escape sequences to characters", () => {
      expect(fromEscapeSequence("\\u{1F600}")).toBe("😀");
    });

    it("should return null for invalid escape sequences", () => {
      expect(fromEscapeSequence("\\uXXXX")).toBe(null);
      expect(fromEscapeSequence("invalid")).toBe(null);
    });
  });

  describe("fromHtmlCode", () => {
    it("should convert decimal HTML numeric codes to characters", () => {
      expect(fromHtmlCode("&#65;")).toBe("A");
      expect(fromHtmlCode("&#128512;")).toBe("😀");
    });

    it("should convert hexadecimal HTML numeric codes to characters", () => {
      expect(fromHtmlCode("&#x41;")).toBe("A");
      expect(fromHtmlCode("&#x1F600;")).toBe("😀");
    });

    it("should return null for invalid HTML numeric codes", () => {
      expect(fromHtmlCode("&#XYZ;")).toBe(null);
      expect(fromHtmlCode("invalid")).toBe(null);
    });
  });

  describe("fromCssEscape", () => {
    it("should convert CSS escape sequences to characters", () => {
      expect(fromCssEscape("\\41")).toBe("A");
      expect(fromCssEscape("\\0041")).toBe("A");
      expect(fromCssEscape("\\1F600")).toBe("😀");
      expect(fromCssEscape("\\01F600")).toBe("😀");
      expect(fromCssEscape("\\1F600 ")).toBe("😀"); // with trailing space
    });

    it("should return null for invalid CSS escape sequences", () => {
      expect(fromCssEscape("\\XYZ")).toBe(null);
      expect(fromCssEscape("invalid")).toBe(null);
    });
  });

  describe("decodeCharacters", () => {
    it("should decode code points with explicit format", () => {
      expect(decodeCharacters("U+0041U+0042", EscapeType.CodePoint)).toBe("AB");
    });

    it("should decode escape sequences with explicit format", () => {
      expect(
        decodeCharacters("\\u0041\\u0042", EscapeType.EscapeSequence)
      ).toBe("AB");
      expect(
        decodeCharacters("\\u0041\\u{1F600}", EscapeType.EscapeSequence)
      ).toBe("A😀");
    });

    it("should decode HTML numeric codes with explicit format", () => {
      expect(decodeCharacters("&#65;&#66;", EscapeType.HtmlCode)).toBe("AB");
      expect(decodeCharacters("&#x41;&#x42;", EscapeType.HtmlCode)).toBe("AB");
      expect(decodeCharacters("&#65;&#x42;", EscapeType.HtmlCode)).toBe("AB"); // Mixed format
    });

    it("should decode HTML named entities with explicit format", () => {
      expect(decodeCharacters("&lt;&gt;", EscapeType.HtmlEntity)).toBe("<>");
      // Use the actual non-breaking space character (U+00A0) for comparison
      const nonBreakingSpace = String.fromCharCode(160); // U+00A0
      expect(decodeCharacters("&nbsp;", EscapeType.HtmlEntity)).toBe(
        nonBreakingSpace
      );
    });

    it("should decode CSS escape sequences with explicit format", () => {
      expect(decodeCharacters("\\41\\42", EscapeType.CssEscape)).toBe("AB");
      expect(decodeCharacters("\\0041\\0042", EscapeType.CssEscape)).toBe("AB");
      expect(decodeCharacters("\\41\\1F600", EscapeType.CssEscape)).toBe("A😀");
      expect(decodeCharacters("\\0041\\1F600", EscapeType.CssEscape)).toBe(
        "A😀"
      );
      expect(decodeCharacters("\\41 \\42 ", EscapeType.CssEscape)).toBe("AB"); // with spaces
    });

    it("should auto-detect format if not specified", () => {
      expect(decodeCharacters("U+0041U+0042")).toBe("AB");
      expect(decodeCharacters("\\u0041\\u0042")).toBe("AB");
      expect(decodeCharacters("\\u0041\\u{1F600}")).toBe("A😀");
      expect(decodeCharacters("\\41\\42")).toBe("AB"); // CSS escape
      expect(decodeCharacters("\\0041\\0042")).toBe("AB"); // CSS escape with long format
      expect(decodeCharacters("\\41 \\1F600 ")).toBe("A😀"); // CSS escape with spaces
      expect(decodeCharacters("&#65;&#66;")).toBe("AB");
      expect(decodeCharacters("&#x41;&#x42;")).toBe("AB");
      expect(decodeCharacters("&lt;&gt;")).toBe("<>");
    });

    it("should handle empty strings", () => {
      expect(decodeCharacters("")).toBe("");
    });

    it("should return null for invalid input", () => {
      expect(decodeCharacters("invalid")).toBe(null);
    });
  });
});
