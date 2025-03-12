// Enum for character encoding formats
export enum CharEncoding {
  CodePoint = "codePoint", // U+XXXX
  EscapeSequence = "escapeSequence", // \uXXXX
  HtmlEntity = "htmlEntity", // &#XXXX;
}

// Check if string is a Unicode code point (U+XXXX)
export function isCodePoint(input: string): boolean {
  const codePointRegex = /U\+[0-9A-F]{4,6}/i;
  return codePointRegex.test(input.trim());
}

// Check if string is a Unicode escape sequence (\uXXXX)
export function isEscapeSequence(input: string): boolean {
  const escapeSequenceRegex = /\\u[0-9A-F]{4}/i;
  return escapeSequenceRegex.test(input.trim());
}

// Check if string is an HTML entity (&#XXXX;)
export function isHtmlEntity(input: string): boolean {
  const htmlEntityRegex = /&#\d+;/;
  return htmlEntityRegex.test(input.trim());
}

// Detects character encoding format in a string
export function detectCharEncoding(input: string): CharEncoding | null {
  if (isCodePoint(input)) {
    return CharEncoding.CodePoint;
  } else if (isEscapeSequence(input)) {
    return CharEncoding.EscapeSequence;
  } else if (isHtmlEntity(input)) {
    return CharEncoding.HtmlEntity;
  }

  return null;
}

// Convert a character to Unicode code point format (U+XXXX)
export function toCodePoint(char: string): string {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return "";
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

// Convert a character to Unicode escape sequence format (\uXXXX)
export function toEscapeSequence(char: string): string {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return "";
  return `\\u${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

// Convert a character to HTML entity format (&#XXXX;)
export function toHtmlEntity(char: string): string {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return "";
  return `&#${codePoint};`;
}

// Encodes text to specified character format
export function encodeCharacters(input: string, format: CharEncoding): string {
  if (!input) return "";

  const chars = Array.from(input);
  let result = "";

  for (const char of chars) {
    switch (format) {
      case CharEncoding.CodePoint:
        result += toCodePoint(char);
        break;
      case CharEncoding.EscapeSequence:
        result += toEscapeSequence(char);
        break;
      case CharEncoding.HtmlEntity:
        result += toHtmlEntity(char);
        break;
    }
  }

  return result;
}

// Convert from Unicode code point format to text
export function fromCodePoint(input: string): string | null {
  try {
    const codePointRegex = /U\+([0-9A-F]{4,6})/i;
    const match = input.match(codePointRegex);
    if (!match) return null;

    const codePoint = parseInt(match[1], 16);
    return String.fromCodePoint(codePoint);
  } catch {
    return null;
  }
}

// Convert from Unicode escape sequence format to text
export function fromEscapeSequence(input: string): string | null {
  try {
    const escapeSequenceRegex = /\\u([0-9A-F]{4})/i;
    const match = input.match(escapeSequenceRegex);
    if (!match) return null;

    const codePoint = parseInt(match[1], 16);
    return String.fromCodePoint(codePoint);
  } catch {
    return null;
  }
}

// Convert from HTML entity format to text
export function fromHtmlEntity(input: string): string | null {
  try {
    const htmlEntityRegex = /&#(\d+);/;
    const match = input.match(htmlEntityRegex);
    if (!match) return null;

    const codePoint = parseInt(match[1], 10);
    return String.fromCodePoint(codePoint);
  } catch {
    return null;
  }
}

// Decode from any character encoding format to text
export function decodeCharacters(
  input: string,
  format?: CharEncoding
): string | null {
  if (!input) return "";

  // use specific format if provided
  if (format) {
    switch (format) {
      case CharEncoding.CodePoint:
        return decodeCodePoints(input);
      case CharEncoding.EscapeSequence:
        return decodeEscapeSequences(input);
      case CharEncoding.HtmlEntity:
        return decodeHtmlEntities(input);
      default:
        return null;
    }
  }

  // auto-detect format
  const detectedFormat = detectCharEncoding(input);
  if (!detectedFormat) return null;

  switch (detectedFormat) {
    case CharEncoding.CodePoint:
      return decodeCodePoints(input);
    case CharEncoding.EscapeSequence:
      return decodeEscapeSequences(input);
    case CharEncoding.HtmlEntity:
      return decodeHtmlEntities(input);
    default:
      return null;
  }
}

// Decode from Unicode code point format to text
function decodeCodePoints(input: string): string | null {
  const codePointRegex = /U\+([0-9A-F]{4,6})/gi;
  const matches = input.match(codePointRegex);

  if (!matches || matches.length === 0) return null;

  let result = "";
  for (const match of matches) {
    const decoded = fromCodePoint(match);
    if (decoded) {
      result += decoded;
    }
  }
  return result || null;
}

// Decode from Unicode escape sequence format to text
function decodeEscapeSequences(input: string): string | null {
  const escapeSequenceRegex = /\\u([0-9A-F]{4})/gi;
  const matches = input.match(escapeSequenceRegex);

  if (!matches || matches.length === 0) return null;

  let result = "";
  for (const match of matches) {
    const decoded = fromEscapeSequence(match);
    if (decoded) {
      result += decoded;
    }
  }
  return result || null;
}

// Decode from HTML entity format to text
function decodeHtmlEntities(input: string): string | null {
  const htmlEntityRegex = /&#(\d+);/g;
  const matches = input.match(htmlEntityRegex);

  if (!matches || matches.length === 0) return null;

  let result = "";
  for (const match of matches) {
    const decoded = fromHtmlEntity(match);
    if (decoded) {
      result += decoded;
    }
  }
  return result || null;
}
