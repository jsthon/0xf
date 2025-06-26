"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, foldGutter, foldKeymap } from "@codemirror/language";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  codeMirrorDark,
  codeMirrorLight,
  CodeMirrorTranslations,
  foldGutterConfig,
  getLanguageExtension,
} from "@/lib/codemirror";
import { languages } from "@/lib/format-minify";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/copy-button";

export default function CodeMinifierPage() {
  const [language, setLanguage] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const { resolvedTheme } = useTheme();
  const t = useTranslations("CodeMinifierPage");
  const phrases = CodeMirrorTranslations();

  // Get current language configuration
  const languageConfig = useMemo(
    () => languages.find((lang) => lang.value === language) || null,
    [language]
  );

  // Base editor extensions
  const baseExtensions = useMemo(
    () => [
      resolvedTheme === "dark" ? codeMirrorDark : codeMirrorLight,
      phrases,
      history(),
      drawSelection(),
      lineNumbers(),
      foldGutter(foldGutterConfig),
      highlightSpecialChars(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      bracketMatching(),
      closeBrackets(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...closeBracketsKeymap,
      ]),
      EditorView.lineWrapping,
    ],
    [resolvedTheme, phrases]
  );

  // Get current editor content
  const getEditorContent = () => {
    return editorViewRef.current?.state.doc.toString() || "";
  };

  // Create or update editor with current language
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // destroy previous editor instance
    if (editorViewRef.current) {
      editorViewRef.current.destroy();
    }

    const extensions = [...baseExtensions];

    // add language extension if language is selected
    if (language) {
      try {
        extensions.push(getLanguageExtension(language));
      } catch (error) {
        console.error("Failed to load language extension:", error);
      }
    }

    // create new editor instance with previous content
    editorViewRef.current = new EditorView({
      doc: getEditorContent(),
      extensions,
      parent: editor,
    });

    return () => {
      editorViewRef.current?.destroy();
    };
  }, [baseExtensions, language]);

  // Minify code
  const handleMinify = async () => {
    if (!editorViewRef.current) return;

    if (!languageConfig?.minify) {
      toast.error(t("Messages.LanguageRequired"));
      return;
    }

    try {
      const code = getEditorContent();
      const minifiedCode = await languageConfig.minify.handler(code);

      // update editor content
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: code.length,
          insert: minifiedCode,
        },
        userEvent: "input",
      });
      toast.success(t("Messages.MinifySuccess"));
    } catch {
      toast.error(t("Messages.MinifyFailed"));
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4 pb-6 md:pb-8">
        <div className="flex items-center gap-4 md:gap-x-6">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-40 md:w-50">
              <SelectValue placeholder={t("Controls.Language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t("Controls.Language")}</SelectLabel>
                {languages
                  .filter((lang) => lang.minify !== null)
                  .map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button onClick={handleMinify}>{t("Controls.MinifyCode")}</Button>
        </div>

        <CopyButton
          getValue={getEditorContent}
          variant="outline"
          className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-9 rounded-md border [&_svg]:size-4"
        />
      </div>

      <div
        ref={editorRef}
        className="border-input h-100 min-h-40 overflow-hidden rounded-md border shadow-xs md:h-[calc(100vh-20.5rem)]"
      />
    </>
  );
}
