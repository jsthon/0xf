import { describe, expect, it } from "vitest";

import { decodeFromUrl, encodeToUrl, isValidUrlEncoded } from "./url-encoding";

describe("url-encoding utilities", () => {
  describe("isValidUrlEncoded", () => {
    it("should identify valid URL encoded strings", () => {
      expect(isValidUrlEncoded("hello%20world")).toBe(true);
      expect(isValidUrlEncoded("%E7%89%B9%E6%AE%8A%E5%AD%97%E7%AC%A6")).toBe(
        true
      );
      expect(isValidUrlEncoded("a%20b%20c")).toBe(true);
    });

    it("should reject invalid URL encoded strings", () => {
      expect(isValidUrlEncoded("hello world")).toBe(false); // no encoding
      expect(isValidUrlEncoded("")).toBe(false); // empty string
      expect(isValidUrlEncoded(null as unknown as string)).toBe(false); // null
      expect(isValidUrlEncoded(undefined as unknown as string)).toBe(false); // undefined
      expect(isValidUrlEncoded("hello%2world")).toBe(false); // incomplete encoding
      expect(isValidUrlEncoded("hello%ZZworld")).toBe(false); // invalid hex
    });
  });

  describe("encodeToUrl", () => {
    it("should encode strings correctly", () => {
      expect(encodeToUrl("hello world")).toBe("hello%20world");
      expect(encodeToUrl("特殊字符")).toBe(
        "%E7%89%B9%E6%AE%8A%E5%AD%97%E7%AC%A6"
      );
      expect(encodeToUrl("a/b?c=d&e=f")).toBe("a%2Fb%3Fc%3Dd%26e%3Df");
    });

    it("should handle empty strings", () => {
      expect(encodeToUrl("")).toBe("");
    });

    it("should handle null and undefined", () => {
      expect(encodeToUrl(null as unknown as string)).toBe("");
      expect(encodeToUrl(undefined as unknown as string)).toBe("");
    });
  });

  describe("decodeFromUrl", () => {
    it("should decode URL encoded strings correctly", () => {
      expect(decodeFromUrl("hello%20world")).toBe("hello world");
      expect(decodeFromUrl("%E7%89%B9%E6%AE%8A%E5%AD%97%E7%AC%A6")).toBe(
        "特殊字符"
      );
      expect(decodeFromUrl("a%2Fb%3Fc%3Dd%26e%3Df")).toBe("a/b?c=d&e=f");
    });

    it("should handle strings that are not encoded", () => {
      expect(decodeFromUrl("hello world")).toBe("hello world");
    });

    it("should handle empty strings", () => {
      expect(decodeFromUrl("")).toBe("");
    });

    it("should handle null and undefined", () => {
      expect(decodeFromUrl(null as unknown as string)).toBe("");
      expect(decodeFromUrl(undefined as unknown as string)).toBe("");
    });

    it("should return null for invalid encoded strings", () => {
      expect(decodeFromUrl("invalid%2")).toBe(null);
      expect(decodeFromUrl("invalid%ZZ")).toBe(null);
    });
  });
});
