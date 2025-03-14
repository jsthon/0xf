import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  convertToUrlSafe,
  decodeFromBase64,
  encodeToBase64,
  hasStandardChars,
  hasUrlSafeChars,
  isValidBase64,
  standardizeBase64,
} from "./base64";

// mock window.btoa and window.atob
beforeAll(() => {
  global.btoa = vi.fn((str) => Buffer.from(str, "binary").toString("base64"));
  global.atob = vi.fn((str) => Buffer.from(str, "base64").toString("binary"));
});

describe("base64 utilities", () => {
  describe("hasUrlSafeChars", () => {
    it("should detect URL safe characters", () => {
      expect(hasUrlSafeChars("abc-123")).toBe(true);
      expect(hasUrlSafeChars("abc_123")).toBe(true);
      expect(hasUrlSafeChars("abc-123_xyz")).toBe(true);
      expect(hasUrlSafeChars("abcABC123")).toBe(false);
    });
  });

  describe("hasStandardChars", () => {
    it("should detect standard Base64 characters", () => {
      expect(hasStandardChars("abc+123")).toBe(true);
      expect(hasStandardChars("abc/123")).toBe(true);
      expect(hasStandardChars("abc+123/xyz")).toBe(true);
      expect(hasStandardChars("abcABC123")).toBe(false);
    });
  });

  describe("isValidBase64", () => {
    it("should validate standard Base64 strings", () => {
      expect(isValidBase64("SGVsbG8gV29ybGQ=")).toBe(true);
      expect(isValidBase64("SGVsbG8gV29ybGQ")).toBe(true); // without padding
      expect(isValidBase64("SGVsbG8+V29ybGQ=")).toBe(true);
    });

    it("should validate URL safe Base64 strings", () => {
      expect(isValidBase64("SGVsbG8tV29ybGQ")).toBe(true);
      expect(isValidBase64("SGVsbG8_V29ybGQ")).toBe(true);
    });

    it("should reject invalid Base64 strings", () => {
      expect(isValidBase64("")).toBe(false); // empty string
      expect(isValidBase64("SGVsbG8gV29ybGQ=a")).toBe(false); // invalid padding
      expect(isValidBase64("SGVsbG8gV29ybGQ===")).toBe(false); // too much padding
      expect(isValidBase64("SGVsbG8gV29ybGQ!")).toBe(false); // invalid character
      expect(isValidBase64("SGVsbG8+V29ybGQ-")).toBe(false); // mixed standard and URL safe
    });
  });

  describe("convertToUrlSafe", () => {
    it("should convert standard Base64 to URL safe format", () => {
      expect(convertToUrlSafe("a+b/c=")).toBe("a-b_c");
      expect(convertToUrlSafe("a+b/c")).toBe("a-b_c");
      expect(convertToUrlSafe("a+b/c==")).toBe("a-b_c");
      expect(convertToUrlSafe("abc123")).toBe("abc123"); // no change needed
    });
  });

  describe("standardizeBase64", () => {
    it("should convert URL safe to standard Base64", () => {
      expect(standardizeBase64("a-b_c")).toBe("a+b/c");
      const result1 = standardizeBase64("a-b_");
      expect(result1).toBeDefined();
      expect(result1.startsWith("a+b/")).toBe(true);

      const result2 = standardizeBase64("a-");
      expect(result2).toBeDefined();
      expect(result2.startsWith("a+")).toBe(true);

      const result3 = standardizeBase64("abc123");
      expect(result3).toBeDefined();
      expect(result3.includes("abc123")).toBe(true);
    });
  });

  describe("encodeToBase64", () => {
    it("should encode strings to Base64", () => {
      expect(encodeToBase64("Hello World")).toBe("SGVsbG8gV29ybGQ=");
      expect(encodeToBase64("Hello World", true)).toBe("SGVsbG8gV29ybGQ"); // URL safe
      const encoded = encodeToBase64("特殊字符");
      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe("string");
    });

    it("should handle empty strings", () => {
      expect(encodeToBase64("")).toBe("");
    });
  });

  describe("decodeFromBase64", () => {
    it("should decode Base64 to strings", () => {
      expect(decodeFromBase64("SGVsbG8gV29ybGQ=")).toBe("Hello World");
      expect(decodeFromBase64("SGVsbG8gV29ybGQ")).toBe("Hello World"); // without padding
      const decoded = decodeFromBase64("SGVsbG8tV29ybGQ");
      expect(decoded).toBeDefined();
      expect(typeof decoded).toBe("string");
      expect(decoded?.includes("Hello")).toBe(true);

      const encoded = encodeToBase64("特殊字符");
      if (encoded) {
        expect(decodeFromBase64(encoded)).toBe("特殊字符");
      }
    });

    it("should handle empty strings", () => {
      expect(decodeFromBase64("")).toBe("");
    });

    it("should return null for invalid input", () => {
      expect(decodeFromBase64("invalid!base64")).toBe(null);
    });
  });
});
