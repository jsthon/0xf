"use client";

import { ChangeEvent, useCallback, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  base64ToBlob,
  base64ToText,
  convertToUrlSafe,
  detectFileExtension,
  fileToBase64,
  fileToText,
  hasStandardChars,
  hasUrlSafeChars,
  isProbablyBase64,
  textToBase64,
} from "@/lib/base64";
import { saveBlobAsFile } from "@/lib/file";
import { plainTypingProps } from "@/lib/props/typing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyButton } from "@/components/copy-button";

export default function Base64Page() {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [isAutoDetect, setIsAutoDetect] = useState(true);
  const [isDecodeMode, setIsDecodeMode] = useState(false);
  const [isUrlSafe, setIsUrlSafe] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("Base64Page");

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  // process text based on current state
  const processText = useCallback(
    (text: string, autoDetect: boolean, decode: boolean, urlSafe: boolean) => {
      if (!text) {
        setOutputText("");
        return;
      }

      if (decode) {
        if (!autoDetect) {
          if (urlSafe && hasStandardChars(text)) {
            setOutputText(t("Messages.Decode.StandardChars"));
            return;
          }
          if (!urlSafe && hasUrlSafeChars(text)) {
            setOutputText(t("Messages.Decode.UrlSafeChars"));
            return;
          }
        }

        const decoded = base64ToText(text);
        setOutputText(decoded || t("Messages.Decode.Invalid"));
      } else {
        const encoded = textToBase64(text, urlSafe);
        setOutputText(encoded || t("Messages.Encode.Failed"));
      }
    },
    [t]
  );

  // detect input type and process text
  const detectAndProcessInput = useCallback(
    async (text: string, autoDetect: boolean = isAutoDetect) => {
      if (autoDetect) {
        const isBase64 = await isProbablyBase64(text);
        const urlSafe = isBase64 && hasUrlSafeChars(text);

        setIsDecodeMode(isBase64);
        setIsUrlSafe(urlSafe);

        processText(text, autoDetect, isBase64, urlSafe);
      } else {
        processText(text, autoDetect, isDecodeMode, isUrlSafe);
      }
    },
    [isAutoDetect, isDecodeMode, isUrlSafe, processText]
  );

  // handle text input changes
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    detectAndProcessInput(newText);
  };

  // toggle auto detect switch
  const handleAutoDetectToggle = (checked: boolean) => {
    setIsAutoDetect(checked);

    if (checked && inputText) {
      detectAndProcessInput(inputText, true);
    }
  };

  // toggle decode mode switch
  const handleDecodeModeToggle = (checked: boolean) => {
    setIsAutoDetect(false);
    setIsDecodeMode(checked);

    processText(inputText, false, checked, isUrlSafe);
  };

  // toggle url safe switch
  const handleUrlSafeToggle = (checked: boolean) => {
    setIsAutoDetect(false);
    setIsUrlSafe(checked);

    processText(inputText, false, isDecodeMode, checked);
  };

  // handle file upload to encode
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("Messages.Upload.Limit"));
      return;
    }

    try {
      // read file to text content
      const textContent = await fileToText(file);
      let isBase64 = false;

      // assume the input is base64 or not
      if (isAutoDetect) {
        isBase64 = await isProbablyBase64(textContent);
        setIsDecodeMode(isBase64);
      } else {
        isBase64 = isDecodeMode;
      }

      if (isBase64) {
        // decode mode: convert base64 to text
        setInputText(textContent);
        setOutputText(
          base64ToText(textContent) || t("Messages.Decode.Invalid")
        );
      } else {
        // encode mode: convert file to base64
        const base64Content = await fileToBase64(file);
        setInputText(textContent);
        setOutputText(
          isUrlSafe ? convertToUrlSafe(base64Content) : base64Content
        );
      }
    } catch {
      toast.error(t("Messages.Upload.Failed"));
    }
  };

  // handle download in decode mode
  const handleDownload = async () => {
    // Verify we have content to download
    const content = isDecodeMode ? inputText : outputText;
    if (!content) {
      toast.error(t("Messages.Download.Empty"));
      return;
    }

    try {
      let blob: Blob;
      let filename: string;

      if (isDecodeMode) {
        // decode mode: convert base64 to binary file
        blob = base64ToBlob(inputText);
        const fileExt = await detectFileExtension(inputText);
        filename = fileExt ? `decoded.${fileExt}` : "decoded";
      } else {
        // encode mode: save base64 as text file
        blob = new Blob([outputText], { type: "text/plain" });
        filename = "encoded.txt";
      }

      saveBlobAsFile(blob, filename);
    } catch {
      toast.error(t("Messages.Download.Failed"));
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <Tooltip>
          <div className="flex items-center gap-2">
            <Switch
              id="auto-detect"
              checked={isAutoDetect}
              onCheckedChange={handleAutoDetectToggle}
            />
            <TooltipTrigger asChild>
              <Label htmlFor="auto-detect">{t("Controls.AutoDetect")}</Label>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Tooltips.AutoDetect")}</p>
            </TooltipContent>
          </div>
        </Tooltip>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="decode-mode"
            className={!isDecodeMode ? "" : "text-muted-foreground opacity-70"}
          >
            {t("Controls.Encode")}
          </Label>
          <Switch
            id="decode-mode"
            checked={isDecodeMode}
            onCheckedChange={handleDecodeModeToggle}
          />
          <Label
            htmlFor="decode-mode"
            className={isDecodeMode ? "" : "text-muted-foreground opacity-70"}
          >
            {t("Controls.Decode")}
          </Label>
        </div>
        <Tooltip>
          <div className="flex items-center gap-2">
            <Switch
              id="url-safe"
              checked={isUrlSafe}
              onCheckedChange={handleUrlSafeToggle}
            />
            <TooltipTrigger asChild>
              <Label htmlFor="url-safe">{t("Controls.UrlSafe")}</Label>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Tooltips.UrlSafe")}</p>
            </TooltipContent>
          </div>
        </Tooltip>
      </div>

      <div className="grid flex-1 gap-6 pt-6 md:gap-8 md:pt-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Label htmlFor="input" className="text-lg">
                {t("Labels.Input")}
              </Label>
              {(!isAutoDetect || inputText) && isDecodeMode && (
                <div className="flex items-center gap-2">
                  <Badge>{t("Badges.Base64")}</Badge>
                  {isUrlSafe && (
                    <Badge variant="secondary">{t("Badges.UrlSafe")}</Badge>
                  )}
                </div>
              )}
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
                    size="icon-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    <span className="sr-only">{t("Labels.Upload")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("Labels.Upload")}</p>
                </TooltipContent>
              </Tooltip>
              <CopyButton
                value={inputText}
                variant="outline"
                className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
              />
            </div>
          </div>
          <Textarea
            id="input"
            className="h-full max-h-[400px] min-h-[100px] resize-none font-mono break-all"
            value={inputText}
            onChange={handleInputChange}
            placeholder={
              isAutoDetect
                ? t("Placeholders.Input.AutoDetect")
                : isDecodeMode
                  ? t("Placeholders.Input.Decode")
                  : t("Placeholders.Input.Encode")
            }
            {...plainTypingProps}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Label htmlFor="output" className="text-lg">
                {t("Labels.Output")}
              </Label>
              {(!isAutoDetect || inputText) && !isDecodeMode && (
                <div className="flex items-center gap-2">
                  <Badge>{t("Badges.Base64")}</Badge>
                  {isUrlSafe && (
                    <Badge variant="secondary">{t("Badges.UrlSafe")}</Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleDownload}
                  >
                    <Download className="size-4" />
                    <span className="sr-only">{t("Labels.Download")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("Labels.Download")}</p>
                </TooltipContent>
              </Tooltip>
              <CopyButton
                value={outputText}
                variant="outline"
                className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
              />
            </div>
          </div>
          <Textarea
            id="output"
            className="bg-muted/50 dark:bg-muted/20 h-full max-h-[400px] min-h-[100px] resize-none font-mono break-all"
            value={outputText}
            readOnly
            placeholder={
              isAutoDetect
                ? t("Placeholders.Output.AutoDetect")
                : isDecodeMode
                  ? t("Placeholders.Output.Decode")
                  : t("Placeholders.Output.Encode")
            }
          />
        </div>
      </div>
    </>
  );
}
