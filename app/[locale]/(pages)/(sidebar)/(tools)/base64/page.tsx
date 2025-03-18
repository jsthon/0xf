"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  decodeFromBase64,
  encodeToBase64,
  hasStandardChars,
  hasUrlSafeChars,
  isValidBase64,
} from "@/lib/base64";
import { Badge } from "@/components/ui/badge";
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

  const t = useTranslations("Base64Page");

  // process text based on current state
  const processText = useCallback(
    (text: string, decode: boolean) => {
      if (!text) {
        setOutputText("");
        return;
      }

      if (decode) {
        if (!isAutoDetect) {
          if (isUrlSafe && hasStandardChars(text)) {
            setOutputText(t("Messages.Decode.StandardChars"));
            return;
          }
          if (!isUrlSafe && hasUrlSafeChars(text)) {
            setOutputText(t("Messages.Decode.UrlSafeChars"));
            return;
          }
        }

        const decoded = decodeFromBase64(text);
        setOutputText(decoded || t("Messages.Decode.InvalidBase64"));
      } else {
        const encoded = encodeToBase64(text, isUrlSafe);
        setOutputText(encoded || t("Messages.Encode.Failed"));
      }
    },
    [isAutoDetect, isUrlSafe, t]
  );

  // detect input type and process text
  const detectAndProcessInput = useCallback(
    (text: string) => {
      if (isAutoDetect) {
        const isBase64 = isValidBase64(text);
        const urlSafe = isBase64 && hasUrlSafeChars(text);

        setIsDecodeMode(isBase64);
        setIsUrlSafe(urlSafe);
        processText(text, isBase64);
      } else {
        processText(text, isDecodeMode);
      }
    },
    [isAutoDetect, isDecodeMode, processText]
  );

  // handle text input changes
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    detectAndProcessInput(newText);
  };

  // toggle decode mode switch
  const handleDecodeModeToggle = (checked: boolean) => {
    setIsAutoDetect(false);
    setIsDecodeMode(checked);

    processText(inputText, checked);
  };

  // toggle auto detect switch
  const handleAutoDetectToggle = (checked: boolean) => {
    setIsAutoDetect(checked);

    if (checked && inputText) {
      detectAndProcessInput(inputText);
    }
  };

  // toggle url safe switch
  const handleUrlSafeToggle = (checked: boolean) => {
    setIsAutoDetect(false);
    setIsUrlSafe(checked);

    if (inputText) {
      processText(inputText, isDecodeMode);
    }
  };

  // update output when dependencies change
  useEffect(() => {
    if (inputText) {
      detectAndProcessInput(inputText);
    }
  }, [inputText, detectAndProcessInput]);

  return (
    <>
      <div className="flex flex-col gap-2 pb-8">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
          {t("Meta.Title")}
        </h1>
        {t.has("Meta.Description") && (
          <p className="text-muted-foreground text-base">
            {t("Meta.Description")}
          </p>
        )}
      </div>
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
              <p>{t("Messages.Tooltips.AutoDetect")}</p>
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
              <p>{t("Messages.Tooltips.UrlSafe")}</p>
            </TooltipContent>
          </div>
        </Tooltip>
      </div>
      <div className="grid flex-1 gap-6 pt-6 md:gap-8 md:pt-8 lg:grid-cols-2">
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <h2 className="text-lg font-medium">{t("Labels.Input")}</h2>
              {(!isAutoDetect || inputText) && isDecodeMode && (
                <>
                  <Badge>{t("Labels.Base64")}</Badge>
                  {isUrlSafe && (
                    <Badge variant="secondary">{t("Labels.UrlSafe")}</Badge>
                  )}
                </>
              )}
            </div>
            <CopyButton
              value={inputText}
              variant="outline"
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
            />
          </div>
          <Textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder={
              isDecodeMode
                ? t("Placeholders.Input.Decode")
                : t("Placeholders.Input.Encode")
            }
            className="h-full max-h-[400px] min-h-[100px]"
          />
        </div>
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <h2 className="text-lg font-medium">{t("Labels.Output")}</h2>
              {(!isAutoDetect || inputText) && !isDecodeMode && (
                <>
                  <Badge>{t("Labels.Base64")}</Badge>
                  {isUrlSafe && (
                    <Badge variant="secondary">{t("Labels.UrlSafe")}</Badge>
                  )}
                </>
              )}
            </div>
            <CopyButton
              value={outputText}
              variant="outline"
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
            />
          </div>
          <Textarea
            value={outputText}
            readOnly
            placeholder={
              isDecodeMode
                ? t("Placeholders.Output.Decode")
                : t("Placeholders.Output.Encode")
            }
            className="bg-muted/50 h-full max-h-[400px] min-h-[100px]"
          />
        </div>
      </div>
    </>
  );
}
