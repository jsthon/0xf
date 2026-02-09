export const defaultLocale = "en-US";

// Steps to add a new locale:
// 1. Add to localePrefixes
// 2. Add to localeNames
// 3. Add matching regex to proxy.ts

export const localePrefixes: Record<string, string> = {
  "de-DE": "/de",
  "en-US": "/en",
  "es-ES": "/es",
  "fr-FR": "/fr",
  "ja-JP": "/ja",
  "ko-KR": "/ko",
  "pt-PT": "/pt",
  "ru-RU": "/ru",
  "zh-CN": "/zh-cn",
  "zh-TW": "/zh-tw",
};

export const localeNames: Record<string, string> = {
  "de-DE": "Deutsch",
  "en-US": "English",
  "es-ES": "Español",
  "fr-FR": "Français",
  "ja-JP": "日本語",
  "ko-KR": "한국어",
  "pt-PT": "Português",
  "ru-RU": "Русский",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
};
