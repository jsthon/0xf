// Define result type
export interface ITextCount {
  total: number;
  words: number;
  lines: number;
  whitespace: number;
  latin: number;
  nonLatin: number;
  digit: number;
  symbols: number;
}

// Character type regex patterns
export const PATTERNS: Record<
  keyof Omit<ITextCount, "total" | "words" | "lines">,
  RegExp
> = {
  whitespace: /\p{Z}/gu,
  latin: /\p{Script=Latin}/gu,
  nonLatin:
    /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}|\p{Script=Cyrillic}|\p{Script=Arabic}|\p{Script=Thai}|\p{Script=Greek}|\p{Script=Hebrew}/gu,
  digit: /\p{Nd}/gu,
  symbols: /[\p{P}\p{S}]/gu,
};

// Empty result template
export const EMPTY: ITextCount = {
  total: 0,
  words: 0,
  lines: 0,
  whitespace: 0,
  latin: 0,
  nonLatin: 0,
  digit: 0,
  symbols: 0,
};

// Count text and return results
export function countText(input: string): ITextCount {
  if (!input) return EMPTY;

  // calculate core metrics
  const total = Array.from(input).length;
  const words = input.trim().split(/\s+/).filter(Boolean).length;
  const lines = input.split(/\n/).length;

  // calculate character type counts
  const charTypeCounts = Object.entries(PATTERNS).reduce(
    (counts, [type, pattern]) => {
      counts[type as keyof typeof PATTERNS] = (
        input.match(pattern) || []
      ).length;
      return counts;
    },
    {} as Record<keyof typeof PATTERNS, number>
  );

  return { total, words, lines, ...charTypeCounts };
}
