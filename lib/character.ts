import { decode, encode } from "html-entities";

// Enum for character escape formats
export enum EscapeType {
  CodePoint = "codePoint", // U+0000
  EscapeSequence = "escapeSequence", // \u0000
  CssEscape = "cssEscape", // \0000
  HtmlCode = "htmlCode", // &#00;
  HtmlEntity = "htmlEntity", // &name;
}

// Regex for character escape formats
const CODE_POINT_REGEX = /U\+([0-9A-F]{4,6})/i;
const ESCAPE_SEQUENCE_REGEX = /\\u([0-9A-F]{4})|\\u\{([0-9A-F]{1,6})\}/i;
const CSS_ESCAPE_REGEX = /\\(?!u)([0-9A-F]{1,6})\s?/i;
const HTML_CODE_REGEX = /&#(\d+);|&#x([0-9A-F]+);/i;
const HTML_ENTITY_REGEX = /&[a-z0-9]+;/i;

// Create a global version of a regex
function createGlobalRegex(regex: RegExp): RegExp {
  return new RegExp(
    regex.source,
    regex.flags + (regex.flags.includes("g") ? "" : "g")
  );
}

// Check if string is a Unicode code point
export function isCodePoint(input: string): boolean {
  return CODE_POINT_REGEX.test(input);
}

// Check if string is a Unicode escape sequence
export function isEscapeSequence(input: string): boolean {
  return ESCAPE_SEQUENCE_REGEX.test(input);
}

// Check if string is a CSS escape sequence
export function isCssEscape(input: string): boolean {
  return CSS_ESCAPE_REGEX.test(input);
}

// Check if string is an HTML code
export function isHtmlCode(input: string): boolean {
  return HTML_CODE_REGEX.test(input);
}

// Check if string is an HTML named entity
export function isHtmlEntity(input: string): boolean {
  return HTML_ENTITY_REGEX.test(input);
}

// Detects character escape format in a string
export function detectEscapeType(input: string): EscapeType | null {
  if (isCodePoint(input)) {
    return EscapeType.CodePoint;
  } else if (isEscapeSequence(input)) {
    return EscapeType.EscapeSequence;
  } else if (isCssEscape(input)) {
    return EscapeType.CssEscape;
  } else if (isHtmlCode(input)) {
    return EscapeType.HtmlCode;
  } else if (isHtmlEntity(input)) {
    return EscapeType.HtmlEntity;
  }

  return null;
}

