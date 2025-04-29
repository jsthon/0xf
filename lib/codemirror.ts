import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorState, Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { useTranslations } from "next-intl";

// Replace fold gutter icons
export const foldGutterConfig = {
  openText: "▾",
  closedText: "▸",
};

// Translations for Code Mirror
export function CodeMirrorTranslations() {
  const t = useTranslations("CodeMirror");

  const phrases = {
    // @codemirror/merge
    "$ unchanged lines": t("Merge.UnchangedLines"),
  };

  return EditorState.phrases.of(phrases);
}

// Language extension function
export function getLanguageExtension(language: string): Extension {
  switch (language) {
    case "html":
      return html();
    case "css":
      return css();
    case "javascript":
      return javascript({ jsx: true });
    case "typescript":
      return javascript({ jsx: true, typescript: true });
    case "json":
      return json();
    case "xml":
      return xml();
    case "yaml":
      return yaml();
    case "markdown":
      return markdown();
    case "sql":
      return sql();
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

// Common theme styles for all codemirror themes
const commonThemeStyles = {
  "&": {
    color: "var(--foreground)",
    backgroundColor: "var(--background)",
  },
  "&.cm-editor": {
    height: "100% !important",
  },
  "&.cm-editor .cm-scroller": {
    height: "100% !important",
    fontFamily: "var(--font-geist-mono)",
    fontVariantLigatures: "none",
    fontSize: ".875rem",
    lineHeight: "1.25rem",
  },
  ".cm-content": {
    caretColor: "var(--foreground)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--foreground)",
  },
  ".cm-gutters": {
    borderColor: "var(--border)",
    backgroundColor: "color-mix(in oklab, var(--muted) 50%, transparent)",
    color: "color-mix(in oklab, var(--muted-foreground) 70%, transparent)",
    fontSize: ".75rem",
  },
  "&.cm-merge-b .cm-gutters": {
    borderLeft: "1px solid var(--border)",
  },
  ".cm-foldGutter": {
    fontSize: "1rem",
    lineHeight: "1.125rem",
  },
  ".cm-foldPlaceholder": {
    borderColor: "var(--border)",
    color: "var(--accent-foreground)",
    backgroundColor: "var(--accent)",
  },
  ".cm-panels": {
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
  },
  ".cm-panels.cm-panels-top": {
    borderBottom: "2px solid var(--border)",
  },
  ".cm-panels.cm-panels-bottom": {
    borderTop: "2px solid var(--border)",
  },
  ".cm-searchMatch": {
    backgroundColor: "var(--accent)",
    outline: "1px solid var(--muted-foreground)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
  },
  "&.cm-focused .cm-matchingBracket": {
    backgroundColor: "color-mix(in oklab, var(--ring) 40%, transparent)",
  },
  "&.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "color-mix(in oklab, var(--destructive) 20%, transparent)",
  },
  ".cm-activeLine, .cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklab, var(--ring) 20%, transparent)",
  },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {
      color: "var(--selection-foreground)",
      backgroundColor: "var(--selection)",
    },
  "& .cm-collapsedLines": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--muted-foreground)",
    backgroundColor: "var(--muted)",
    transition:
      "all var(--default-transition-duration) var(--default-transition-timing-function)",
  },
  "& .cm-collapsedLines:hover": {
    color: "var(--accent-foreground)",
    backgroundColor: "var(--accent)",
  },
  "& .cm-collapsedLines:before, & .cm-collapsedLines:after": {
    content: '"↕"',
    fontSize: "10px",
  },
};

// Define the light theme colors based on the github light
const light00 = "#24292e", // Foreground
  light01 = "#116329", // TagName and Standard TagName
  light02 = "#6a737d", // Comment and Bracket
  light03 = "#6f42c1", // ClassName and PropertyName
  light04 = "#005cc5", // VariableName, AttributeName, Number, Operator
  light05 = "#d73a49", // Keyword, TypeName, TypeOperator
  light06 = "#032f62", // String, Meta, Regexp
  light07 = "#22863a", // Name, Quote
  light08 = "#e36209", // Atom, Bool, Special VariableName
  light09 = "#b31d28", // Deleted
  light10 = "#ffeef0", // Background for Deleted
  light11 = "#cb2431"; // Invalid color

// Define the light highlighting style
const lightHighlightStyle = HighlightStyle.define([
  { tag: [t.standard(t.tagName), t.tagName], color: light01 },
  { tag: [t.comment, t.bracket], color: light02 },
  { tag: [t.className, t.propertyName], color: light03 },
  {
    tag: [t.variableName, t.attributeName, t.number, t.operator],
    color: light04,
  },
  { tag: [t.keyword, t.typeName, t.typeOperator], color: light05 },
  { tag: [t.string, t.meta, t.regexp], color: light06 },
  { tag: [t.name, t.quote], color: light07 },
  { tag: [t.heading, t.strong], color: light00, fontWeight: "bold" },
  { tag: [t.emphasis], color: light00, fontStyle: "italic" },
  { tag: [t.deleted], color: light09, backgroundColor: light10 },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: light08 },
  { tag: [t.url, t.escape, t.regexp, t.link], color: light06 },
  { tag: t.link, textDecoration: "underline" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.invalid, color: light11 },
]);

// Define the dark theme colors based on the github dark
const dark00 = "#8b949e", // Comment and Bracket color
  dark01 = "#7ee787", // TagName, Name, Quote
  dark02 = "#d2a8ff", // ClassName, PropertyName, Heading, Strong, Emphasis
  dark03 = "#79c0ff", // VariableName, AttributeName, Number, Operator
  dark04 = "#ff7b72", // Keyword, TypeName, TypeOperator
  dark05 = "#a5d6ff", // String, Meta, Regexp
  dark06 = "#ffdcd7", // Deleted text color
  dark07 = "#ffeef0", // Deleted background color
  dark08 = "#ffab70", // Atom, Bool, Special VariableName
  dark09 = "#f97583"; // Invalid color

// Define the dark highlighting style
const darkHighlightStyle = HighlightStyle.define([
  { tag: [t.standard(t.tagName), t.tagName], color: dark01 },
  { tag: [t.comment, t.bracket], color: dark00 },
  { tag: [t.className, t.propertyName], color: dark02 },
  {
    tag: [t.variableName, t.attributeName, t.number, t.operator],
    color: dark03,
  },
  { tag: [t.keyword, t.typeName, t.typeOperator], color: dark04 },
  { tag: [t.string, t.meta, t.regexp], color: dark05 },
  { tag: [t.name, t.quote], color: dark01 },
  { tag: [t.heading, t.strong], color: dark02, fontWeight: "bold" },
  { tag: [t.emphasis], color: dark02, fontStyle: "italic" },
  { tag: [t.deleted], color: dark06, backgroundColor: dark07 },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: dark08 },
  { tag: t.link, textDecoration: "underline" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.invalid, color: dark09 },
]);

// Extension to enable the Light Theme
const lightTheme = EditorView.theme(commonThemeStyles, { dark: false });
export const codeMirrorLight: Extension = [
  lightTheme,
  syntaxHighlighting(lightHighlightStyle),
];

// Extension to enable the Dark Theme
const darkTheme = EditorView.theme(commonThemeStyles, { dark: true });
export const codeMirrorDark: Extension = [
  darkTheme,
  syntaxHighlighting(darkHighlightStyle),
];
