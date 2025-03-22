import {
  createAdler32,
  createBLAKE2b,
  createBLAKE2s,
  createBLAKE3,
  createCRC32,
  createCRC64,
  createKeccak,
  createMD4,
  createMD5,
  createRIPEMD160,
  createSHA1,
  createSHA3,
  createSHA224,
  createSHA256,
  createSHA384,
  createSHA512,
  createSM3,
  createWhirlpool,
  createXXHash3,
  createXXHash32,
  createXXHash64,
  createXXHash128,
  IDataType,
  IHasher,
} from "hash-wasm";

// Re-export IDataType to be used in consuming code
export type { IDataType };

// Supported hash algorithms
export type HashAlgorithm =
  | "Adler32"
  | "BLAKE2b"
  | "BLAKE2s"
  | "BLAKE3"
  | "CRC32"
  | "CRC32C"
  | "CRC64"
  | "Keccak-224"
  | "Keccak-256"
  | "Keccak-384"
  | "Keccak-512"
  | "MD4"
  | "MD5"
  | "RIPEMD160"
  | "SHA1"
  | "SHA224"
  | "SHA256"
  | "SHA384"
  | "SHA512"
  | "SHA3-224"
  | "SHA3-256"
  | "SHA3-384"
  | "SHA3-512"
  | "SM3"
  | "Whirlpool"
  | "XXHash32"
  | "XXHash64"
  | "XXHash3"
  | "XXHash128";

// List of all supported hash algorithms
export const HASH_ALGORITHMS: HashAlgorithm[] = [
  "Adler32",
  "BLAKE2b",
  "BLAKE2s",
  "BLAKE3",
  "CRC32",
  "CRC32C",
  "CRC64",
  "Keccak-224",
  "Keccak-256",
  "Keccak-384",
  "Keccak-512",
  "MD4",
  "MD5",
  "RIPEMD160",
  "SHA1",
  "SHA224",
  "SHA256",
  "SHA384",
  "SHA512",
  "SHA3-224",
  "SHA3-256",
  "SHA3-384",
  "SHA3-512",
  "SM3",
  "Whirlpool",
  "XXHash32",
  "XXHash64",
  "XXHash3",
  "XXHash128",
];

// Supported digest encoding formats
export type DigestEncoding = "hexLower" | "hexUpper" | "base64";

// List of all supported digest encoding formats
export const DIGEST_ENCODINGS: DigestEncoding[] = [
  "hexLower",
  "hexUpper",
  "base64",
];

// Mapping of hash algorithms to their creator functions
const ALGORITHM_CREATORS: Record<HashAlgorithm, () => Promise<IHasher>> = {
  Adler32: () => createAdler32(),
  BLAKE2b: () => createBLAKE2b(),
  BLAKE2s: () => createBLAKE2s(),
  BLAKE3: () => createBLAKE3(),
  CRC32: () => createCRC32(),
  CRC32C: () => createCRC32(0x82f63b78), // CRC32C polynomial
  CRC64: () => createCRC64(),
  "Keccak-224": () => createKeccak(224),
  "Keccak-256": () => createKeccak(256),
  "Keccak-384": () => createKeccak(384),
  "Keccak-512": () => createKeccak(512),
  MD4: () => createMD4(),
  MD5: () => createMD5(),
  RIPEMD160: () => createRIPEMD160(),
  SHA1: () => createSHA1(),
  SHA224: () => createSHA224(),
  SHA256: () => createSHA256(),
  SHA384: () => createSHA384(),
  SHA512: () => createSHA512(),
  "SHA3-224": () => createSHA3(224),
  "SHA3-256": () => createSHA3(256),
  "SHA3-384": () => createSHA3(384),
  "SHA3-512": () => createSHA3(512),
  SM3: () => createSM3(),
  Whirlpool: () => createWhirlpool(),
  XXHash32: () => createXXHash32(0), // default seed
  XXHash64: () => createXXHash64(0, 0), // default seeds
  XXHash3: () => createXXHash3(0, 0), // default seeds
  XXHash128: () => createXXHash128(0, 0), // default seeds
};

// Generate hash from input using specified algorithm and encoding
export async function generateHash(
  input: IDataType,
  algorithm: HashAlgorithm,
  encoding: DigestEncoding
): Promise<string> {
  if (!input) return "";

  try {
    // get the appropriate hash creator function
    const createHasher = ALGORITHM_CREATORS[algorithm];
    if (!createHasher) {
      throw new Error(`Unsupported hash algorithm: ${algorithm}`);
    }

    // create, initialize and update the hasher
    const hasher = await createHasher();
    hasher.init();
    hasher.update(input);

    // generate hash in the specified encoding format
    switch (encoding) {
      case "hexLower":
        return hasher.digest("hex").toLowerCase();
      case "hexUpper":
        return hasher.digest("hex").toUpperCase();
      case "base64":
        return binaryToBase64(hasher.digest("binary"));
      default:
        return hasher.digest("hex");
    }
  } catch (error) {
    console.error("Hash generation error:", error);
    return "";
  }
}

// Convert a file to a Uint8Array
export function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = () =>
      reject(reader.error || new Error("Unknown error reading file"));
    reader.readAsArrayBuffer(file);
  });
}

// Convert binary data to base64 string
function binaryToBase64(data: Uint8Array): string {
  if (typeof window !== "undefined") {
    // browser environment
    const binaryString = Array.from(data)
      .map((byte) => String.fromCharCode(byte))
      .join("");
    return window.btoa(binaryString);
  } else {
    // node.js environment
    return Buffer.from(data).toString("base64");
  }
}
