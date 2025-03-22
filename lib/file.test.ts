import { describe, expect, it } from "vitest";

import { formatBytes } from "./file";

describe("file utilities", () => {
  describe("formatBytes", () => {
    it("should format 0 bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
    });

    it("should format bytes correctly with default decimals (2)", () => {
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1234)).toBe("1.21 KB");
      expect(formatBytes(1048576)).toBe("1 MB");
      expect(formatBytes(1073741824)).toBe("1 GB");
      expect(formatBytes(1099511627776)).toBe("1 TB");
    });

    it("should respect decimals parameter", () => {
      const bytes = 1234;
      expect(formatBytes(bytes, 0)).toBe("1 KB");
      expect(formatBytes(bytes, 1)).toBe("1.2 KB");
      expect(formatBytes(bytes, 3)).toBe("1.205 KB");
    });

    it("should handle large numbers", () => {
      expect(formatBytes(Math.pow(1024, 5))).toBe("1 PB");
      expect(formatBytes(Math.pow(1024, 6))).toBe("1 EB");
      expect(formatBytes(Math.pow(1024, 7))).toBe("1 ZB");
      expect(formatBytes(Math.pow(1024, 8))).toBe("1 YB");
    });

    it("should handle decimal places for different units", () => {
      expect(formatBytes(1024 * 1.5, 1)).toBe("1.5 KB");
      expect(formatBytes(1024 * 1024 * 1.5, 1)).toBe("1.5 MB");
      expect(formatBytes(1024 * 1024 * 1024 * 1.5, 1)).toBe("1.5 GB");
    });

    it("should handle very small numbers", () => {
      expect(formatBytes(1)).toBe("1 Bytes");
      expect(formatBytes(10)).toBe("10 Bytes");
      expect(formatBytes(100)).toBe("100 Bytes");
    });
  });
});
