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
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Papa from "papaparse";
import { toast } from "sonner";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

import {
  codeMirrorDark,
  codeMirrorLight,
  CodeMirrorTranslations,
  foldGutterConfig,
  getLanguageExtension,
} from "@/lib/codemirror";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/copy-button";

// Format types supported by the converter
type FormatType = "json" | "csv" | "yaml" | "xml";

// Unified type for data values
type DataValue =
  | Record<string, unknown>
  | Array<Record<string, unknown> | unknown>
  | unknown;

// Available input formats
const inputFormats: FormatType[] = ["json", "yaml", "xml", "csv"];

export default function DataFormatConverterPage() {
  const [selectedInputFormat, setSelectedInputFormat] =
    useState<FormatType | null>(null); // null means auto detect
  const [detectedInputFormat, setDetectedInputFormat] =
    useState<FormatType | null>(null);
  const [outputFormat, setOutputFormat] = useState<FormatType | null>(null);

  const inputEditorRef = useRef<HTMLDivElement>(null);
  const outputEditorRef = useRef<HTMLDivElement>(null);
  const inputEditorViewRef = useRef<EditorView | null>(null);
  const outputEditorViewRef = useRef<EditorView | null>(null);

  const { resolvedTheme } = useTheme();
  const t = useTranslations("DataFormatConverterPage");
  const phrases = CodeMirrorTranslations();

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

  // Get current effective input format
  const currentInputFormat = selectedInputFormat || detectedInputFormat;

  // Detect input data format
  const detectInputFormat = (text: string): FormatType | null => {
    // only check first 512 bytes for performance
    const MAX_DETECT_SIZE = 512;
    const sample =
      text.length > MAX_DETECT_SIZE ? text.slice(0, MAX_DETECT_SIZE) : text;
    const trimmed = sample.trim();

    // early return for empty sample
    if (!trimmed) return null;

    const firstChar = trimmed[0];

    // JSON: starts with { or [
    if (firstChar === "{" && trimmed.includes(":")) {
      return "json";
    }
    if (firstChar === "[" && (trimmed.includes("{") || trimmed.includes('"'))) {
      return "json";
    }

    // XML: starts with <
    if (firstChar === "<") {
      if (
        trimmed.includes("</") ||
        trimmed.includes("/>") ||
        trimmed.startsWith("<?xml")
      ) {
        return "xml";
      }
    }

    // CSV: has commas and multiple lines, not starting with special chars
    if (firstChar !== "<" && firstChar !== "{" && firstChar !== "[") {
      if (trimmed.includes(",") && trimmed.includes("\n")) {
        return "csv";
      }
    }

    // YAML: has key-value pattern, not other formats
    if (
      firstChar !== "<" &&
      firstChar !== "{" &&
      firstChar !== "[" &&
      !trimmed.includes(",")
    ) {
      if (trimmed.includes(": ") || trimmed.includes(":\n")) {
        return "yaml";
      }
    }

    return null;
  };

  // Get input editor content
  const getInputContent = () => {
    return inputEditorViewRef.current?.state.doc.toString() || "";
  };

  // Get output editor content
  const getOutputContent = () => {
    return outputEditorViewRef.current?.state.doc.toString() || "";
  };

  // Create or update input editor
  useEffect(() => {
    const editor = inputEditorRef.current;
    if (!editor) return;

    // destroy previous editor instance
    if (inputEditorViewRef.current) {
      inputEditorViewRef.current.destroy();
    }

    const extensions = [...baseExtensions];

    // add language extension if input format is selected (except CSV)
    if (currentInputFormat && currentInputFormat !== "csv") {
      try {
        extensions.push(getLanguageExtension(currentInputFormat));
      } catch (error) {
        console.error("Failed to load language extension:", error);
      }
    }

    // Add change listener for automatic format detection
    if (!selectedInputFormat) {
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString();
          const format = detectInputFormat(content);
          setDetectedInputFormat(format);
        }
      });
      extensions.push(updateListener);
    }

    // create new editor instance with previous content
    inputEditorViewRef.current = new EditorView({
      doc: getInputContent(),
      extensions,
      parent: editor,
    });

    return () => {
      inputEditorViewRef.current?.destroy();
    };
  }, [baseExtensions, currentInputFormat, selectedInputFormat]);

  // Create or update output editor
  useEffect(() => {
    const editor = outputEditorRef.current;
    if (!editor) return;

    // destroy previous editor instance
    if (outputEditorViewRef.current) {
      outputEditorViewRef.current.destroy();
    }

    const extensions = [...baseExtensions];

    // add language extension if output format is selected (except CSV)
    if (outputFormat && outputFormat !== "csv") {
      try {
        extensions.push(getLanguageExtension(outputFormat));
      } catch (error) {
        console.error("Failed to load language extension:", error);
      }
    }

    // create new editor instance with previous content
    outputEditorViewRef.current = new EditorView({
      doc: getOutputContent(),
      extensions,
      parent: editor,
    });

    return () => {
      outputEditorViewRef.current?.destroy();
    };
  }, [baseExtensions, outputFormat]);

  // Parse data to JavaScript object
  const parseToObject = (text: string, format: FormatType): DataValue => {
    switch (format) {
      case "json":
        return JSON.parse(text);
      case "yaml":
        return parseYaml(text);
      case "xml": {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
        });
        return parser.parse(text);
      }
      case "csv": {
        const result = Papa.parse(text, { header: true });
        return result.data;
      }
      default:
        throw new Error("Convert to object failed");
    }
  };

  // Convert JavaScript object to specific format string
  const convertToFormat = (data: DataValue, format: FormatType): string => {
    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2);
      case "yaml":
        return stringifyYaml(data, { indent: 2 });
      case "xml": {
        const builder = new XMLBuilder({
          format: true,
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
          indentBy: "  ",
        });
        return builder.build(data);
      }
      case "csv":
        return Papa.unparse(data as Record<string, unknown>[]);
      default:
        throw new Error("Convert to format failed");
    }
  };

  // Handle format conversion
  const handleConvert = (toFormat: FormatType) => {
    if (!outputEditorViewRef.current) return;

    if (!currentInputFormat) {
      toast.error(t("Messages.UnknownFormat"));
      return;
    }

    try {
      // Parse to object, then convert to target format
      const content = getInputContent();
      const data = parseToObject(content, currentInputFormat);
      const result = convertToFormat(data, toFormat);

      setOutputFormat(toFormat);

      // update editor content
      outputEditorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: getOutputContent().length,
          insert: result,
        },
        userEvent: "input",
      });
      toast.success(t("Messages.ConvertSuccess"));
    } catch {
      toast.error(t("Messages.ConvertFailed"));
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 md:gap-x-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="input-format">{t("Labels.InputFormat")}</Label>
          <Select
            value={selectedInputFormat || "auto"}
            onValueChange={(value) =>
              setSelectedInputFormat(
                value === "auto" ? null : (value as FormatType)
              )
            }
          >
            <SelectTrigger id="input-format" className="w-40">
              <SelectValue placeholder={t("Labels.InputFormat")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">{t("Labels.AutoDetect")}</SelectItem>
              {inputFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>{t("Labels.ConvertFormat")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {inputFormats
              .filter((format) => format !== currentInputFormat)
              .map((format) => (
                <DropdownMenuItem
                  key={format}
                  onClick={() => handleConvert(format)}
                >
                  {format.toUpperCase()}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid flex-1 gap-6 pt-6 md:gap-8 md:pt-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-lg font-medium">{t("Labels.Input")}</div>
              {currentInputFormat && (
                <Badge variant="outline">
                  {currentInputFormat.toUpperCase()}
                </Badge>
              )}
            </div>
            <CopyButton
              getValue={getInputContent}
              variant="outline"
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
            />
          </div>
          <div
            ref={inputEditorRef}
            className="border-input h-100 min-h-40 overflow-hidden rounded-md border shadow-xs md:h-[calc(100vh-26.5rem)] 2xl:h-[calc(100vh-23.5rem)]"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-lg font-medium">{t("Labels.Output")}</div>
              {outputFormat && (
                <Badge variant="outline">{outputFormat.toUpperCase()}</Badge>
              )}
            </div>
            <CopyButton
              getValue={getOutputContent}
              variant="outline"
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
            />
          </div>
          <div
            ref={outputEditorRef}
            className="border-input h-100 min-h-40 overflow-hidden rounded-md border shadow-xs md:h-[calc(100vh-26.5rem)] 2xl:h-[calc(100vh-23.5rem)]"
          />
        </div>
      </div>
    </>
  );
}
