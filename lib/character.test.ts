import { describe, expect, it } from "vitest";

import {
  CharEncoding,
  decodeCharacters,
  detectCharEncoding,
  encodeCharacters,
  fromCodePoint,
  fromEscapeSequence,
  fromHtmlEntity,
  isCodePoint,
  isEscapeSequence,
  isHtmlEntity,
  toCodePoint,
  toEscapeSequence,
  toHtmlEntity,
} from "./character";

describe("character utilities", () => {
  describe("CharEncoding enum", () => {
    it("should have the correct values", () => {
      expect(CharEncoding.CodePoint).toBe("codePoint");
      expect(CharEncoding.EscapeSequence).toBe("escapeSequence");
      expect(CharEncoding.HtmlEntity).toBe("htmlEntity");
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
      expect(isEscapeSequence(" \\u0041 ")).toBe(true); // with whitespace
    });

    it("should reject invalid escape sequences", () => {
      expect(isEscapeSequence("\\u")).toBe(false);
      expect(isEscapeSequence("\\uXYZ")).toBe(false);
      expect(isEscapeSequence("0041")).toBe(false);
    });
  });

  describe("isHtmlEntity", () => {
    it("should identify valid HTML entities", () => {
      expect(isHtmlEntity("&#65;")).toBe(true);
      expect(isHtmlEntity(" &#65; ")).toBe(true); // with whitespace
    });

    it("should reject invalid HTML entities", () => {
      expect(isHtmlEntity("&#")).toBe(false);
      expect(isHtmlEntity("&#XYZ;")).toBe(false);
      expect(isHtmlEntity("65")).toBe(false);
    });
  });

  describe("detectCharEncoding", () => {
    it("should detect code point format", () => {
      expect(detectCharEncoding("U+0041")).toBe(CharEncoding.CodePoint);
    });

    it("should detect escape sequence format", () => {
      expect(detectCharEncoding("\\u0041")).toBe(CharEncoding.EscapeSequence);
    });

    it("should detect HTML entity format", () => {
      expect(detectCharEncoding("&#65;")).toBe(CharEncoding.HtmlEntity);
    });

    it("should return null for unknown formats", () => {
      expect(detectCharEncoding("A")).toBe(null);
      expect(detectCharEncoding("")).toBe(null);
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
    it("should convert characters to escape sequences", () => {
      expect(toEscapeSequence("A")).toBe("\\u0041");
      expect(toEscapeSequence("😀")).toBe("\\u1F600");
    });

    it("should handle empty strings", () => {
      expect(toEscapeSequence("")).toBe("");
    });
  });

  describe("toHtmlEntity", () => {
    it("should convert characters to HTML entities", () => {
      expect(toHtmlEntity("A")).toBe("&#65;");
      expect(toHtmlEntity("😀")).toBe("&#128512;");
    });

    it("should handle empty strings", () => {
      expect(toHtmlEntity("")).toBe("");
    });
  });

  describe("encodeCharacters", () => {
    it("should encode text to code points", () => {
      expect(encodeCharacters("AB", CharEncoding.CodePoint)).toBe(
        "U+0041U+0042"
      );
    });

    it("should encode text to escape sequences", () => {
      expect(encodeCharacters("AB", CharEncoding.EscapeSequence)).toBe(
        "\\u0041\\u0042"
      );
    });

    it("should encode text to HTML entities", () => {
      expect(encodeCharacters("AB", CharEncoding.HtmlEntity)).toBe(
        "&#65;&#66;"
      );
    });

    it("should handle empty strings", () => {
      expect(encodeCharacters("", CharEncoding.CodePoint)).toBe("");
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
    it("should convert escape sequences to characters", () => {
      expect(fromEscapeSequence("\\u0041")).toBe("A");
    });

    it("should return null for invalid escape sequences", () => {
      expect(fromEscapeSequence("\\uXXXX")).toBe(null);
      expect(fromEscapeSequence("invalid")).toBe(null);
    });
  });

  describe("fromHtmlEntity", () => {
    it("should convert HTML entities to characters", () => {
      expect(fromHtmlEntity("&#65;")).toBe("A");
      expect(fromHtmlEntity("&#128512;")).toBe("😀");
    });

    it("should return null for invalid HTML entities", () => {
      expect(fromHtmlEntity("&#XYZ;")).toBe(null);
      expect(fromHtmlEntity("invalid")).toBe(null);
    });
  });

  describe("decodeCharacters", () => {
    it("should decode code points with explicit format", () => {
      expect(decodeCharacters("U+0041U+0042", CharEncoding.CodePoint)).toBe(
        "AB"
      );
    });

    it("should decode escape sequences with explicit format", () => {
      expect(
        decodeCharacters("\\u0041\\u0042", CharEncoding.EscapeSequence)
      ).toBe("AB");
    });

    it("should decode HTML entities with explicit format", () => {
      expect(decodeCharacters("&#65;&#66;", CharEncoding.HtmlEntity)).toBe(
        "AB"
      );
    });

    it("should auto-detect format if not specified", () => {
      expect(decodeCharacters("U+0041U+0042")).toBe("AB");
      expect(decodeCharacters("\\u0041\\u0042")).toBe("AB");
      expect(decodeCharacters("&#65;&#66;")).toBe("AB");
    });

    it("should handle empty strings", () => {
      expect(decodeCharacters("")).toBe("");
    });

    it("should return null for invalid input", () => {
      expect(decodeCharacters("invalid")).toBe(null);
    });
  });
});