// Convert a character to Unicode code point format
export function toCodePoint(char: string): string {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return "";
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

// Convert a character to Unicode escape sequence format
export function toEscapeSequence(char: string): string {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return "";

  // for code points greater than 0xffff, use \u{1F600} format
  if (codePoint > 0xffff) {
    return `\\u{${codePoint.toString(16).toUpperCase()}}`;
  }

  // for code points less than or equal to 0xffff, use \uFFFF format
  return `\\u${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

// Convert a character to CSS escape sequence format
export function toCssEscape(char: string): string {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return "";

  return `\\${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

// Convert a character to HTML code format
export function toHtmlCode(char: string): string {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return "";
  return `&#${codePoint};`;
}

// Encodes text to specified character format
export function encodeCharacters(input: string, format: EscapeType): string {
  if (!input) return "";

  if (format === EscapeType.HtmlEntity) {
    try {
      let encoded = encode(input, { mode: "extensive", level: "html5" });
      encoded = encoded.replace(/ /g, "&nbsp;");
      return encoded;
    } catch {
      return "";
    }
  }

  const chars = Array.from(input);
  let result = "";

  for (const char of chars) {
    switch (format) {
      case EscapeType.CodePoint:
        result += toCodePoint(char);
        break;
      case EscapeType.EscapeSequence:
        result += toEscapeSequence(char);
        break;
      case EscapeType.CssEscape:
        result += toCssEscape(char);
        break;
      case EscapeType.HtmlCode:
        result += toHtmlCode(char);
        break;
    }
  }

  return result;
}

// Convert from Unicode code point format to text
export function fromCodePoint(input: string): string | null {
  try {
    const match = input.match(CODE_POINT_REGEX);
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
    const match = input.match(ESCAPE_SEQUENCE_REGEX);
    if (!match) return null;

    // match[1] is \uFFFF format
    // match[2] is \u{1F600} format
    const codePoint = parseInt(match[1] || match[2], 16);
    return String.fromCodePoint(codePoint);
  } catch {
    return null;
  }
}

// Convert from CSS escape sequence format to text
export function fromCssEscape(input: string): string | null {
  try {
    const match = input.match(CSS_ESCAPE_REGEX);
    if (!match) return null;

    const codePoint = parseInt(match[1], 16);
    return String.fromCodePoint(codePoint);
  } catch {
    return null;
  }
}

// Convert from HTML code format to text
export function fromHtmlCode(input: string): string | null {
  try {
    const match = input.match(HTML_CODE_REGEX);
    if (!match) return null;

    // match[1] is decimal format (&#65;)
    // match[2] is hex format (&#x41;)
    const codePoint = match[1]
      ? parseInt(match[1], 10)
      : parseInt(match[2], 16);

    return String.fromCodePoint(codePoint);
  } catch {
    return null;
  }
}

// Decode from any character escape format to text
export function decodeCharacters(
  input: string,
  format?: EscapeType
): string | null {
  if (!input) return "";

  // use specific format if provided
  if (format) {
    switch (format) {
      case EscapeType.CodePoint:
        return decodeCodePoints(input);
      case EscapeType.EscapeSequence:
        return decodeEscapeSequences(input);
      case EscapeType.CssEscape:
        return decodeCssEscapes(input);
      case EscapeType.HtmlCode:
        return decodeHtmlCodes(input);
      case EscapeType.HtmlEntity:
        return decodeHtmlEntities(input);
      default:
        return null;
    }
  }

  // auto-detect format
  const detectedFormat = detectEscapeType(input);
  if (!detectedFormat) return null;

  switch (detectedFormat) {
    case EscapeType.CodePoint:
      return decodeCodePoints(input);
    case EscapeType.EscapeSequence:
      return decodeEscapeSequences(input);
    case EscapeType.CssEscape:
      return decodeCssEscapes(input);
    case EscapeType.HtmlCode:
      return decodeHtmlCodes(input);
    case EscapeType.HtmlEntity:
      return decodeHtmlEntities(input);
    default:
      return null;
  }
}

// Generic decode function for regex-based decoding
function decodeWithRegexAndConverter(
  input: string,
  regex: RegExp,
  converter: (match: string) => string | null
): string | null {
  const globalRegex = createGlobalRegex(regex);
  const matches = input.match(globalRegex);
  if (!matches || matches.length === 0) return null;

  let result = "";
  for (const match of matches) {
    const decoded = converter(match);
    if (decoded) {
      result += decoded;
    }
  }
  return result || null;
}

// Decode from Unicode code point format to text
function decodeCodePoints(input: string): string | null {
  return decodeWithRegexAndConverter(input, CODE_POINT_REGEX, fromCodePoint);
}

// Decode from Unicode escape sequence format to text
function decodeEscapeSequences(input: string): string | null {
  return decodeWithRegexAndConverter(
    input,
    ESCAPE_SEQUENCE_REGEX,
    fromEscapeSequence
  );
}

// Decode from CSS escape sequence format to text
function decodeCssEscapes(input: string): string | null {
  return decodeWithRegexAndConverter(input, CSS_ESCAPE_REGEX, fromCssEscape);
}

// Decode from HTML code format to text
function decodeHtmlCodes(input: string): string | null {
  return decodeWithRegexAndConverter(input, HTML_CODE_REGEX, fromHtmlCode);
}

// Decode from HTML named entity format to text
function decodeHtmlEntities(input: string): string | null {
  try {
    return decode(input);
  } catch {
    return null;
  }
}
