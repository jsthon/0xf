import { describe, expect, it } from "vitest";

import {
  GenerateUUID,
  GenerateUUIDs,
  NAMESPACE_VERSIONS,
  PREDEFINED_NAMESPACES,
  RequiresNamespace,
  UUID_VERSIONS,
  UUIDVersion,
  ValidateUUID,
} from "./uuid";

describe("UUID Generator Functions", () => {
  // Tests for single UUID generation
  describe("GenerateUUID function", () => {
    it("should generate valid v4 UUIDs by default", () => {
      const uuid = GenerateUUID({ version: "v4" });
      expect(ValidateUUID(uuid.replace(/[{}"]/g, ""))).toBe(true);
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("should generate valid v1 UUIDs", () => {
      const uuid = GenerateUUID({ version: "v1" });
      expect(ValidateUUID(uuid.replace(/[{}"]/g, ""))).toBe(true);
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("should generate valid v3 UUIDs with namespace and name", () => {
      const uuid = GenerateUUID({
        version: "v3",
        namespace: PREDEFINED_NAMESPACES.DNS,
        name: "example.com",
      });
      expect(ValidateUUID(uuid.replace(/[{}"]/g, ""))).toBe(true);
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      // v3 should be deterministic with same inputs
      const uuid2 = GenerateUUID({
        version: "v3",
        namespace: PREDEFINED_NAMESPACES.DNS,
        name: "example.com",
      });
      expect(uuid).toBe(uuid2);
    });

    it("should generate valid v5 UUIDs with namespace and name", () => {
      const uuid = GenerateUUID({
        version: "v5",
        namespace: PREDEFINED_NAMESPACES.URL,
        name: "https://example.com",
      });
      expect(ValidateUUID(uuid.replace(/[{}"]/g, ""))).toBe(true);
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      // v5 should be deterministic with same inputs
      const uuid2 = GenerateUUID({
        version: "v5",
        namespace: PREDEFINED_NAMESPACES.URL,
        name: "https://example.com",
      });
      expect(uuid).toBe(uuid2);
    });

    it("should return NIL UUID when requested", () => {
      const uuid = GenerateUUID({ version: "nil" });
      expect(uuid).toBe("00000000-0000-0000-0000-000000000000");
    });

    it("should generate different UUIDs for v4 on each call", () => {
      const uuid1 = GenerateUUID({ version: "v4" });
      const uuid2 = GenerateUUID({ version: "v4" });
      const uuid3 = GenerateUUID({ version: "v4" });

      expect(uuid1).not.toBe(uuid2);
      expect(uuid1).not.toBe(uuid3);
      expect(uuid2).not.toBe(uuid3);
    });

    it("should return empty string for v3/v5 without namespace and name", () => {
      const emptyV3 = GenerateUUID({ version: "v3" });
      const emptyV5 = GenerateUUID({ version: "v5" });
      expect(emptyV3).toBe("");
      expect(emptyV5).toBe("");
    });

    it("should handle all formatting options correctly", () => {
      // Test hyphens option
      const withHyphensUuid = GenerateUUID({ version: "v4", hyphens: true });
      expect(withHyphensUuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      const noHyphensUuid = GenerateUUID({ version: "v4", hyphens: false });
      expect(noHyphensUuid).toMatch(/^[0-9a-f]{32}$/i);

      // Test uppercase option
      const uppercaseUuid = GenerateUUID({ version: "v4", uppercase: true });
      expect(uppercaseUuid).toMatch(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/
      );

      // Test braces option
      const bracesUuid = GenerateUUID({ version: "v4", braces: true });
      expect(bracesUuid).toMatch(
        /^\{[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\}$/i
      );

      // Test quotes option
      const quotesUuid = GenerateUUID({ version: "v4", quotes: true });
      expect(quotesUuid).toMatch(
        /^"[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"$/i
      );

      // Test commas option
      const commasUuid = GenerateUUID({ version: "v4", commas: true });
      expect(commasUuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12},$/i
      );
    });

    it("should apply multiple formatting options correctly", () => {
      // Test multiple options - upper + no hyphens + braces
      const multipleOptionsUuid = GenerateUUID({
        version: "v4",
        hyphens: false,
        uppercase: true,
        braces: true,
      });

      const rawUuid = multipleOptionsUuid.replace(/[{}"]/g, "");
      expect(rawUuid).toMatch(/^[0-9A-F]{32}$/);
      expect(multipleOptionsUuid.startsWith("{")).toBe(true);
      expect(multipleOptionsUuid.endsWith("}")).toBe(true);

      // Test with quotes and braces combined
      const bracesQuotesUuid = GenerateUUID({
        version: "v4",
        braces: true,
        quotes: true,
      });

      const rawBracesQuotesUuid = bracesQuotesUuid.replace(/["{},]/g, "");
      expect(ValidateUUID(rawBracesQuotesUuid)).toBe(true);
      expect(bracesQuotesUuid.includes("{")).toBe(true);
      expect(bracesQuotesUuid.includes("}")).toBe(true);
      expect(bracesQuotesUuid.includes('"')).toBe(true);

      // Test all options combined
      const allOptionsUuid = GenerateUUID({
        version: "v4",
        hyphens: true,
        uppercase: true,
        braces: true,
        quotes: true,
        commas: true,
      });

      const rawAllUuid = allOptionsUuid.replace(/["{},]/g, "");
      expect(rawAllUuid).toMatch(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/
      );
      expect(allOptionsUuid.includes("{")).toBe(true);
      expect(allOptionsUuid.includes("}")).toBe(true);
      expect(allOptionsUuid.includes('"')).toBe(true);
      expect(allOptionsUuid.includes(",")).toBe(true);
    });
  });

  // Tests for multiple UUIDs generation
  describe("GenerateUUIDs function", () => {
    it("should generate the specified quantity of UUIDs", () => {
      const uuids = GenerateUUIDs({ version: "v4", quantity: 5 });
      expect(uuids).toHaveLength(5);
      uuids.forEach((uuid) =>
        expect(ValidateUUID(uuid.replace(/[{}"]/g, "").replace(/,$/, ""))).toBe(
          true
        )
      );
    });

    it("should generate at least one UUID even with invalid quantity", () => {
      const uuids = GenerateUUIDs({ version: "v4", quantity: -1 });
      expect(uuids).toHaveLength(1);
    });

    it("should filter empty results for v3/v5 without required parameters", () => {
      const uuids = GenerateUUIDs({
        version: "v3",
        quantity: 3,
      });
      expect(uuids).toEqual([]);
    });

    it("should maintain format options across all generated UUIDs", () => {
      const uuids = GenerateUUIDs({
        version: "v4",
        quantity: 3,
        uppercase: true,
        braces: true,
      });

      expect(uuids).toHaveLength(3);
      uuids.forEach((uuid) => {
        const rawUuid = uuid.replace(/[{}"]/g, "");
        expect(rawUuid).toMatch(
          /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/
        );
        expect(uuid.startsWith("{")).toBe(true);
        expect(uuid.endsWith("}")).toBe(true);
      });
    });

    it("should generate unique UUIDs in batch", () => {
      const uuids = GenerateUUIDs({ version: "v4", quantity: 10 });
      const uniqueUuids = new Set(uuids);
      expect(uniqueUuids.size).toBe(10);
    });
  });

  // Tests for UUID validation
  describe("ValidateUUID function", () => {
    it("should validate correct UUIDs", () => {
      expect(ValidateUUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")).toBe(true);
    });

    it("should reject invalid UUIDs", () => {
      const invalidUuids = [
        "not-a-uuid",
        "",
        "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a1", // too short
        "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a111", // too long
        "xyz",
        "12345",
      ];

      invalidUuids.forEach((uuid) => {
        expect(ValidateUUID(uuid)).toBe(false);
      });
    });
  });

  // Tests for helper functions and constants
  describe("Helper functions and constants", () => {
    it("should correctly identify versions requiring namespace", () => {
      ["v3", "v5"].forEach((version) => {
        expect(RequiresNamespace(version as UUIDVersion)).toBe(true);
      });

      ["v1", "v4", "nil"].forEach((version) => {
        expect(RequiresNamespace(version as UUIDVersion)).toBe(false);
      });
    });

    it("should have valid predefined namespaces", () => {
      expect(PREDEFINED_NAMESPACES.DNS).toBe(
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
      );
      expect(PREDEFINED_NAMESPACES.URL).toBe(
        "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
      );
      expect(PREDEFINED_NAMESPACES.OID).toBe(
        "6ba7b812-9dad-11d1-80b4-00c04fd430c8"
      );
      expect(PREDEFINED_NAMESPACES.X500).toBe(
        "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
      );

      Object.values(PREDEFINED_NAMESPACES).forEach((namespace) => {
        expect(ValidateUUID(namespace)).toBe(true);
      });
    });

    it("should have correct UUID_VERSIONS and NAMESPACE_VERSIONS constants", () => {
      expect(UUID_VERSIONS).toEqual(["v1", "v3", "v4", "v5", "nil"]);
      expect(NAMESPACE_VERSIONS).toEqual(["v3", "v5"]);
    });
  });
});
