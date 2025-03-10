// Checks if a string contains URL Safe Base64 specific characters
export function hasUrlSafeChars(input: string): boolean {
  return input.includes("-") || input.includes("_");
}

// Checks if a string contains standard Base64 specific characters
export function hasStandardChars(input: string): boolean {
  return input.includes("+") || input.includes("/");
}

// Validates if a string is Base64 encoded
export function isValidBase64(input: string): boolean {
  // length validation
  const length = input.length;
  if (length === 0) return false;

  // length mod 4 = 1 is always invalid in any Base64 format
  if (length % 4 === 1) {
    return false;
  }

  // if padding is present, length must be divisible by 4
  const hasPadding = input.includes("=");
  if (hasPadding && length % 4 !== 0) {
    return false;
  }

  // basic character validation
  const validBase64Regex = /^[A-Za-z0-9+/\-_=]*$/;
  if (!validBase64Regex.test(input)) {
    return false;
  }

  // mixing standard and URL Safe characters is invalid
  if (hasUrlSafeChars(input) && hasStandardChars(input)) {
    return false;
  }

  // attempt to decode
  const decoded = decodeFromBase64(input);

  // if decoding succeeds, it's valid Base64
  return decoded !== null;
}

// Converts standard Base64 to URL Safe format
export function convertToUrlSafe(input: string): string {
  return input.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Standardizes any Base64 string to standard format with proper padding
export function standardizeBase64(input: string): string {
  // replace URL Safe characters with standard ones
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

// Encodes UTF-8 string to Base64
export function encodeToBase64(input: string, urlSafe = false): string | null {
  try {
    // encode string to base64
    const base64 = window.btoa(unescape(encodeURIComponent(input)));

    // convert to URL Safe if requested
    return urlSafe ? convertToUrlSafe(base64) : base64;
  } catch {
    // silently return null on error
    return null;
  }
}

// Decodes Base64 to UTF-8 string
export function decodeFromBase64(input: string): string | null {
  try {
    // standardize if needed
    const standardized = standardizeBase64(input);

    // decode base64 to string
    return decodeURIComponent(escape(window.atob(standardized)));
  } catch {
    // silently return null on error
    return null;
  }
}
