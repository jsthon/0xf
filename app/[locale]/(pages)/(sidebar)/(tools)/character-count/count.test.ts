import { beforeEach, describe, expect, it } from "vitest";

import { countText, EMPTY, PATTERNS } from "./count";

describe("Character Count Utilities", () => {
  describe("PATTERNS", () => {
    // Reset regex lastIndex to avoid state leakage
    beforeEach(() => {
      Object.values(PATTERNS).forEach((pattern: RegExp) => {
        pattern.lastIndex = 0;
      });
    });

    describe("Basic Character Categories", () => {
      it("match Unicode space characters only", () => {
        expect(" \u00A0\u2002\u2003".match(PATTERNS.whitespace)?.length).toBe(
          4
        );
        expect("\n\r\t\f\v".match(PATTERNS.whitespace)).toBeNull();
      });

      it("match Latin script characters", () => {
        expect("abcABCáéíóú".match(PATTERNS.latin)?.length).toBe(11);
      });

      it("match numeric digits from various scripts", () => {
        expect("0123456789０１２３".match(PATTERNS.digit)?.length).toBe(14);
      });

      it("match punctuation and symbols", () => {
        expect(",.;:!?()[]{}@#$%".match(PATTERNS.symbols)?.length).toBe(16);
      });
    });

    describe("Non-Latin Scripts", () => {
      it("match Chinese characters", () => {
        expect("中文汉字".match(PATTERNS.nonLatin)?.length).toBe(4);
      });

      it("match Japanese scripts", () => {
        expect("ひらがなカタカナ".match(PATTERNS.nonLatin)?.length).toBe(8);
      });

      it("match Korean Hangul", () => {
        expect("한글문자".match(PATTERNS.nonLatin)?.length).toBe(4);
      });

      it("match Cyrillic script", () => {
        expect("Привет".match(PATTERNS.nonLatin)?.length).toBe(6);
      });

      it("match Arabic script", () => {
        expect("مرحبا".match(PATTERNS.nonLatin)?.length).toBe(5);
      });

      it("match Thai script", () => {
        expect("สวัสดี".match(PATTERNS.nonLatin)?.length).toBe(6);
      });

      it("match Greek script", () => {
        expect("Γεια".match(PATTERNS.nonLatin)?.length).toBe(4);
      });

      it("match Hebrew script", () => {
        expect("שלום".match(PATTERNS.nonLatin)?.length).toBe(4);
      });
    });

    describe("Symbol Tests", () => {
      it("match basic punctuation and symbols", () => {
        expect(",.;:!?()[]{}@#$%".match(PATTERNS.symbols)?.length).toBe(16);
      });

      it("match basic emoji", () => {
        expect("😀😂🙂😍".match(PATTERNS.symbols)?.length).toBe(4);
      });

      it("match emoji with skin tone modifiers", () => {
        expect("👍👍🏻👍🏼👍🏽👍🏾👍🏿".match(PATTERNS.symbols)?.length).toBe(11);
      });

      it("match emoji with ZWJ sequences", () => {
        expect("👨‍👩‍👧‍👦👩‍💻👨‍🚀".match(PATTERNS.symbols)?.length).toBe(8);
      });

      it("match flag emoji", () => {
        expect("🇺🇸🇯🇵🇪🇺🇨🇳".match(PATTERNS.symbols)?.length).toBe(8);
      });

      it("match mathematical symbols", () => {
        expect("∑∫∂∏∈∉∩∪∧∨¬∃∀".match(PATTERNS.symbols)?.length).toBe(13);
      });

      it("match currency symbols", () => {
        expect("$¢£¥€₹₽₩".match(PATTERNS.symbols)?.length).toBe(8);
      });
    });

    describe("Mixed Text Analysis", () => {
      const sampleText = "Hello 你好 12345 こんにちは Привет! 😀🌍 ∑∫ #@&";

      it("correctly categorize all character types", () => {
        Object.values(PATTERNS).forEach((pattern: RegExp) => {
          pattern.lastIndex = 0;
        });

        const whitespaceCount =
          sampleText.match(PATTERNS.whitespace)?.length || 0;
        const latinCount = sampleText.match(PATTERNS.latin)?.length || 0;
        const nonLatinCount = sampleText.match(PATTERNS.nonLatin)?.length || 0;
        const digitCount = sampleText.match(PATTERNS.digit)?.length || 0;
        const symbolsCount = sampleText.match(PATTERNS.symbols)?.length || 0;

        expect(whitespaceCount).toBe(7);
        expect(latinCount).toBe(5);
        expect(nonLatinCount).toBe(13);
        expect(digitCount).toBe(5);
        expect(symbolsCount).toBe(8);
      });
    });
  });

  describe("countText", () => {
    it("returns EMPTY for empty input", () => {
      expect(countText("")).toEqual(EMPTY);
    });

    it("returns EMPTY for null input", () => {
      // @ts-expect-error: Testing null input handling
      expect(countText(null)).toEqual(EMPTY);
    });

    it("correctly counts a simple English text", () => {
      const result = countText("Hello, world!");
      expect(result.total).toBe(13);
      expect(result.words).toBe(2);
      expect(result.lines).toBe(1);
      expect(result.latin).toBe(10);
      expect(result.symbols).toBe(2);
      expect(result.whitespace).toBe(1);
      expect(result.digit).toBe(0);
      expect(result.nonLatin).toBe(0);
    });

    it("correctly counts multi-line text", () => {
      const result = countText("Line 1\nLine 2\nLine 3");
      expect(result.lines).toBe(3);
      expect(result.words).toBe(6);
    });

    it("correctly counts mixed-script text", () => {
      const result = countText("Hello 你好 123");
      expect(result.total).toBe(12);
      expect(result.words).toBe(3);
      expect(result.latin).toBe(5);
      expect(result.nonLatin).toBe(2);
      expect(result.digit).toBe(3);
      expect(result.whitespace).toBe(2);
    });

    it("handles emojis and special characters", () => {
      const result = countText("Hi 👋 there!");
      expect(result.total).toBe(11);
      expect(result.words).toBe(3);
      expect(result.symbols).toBe(2);
    });
  });
});
