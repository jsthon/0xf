import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useTranslations } from "next-intl";

export const useCodeMirrorTheme = () => {
  return EditorView.theme({
    "&.cm-editor": {
      height: "100% !important",
    },
    "&.cm-editor .cm-scroller": {
      height: "100% !important",
      fontFamily: "var(--font-geist-mono)",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    "& .cm-gutters": {
      borderColor: "var(--border)",
      color: "var(--muted-foreground)",
      fontSize: ".75rem",
      background: "var(--muted)",
    },
    "& .cm-cursor, & .cm-dropCursor": {
      borderColor: "var(--foreground)",
    },
    "& .cm-collapsedLines": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--muted-foreground)",
      background: "var(--muted)",
      transition:
        "all var(--default-transition-duration) var(--default-transition-timing-function)",
    },
    "& .cm-collapsedLines:hover": {
      color: "var(--accent-foreground)",
      background: "var(--accent)",
    },
    "& .cm-collapsedLines:before, & .cm-collapsedLines:after": {
      content: '"↕"',
      fontSize: "10px",
    },
  });
};

export function useCodeMirrorTranslations() {
  const t = useTranslations("CodeMirror");

  const phrases = {
    // @codemirror/merge
    "$ unchanged lines": t("Merge.UnchangedLines"),
  };

  return EditorState.phrases.of(phrases);
}
