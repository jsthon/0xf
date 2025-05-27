import { fileTypeFromBuffer } from "file-type";

// Checks contains standard base64 characters
export function hasStandardChars(input: string): boolean {
  return input.includes("+") || input.includes("/");
}

// Checks contains url safe base64 characters
export function hasUrlSafeChars(input: string): boolean {
  return input.includes("-") || input.includes("_");
}

// Validates if a string is base64 encoded
export function isValidBase64(input: string): boolean {
  // length validation
  if (!input || input.length % 4 === 1) return false;

  // character validation
  if (!/^[A-Za-z0-9+/_-]*={0,2}$/.test(input)) return false;

  // reject mixed standard and url safe characters
  if (hasUrlSafeChars(input) && hasStandardChars(input)) return false;

  // re-encode and compare to original
  try {
    const standardized = standardizeBase64(input);
    const decoded = atob(standardized);
    const encoded = btoa(decoded);

    return encoded === standardized;
  } catch {
    return false;
  }
}

// Checks if input is probably base64 encoded
export async function isProbablyBase64(input: string): Promise<boolean> {
  if (!isValidBase64(input)) return false;

  try {
    const bytes = base64ToBytes(input);
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);

    // count printable characters
    let printable = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (
        (code >= 32 && code <= 126) || // basic printable ASCII
        (code >= 160 && code <= 65533) // printable Latin/Unicode
      ) {
        printable++;
      }
    }

    const ratio = printable / text.length;
    return ratio > 0.7;
  } catch {
    // if decoding fails, check if it's a known file type
    const fileExt = await detectFileExtension(input);
    return fileExt !== null;
  }
}

// File extension detection based on base64 content using file-type library
export async function detectFileExtension(
  base64: string
): Promise<string | null> {
  try {
    const bytes = base64ToBytes(base64);
    const result = await fileTypeFromBuffer(bytes);

    return result?.ext || null;
  } catch {
    return null;
  }
}

// Converts standard base64 to url safe base64
export function convertToUrlSafe(input: string): string {
  return input.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Standardizes base64 encoding if needed
export function standardizeBase64(input: string): string {
  // replace url safe characters with standard characters
  let result = input.replace(/-/g, "+").replace(/_/g, "/");
  // add padding if needed
  const padding = result.length % 4;
  if (padding === 2) {
    result += "==";
  } else if (padding === 3) {
    result += "=";
  }

  return result;
}

// Encodes utf-8 string to base64
export function textToBase64(input: string, urlSafe = false): string | null {
  try {
    const bytes = new TextEncoder().encode(input);
    const base64 = btoa(
      Array.from(bytes)
        .map((b) => String.fromCharCode(b))
        .join("")
    );
    return urlSafe ? convertToUrlSafe(base64) : base64;
  } catch {
    return null;
  }
}

// Decodes base64 to utf-8 string
export function base64ToText(input: string): string | null {
  try {
    return new TextDecoder().decode(
      Uint8Array.from(atob(standardizeBase64(input)), (char) =>
        char.charCodeAt(0)
      )
    );
  } catch {
    return null;
  }
}

// Converts base64 string to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const standardized = standardizeBase64(base64);
  const binary = atob(standardized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Converts file to text content
export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Converts file to base64 string
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const match = result.match(/^data:.*?;base64,(.*)$/);
      if (!match) {
        reject(new Error("Failed to convert file to base64"));
        return;
      }
      resolve(match[1]);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Converts base64 to blob for download
export function base64ToBlob(base64: string): Blob {
  try {
    const bytes = base64ToBytes(base64);
    const arrayBufferBytes = new Uint8Array(bytes);
    return new Blob([arrayBufferBytes]);
  } catch {
    throw new Error("Failed to convert base64 to blob");
  }
}
