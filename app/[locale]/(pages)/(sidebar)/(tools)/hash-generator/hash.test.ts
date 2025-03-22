import { describe, expect, it } from "vitest";

import { generateHash, HASH_ALGORITHMS } from "./hash";

describe("hash-generator utilities", () => {
  describe("generateHash", () => {
    const testString = "Hello, World!";

    it("should generate correct MD5 hash", async () => {
      const md5Hash = await generateHash(testString, "MD5", "hexLower");
      expect(md5Hash).toBe("65a8e27d8879283831b664bd8b7f0ad4");
    });

    it("should generate correct SHA1 hash", async () => {
      const sha1Hash = await generateHash(testString, "SHA1", "hexLower");
      expect(sha1Hash).toBe("0a0a9f2a6772942557ab5355d76af442f8f65e01");
    });

    it("should generate correct SHA256 hash", async () => {
      const sha256Hash = await generateHash(testString, "SHA256", "hexLower");
      expect(sha256Hash).toBe(
        "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f"
      );
    });

    it("should generate correct RIPEMD160 hash", async () => {
      const ripemd160Hash = await generateHash(
        testString,
        "RIPEMD160",
        "hexLower"
      );
      expect(ripemd160Hash).toBe("527a6a4b9a6da75607546842e0e00105350b1aaf");
    });

    it("should generate correct SHA3-256 hash", async () => {
      const sha3Hash = await generateHash(testString, "SHA3-256", "hexLower");
      expect(sha3Hash).toBe(
        "1af17a664e3fa8e419b8ba05c2a173169df76162a5a286e0c405b460d478f7ef"
      );
    });

    it("should generate correct BLAKE3 hash", async () => {
      const blake3Hash = await generateHash(testString, "BLAKE3", "hexLower");
      expect(blake3Hash).toBeTruthy();
      expect(blake3Hash.length).toBe(64); // 256 bits = 64 hex chars
    });

    it("should generate correct XXHash3 hash", async () => {
      const xxhash3 = await generateHash(testString, "XXHash3", "hexLower");
      expect(xxhash3).toBeTruthy();
      expect(xxhash3.length).toBeGreaterThan(0);
    });

    it("should handle empty input", async () => {
      expect(await generateHash("", "MD5", "hexLower")).toBe("");
      expect(
        await generateHash(null as unknown as string, "MD5", "hexLower")
      ).toBe("");
      expect(
        await generateHash(undefined as unknown as string, "MD5", "hexLower")
      ).toBe("");
    });

    describe("encoding formats", () => {
      it("should generate hexLower format correctly", async () => {
        const hash = await generateHash(testString, "MD5", "hexLower");
        expect(hash).toBe("65a8e27d8879283831b664bd8b7f0ad4");
        expect(hash).toBe(hash.toLowerCase());
      });

      it("should generate hexUpper format correctly", async () => {
        const hash = await generateHash(testString, "MD5", "hexUpper");
        expect(hash).toBe("65A8E27D8879283831B664BD8B7F0AD4");
        expect(hash).toBe(hash.toUpperCase());
      });

      it("should generate base64 format correctly", async () => {
        const hash = await generateHash(testString, "MD5", "base64");
        expect(hash).toBe("ZajifYh5KDgxtmS9i38K1A==");
        // Base64 pattern check
        expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
      });
    });
  });

  describe("hash algorithms", () => {
    it("should have all algorithms defined and working", async () => {
      const testString = "test";

      // Test that all algorithms in HASH_ALGORITHMS work
      for (const algorithm of HASH_ALGORITHMS) {
        const hash = await generateHash(testString, algorithm, "hexLower");
        expect(hash).toBeTruthy();
        expect(typeof hash).toBe("string");
        expect(hash.length).toBeGreaterThan(0);
      }
    });

    describe("SHA3 variants", () => {
      const testString = "test";

      it("should handle all SHA3 variants correctly", async () => {
        const sha3_224 = await generateHash(testString, "SHA3-224", "hexLower");
        const sha3_256 = await generateHash(testString, "SHA3-256", "hexLower");
        const sha3_384 = await generateHash(testString, "SHA3-384", "hexLower");
        const sha3_512 = await generateHash(testString, "SHA3-512", "hexLower");

        // Different variants should produce different hashes
        expect(sha3_224).not.toBe(sha3_256);
        expect(sha3_256).not.toBe(sha3_384);
        expect(sha3_384).not.toBe(sha3_512);

        // Length check
        expect(sha3_224.length).toBe(56); // 224 bits = 56 hex chars
        expect(sha3_256.length).toBe(64); // 256 bits = 64 hex chars
        expect(sha3_384.length).toBe(96); // 384 bits = 96 hex chars
        expect(sha3_512.length).toBe(128); // 512 bits = 128 hex chars
      });
    });

    describe("Keccak variants", () => {
      const testString = "test";

      it("should handle all Keccak variants correctly", async () => {
        const keccak_224 = await generateHash(
          testString,
          "Keccak-224",
          "hexLower"
        );
        const keccak_256 = await generateHash(
          testString,
          "Keccak-256",
          "hexLower"
        );
        const keccak_384 = await generateHash(
          testString,
          "Keccak-384",
          "hexLower"
        );
        const keccak_512 = await generateHash(
          testString,
          "Keccak-512",
          "hexLower"
        );

        // Different variants should produce different hashes
        expect(keccak_224).not.toBe(keccak_256);
        expect(keccak_256).not.toBe(keccak_384);
        expect(keccak_384).not.toBe(keccak_512);

        // Length check
        expect(keccak_224.length).toBe(56); // 224 bits = 56 hex chars
        expect(keccak_256.length).toBe(64); // 256 bits = 64 hex chars
        expect(keccak_384.length).toBe(96); // 384 bits = 96 hex chars
        expect(keccak_512.length).toBe(128); // 512 bits = 128 hex chars
      });
    });

    describe("CRC variants", () => {
      const testString = "test";

      it("should handle all CRC variants correctly", async () => {
        const crc32 = await generateHash(testString, "CRC32", "hexLower");
        const crc32c = await generateHash(testString, "CRC32C", "hexLower");
        const crc64 = await generateHash(testString, "CRC64", "hexLower");

        // Different variants should produce different hashes
        expect(crc32).not.toBe(crc32c);
        expect(crc32).not.toBe(crc64);
        expect(crc32c).not.toBe(crc64);

        // Length check
        expect(crc32.length).toBe(8); // 32 bits = 8 hex chars
        expect(crc32c.length).toBe(8); // 32 bits = 8 hex chars
        expect(crc64.length).toBe(16); // 64 bits = 16 hex chars
      });
    });

    describe("XXHash variants", () => {
      const testString = "test";

      it("should handle all XXHash variants correctly", async () => {
        const xxhash32 = await generateHash(testString, "XXHash32", "hexLower");
        const xxhash64 = await generateHash(testString, "XXHash64", "hexLower");
        const xxhash3 = await generateHash(testString, "XXHash3", "hexLower");
        const xxhash128 = await generateHash(
          testString,
          "XXHash128",
          "hexLower"
        );

        // Different variants should produce different hashes
        expect(xxhash32).not.toBe(xxhash64);
        expect(xxhash64).not.toBe(xxhash3);
        expect(xxhash3).not.toBe(xxhash128);

        // Length check
        expect(xxhash32.length).toBe(8); // 32 bits = 8 hex chars
        expect(xxhash64.length).toBe(16); // 64 bits = 16 hex chars
        expect(xxhash3.length).toBe(16); // 64 bits = 16 hex chars
        expect(xxhash128.length).toBe(32); // 128 bits = 32 hex chars
      });
    });
  });
});
