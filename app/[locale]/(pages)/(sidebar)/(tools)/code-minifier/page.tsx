"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
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
import { Download, Upload } from "lucide-react";
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
import { saveBlobAsFile } from "@/lib/file";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyButton } from "@/components/copy-button";

// Language to file extension mapping
const languageExtensions: Record<string, string> = {
  html: "html",
  css: "css",
  javascript: "js",
  json: "json",
};

export default function CodeMinifierPage() {
  const [language, setLanguage] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Set editor content
  const setEditorContent = (content: string) => {
    if (!editorViewRef.current) return;
    const currentContent = getEditorContent();
    editorViewRef.current.dispatch({
      changes: { from: 0, to: currentContent.length, insert: content },
      userEvent: "input",
    });
  };

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setEditorContent(content);
    };
    reader.onerror = () => toast.error(t("Messages.UploadFailed"));
    reader.readAsText(file);

    // reset input to allow re-uploading the same file
    e.target.value = "";
  };

  // Handle download
  const handleDownload = () => {
    const content = getEditorContent();
    if (!content) {
      toast.error(t("Messages.DownloadEmpty"));
      return;
    }

    try {
      const ext = language ? languageExtensions[language] || "txt" : "txt";
      const filename = `minified.${ext}`;
      const blob = new Blob([content], { type: "text/plain" });
      saveBlobAsFile(blob, filename);
    } catch {
      toast.error(t("Messages.DownloadFailed"));
    }
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

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="*/*"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                <span className="sr-only">{t("Controls.Upload")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Controls.Upload")}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="size-4" />
                <span className="sr-only">{t("Controls.Download")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Controls.Download")}</p>
            </TooltipContent>
          </Tooltip>
          <CopyButton
            getValue={getEditorContent}
            variant="outline"
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-9 rounded-md border [&_svg]:size-4"
          />
        </div>
      </div>

      <div
        ref={editorRef}
        className="border-input h-100 min-h-40 overflow-hidden rounded-md border shadow-xs md:h-[calc(100vh-20.5rem)]"
      />
    </>
  );
}
