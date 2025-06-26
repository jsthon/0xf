"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { MergeView, unifiedMergeView } from "@codemirror/merge";
import {
  drawSelection,
  EditorView,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import {
  codeMirrorDark,
  codeMirrorLight,
  CodeMirrorTranslations,
} from "@/lib/codemirror";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function TextComparePage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUnifiedView, setIsUnifiedView] = useState(false);
  const [isCollapseUnchanged, setIsCollapseUnchanged] = useState(false);
  const contentA = useRef<string>("");
  const contentB = useRef<string>("");

  const { resolvedTheme } = useTheme();
  const t = useTranslations("TextComparePage");
  const phrases = CodeMirrorTranslations();

  const extensions = useMemo(
    () => [
      resolvedTheme === "dark" ? codeMirrorDark : codeMirrorLight,
      phrases,
      history(),
      drawSelection(),
      lineNumbers(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
    ],
    [resolvedTheme, phrases]
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const collapseUnchanged = isCollapseUnchanged
      ? { margin: 3, minSize: 4 }
      : undefined;

    if (isUnifiedView) {
      const view = new EditorView({
        doc: contentB.current,
        extensions: [
          unifiedMergeView({
            original: contentA.current,
            mergeControls: false,
            collapseUnchanged,
          }),
          EditorView.editable.of(false),
          ...extensions,
        ],
        parent: editor,
      });

      return () => view.destroy();
    } else {
      const view = new MergeView({
        a: {
          doc: contentA.current,
          extensions,
        },
        b: {
          doc: contentB.current,
          extensions,
        },
        parent: editor,
        collapseUnchanged,
      });

      return () => {
        contentA.current = view.a.state.doc.toString();
        contentB.current = view.b.state.doc.toString();
        view.destroy();
      };
    }
  }, [isCollapseUnchanged, isUnifiedView, extensions]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pb-6 md:pb-8">
        <div className="flex items-center gap-2">
          <Switch
            id="unified-view"
            checked={isUnifiedView}
            onCheckedChange={setIsUnifiedView}
          />
          <Label htmlFor="unified-view">{t("Controls.UnifiedView")}</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="collapse-unchanged"
            checked={isCollapseUnchanged}
            onCheckedChange={setIsCollapseUnchanged}
          />
          <Label htmlFor="collapse-unchanged">
            {t("Controls.CollapseUnchanged")}
          </Label>
        </div>
      </div>

      <div
        ref={editorRef}
        className="border-input h-100 min-h-40 overflow-hidden rounded-md border shadow-xs md:h-[calc(100vh-19.4rem)] [&_.cm-mergeView]:h-full [&_.cm-mergeViewEditors]:h-full"
      />
    </>
  );
}
