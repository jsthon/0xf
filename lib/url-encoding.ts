// Check if string is URL encoded
export function isValidUrlEncoded(input: string): boolean {
  // simple heuristic: contains % followed by two hex digits
  if (!input || typeof input !== "string") return false;

  // check for percent encoding pattern
  const hasPercentEncoding = /%[0-9A-Fa-f]{2}/.test(input);

  if (!hasPercentEncoding) return false;

  // try to decode it as additional validation
  try {
    decodeURIComponent(input);
    return true;
  } catch {
    // if decoding fails, it's not valid URL encoded
    return false;
  }
}

// Encode string using URL encoding
export function encodeToUrl(input: string): string | null {
  if (!input) return "";

  try {
    return encodeURIComponent(input);
  } catch {
    // return null on error
    return null;
  }
}

// Decode URL encoded string
export function decodeFromUrl(input: string): string | null {
  if (!input) return "";

  try {
    return decodeURIComponent(input);
  } catch {
    // return null on error
    return null;
  }
}
