"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { FormatOptions, languages } from "@/lib/format-minify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function CodeFormatterPage() {
  const [language, setLanguage] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  // Format options
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    singleQuote: false,
    semi: true,
  });

  const { resolvedTheme } = useTheme();
  const t = useTranslations("CodeFormatterPage");
  const phrases = CodeMirrorTranslations();

  // Get current language configuration
  const languageConfig = useMemo(
    () => languages.find((lang) => lang.value === language) || null,
    [language]
  );

  // Get supported options for current language
  const supportedOptions = useMemo(
    () => languageConfig?.format?.options || null,
    [languageConfig]
  );

  // Reset format options when language changes
  useEffect(() => {
    if (languageConfig?.format?.options) {
      setFormatOptions(languageConfig.format.options);
    }
  }, [language, languageConfig]);

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

  // Format code
  const handleFormat = async () => {
    if (!editorViewRef.current) return;

    if (!languageConfig?.format) {
      toast.error(t("Messages.LanguageRequired"));
      return;
    }

    try {
      const code = getEditorContent();
      const formattedCode = await languageConfig.format.handler(
        code,
        formatOptions
      );

      // update editor content
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: code.length,
          insert: formattedCode,
        },
        userEvent: "input",
      });
      toast.success(t("Messages.FormatSuccess"));
    } catch {
      toast.error(t("Messages.FormatFailed"));
    }
  };

  // Update format options
  const updateFormatOptions = useCallback(
    (newOptions: Partial<FormatOptions>) => {
      setFormatOptions((prevOptions) => ({ ...prevOptions, ...newOptions }));
    },
    []
  );

  // Handle print width change
  const handlePrintWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value)) {
        updateFormatOptions({ printWidth: Math.max(1, Math.min(value, 999)) });
      }
    },
    [updateFormatOptions]
  );

  // Handle tab width change
  const handleTabWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value)) {
        updateFormatOptions({ tabWidth: Math.max(1, Math.min(value, 99)) });
      }
    },
    [updateFormatOptions]
  );

  // Handle indent style change
  const handleIndentStyleChange = useCallback(
    (value: string) => {
      updateFormatOptions({ useTabs: value === "tab" });
    },
    [updateFormatOptions]
  );

  // Handle quote style change
  const handleQuoteStyleChange = useCallback(
    (value: string) => {
      updateFormatOptions({ singleQuote: value === "single" });
    },
    [updateFormatOptions]
  );

  // Handle semicolons change
  const handleSemicolonsChange = useCallback(
    (value: string) => {
      updateFormatOptions({ semi: value === "on" });
    },
    [updateFormatOptions]
  );

  return (
    <>
      <div className="flex flex-col gap-6 pb-6 md:pb-8">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-x-6">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="min-w-40 md:min-w-50">
                <SelectValue placeholder={t("Controls.Language")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("Controls.Language")}</SelectLabel>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button onClick={handleFormat}>{t("Controls.FormatCode")}</Button>
          </div>

          <CopyButton
            getValue={getEditorContent}
            variant="outline"
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-9 rounded-md border [&_svg]:size-4"
          />
        </div>

        {supportedOptions && (
          <div className="flex flex-wrap items-center gap-4 md:-mb-2 md:gap-x-6">
            {"printWidth" in supportedOptions && (
              <Tooltip>
                <div className="flex items-center gap-2">
                  <TooltipTrigger asChild>
                    <Label
                      className="text-xs font-normal"
                      htmlFor="print-width"
                    >
                      {t("Controls.PrintWidth")}
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{t("Tooltips.PrintWidth")}</p>
                  </TooltipContent>
                  <Input
                    id="print-width"
                    className="h-7 w-16 text-xs md:text-xs"
                    type="number"
                    min={1}
                    max={999}
                    value={formatOptions.printWidth}
                    onChange={handlePrintWidthChange}
                  />
                </div>
              </Tooltip>
            )}

            {"tabWidth" in supportedOptions && (
              <Tooltip>
                <div className="flex items-center gap-2">
                  <TooltipTrigger asChild>
                    <Label className="text-xs font-normal" htmlFor="tab-width">
                      {t("Controls.TabWidth")}
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{t("Tooltips.TabWidth")}</p>
                  </TooltipContent>
                  <Input
                    id="tab-width"
                    className="h-7 w-16 text-xs md:text-xs"
                    type="number"
                    min={1}
                    max={99}
                    value={formatOptions.tabWidth}
                    onChange={handleTabWidthChange}
                  />
                </div>
              </Tooltip>
            )}

            {"useTabs" in supportedOptions && (
              <Tooltip>
                <Select
                  value={formatOptions.useTabs ? "tab" : "space"}
                  onValueChange={handleIndentStyleChange}
                >
                  <SelectTrigger className="min-w-36 text-xs data-[size=default]:h-7">
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground">
                        {t("Controls.UseTabs.Label")}
                      </span>
                    </TooltipTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <TooltipContent side="bottom">
                    <p>{t("Tooltips.UseTabs")}</p>
                  </TooltipContent>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem className="text-xs" value="space">
                        {t("Controls.UseTabs.Space")}
                      </SelectItem>
                      <SelectItem className="text-xs" value="tab">
                        {t("Controls.UseTabs.Tab")}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Tooltip>
            )}

            {"singleQuote" in supportedOptions && (
              <Tooltip>
                <Select
                  value={formatOptions.singleQuote ? "single" : "double"}
                  onValueChange={handleQuoteStyleChange}
                >
                  <SelectTrigger className="min-w-36 text-xs data-[size=default]:h-7">
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground">
                        {t("Controls.SingleQuote.Label")}
                      </span>
                    </TooltipTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <TooltipContent side="bottom">
                    <p>{t("Tooltips.SingleQuote")}</p>
                  </TooltipContent>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem className="text-xs" value="double">
                        {t("Controls.SingleQuote.Double")}
                      </SelectItem>
                      <SelectItem className="text-xs" value="single">
                        {t("Controls.SingleQuote.Single")}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Tooltip>
            )}

            {"semi" in supportedOptions && (
              <Tooltip>
                <Select
                  value={formatOptions.semi ? "on" : "off"}
                  onValueChange={handleSemicolonsChange}
                >
                  <SelectTrigger className="min-w-36 text-xs data-[size=default]:h-7">
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground">
                        {t("Controls.Semi.Label")}
                      </span>
                    </TooltipTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <TooltipContent side="bottom">
                    <p>{t("Tooltips.Semicolons")}</p>
                  </TooltipContent>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem className="text-xs" value="on">
                        {t("Controls.Semi.On")}
                      </SelectItem>
                      <SelectItem className="text-xs" value="off">
                        {t("Controls.Semi.Off")}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      <div
        ref={editorRef}
        className="border-input h-100 min-h-40 overflow-hidden rounded-md border shadow-xs md:h-[calc(100vh-26rem)] 2xl:h-[calc(100vh-23.25rem)]"
      />
    </>
  );
}
