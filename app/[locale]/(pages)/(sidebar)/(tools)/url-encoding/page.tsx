"use client";

import { ChangeEvent, useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import { plainTypingProps } from "@/lib/props/typing";
import {
  decodeFromUrl,
  encodeToUrl,
  isValidUrlEncoded,
} from "@/lib/url-encoding";
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

export default function URLEncodingPage() {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [isAutoDetect, setIsAutoDetect] = useState(true);
  const [isDecodeMode, setIsDecodeMode] = useState(false);

  const t = useTranslations("URLEncodingPage");

  // process text based on current state
  const processText = useCallback(
    (text: string, decode: boolean) => {
      if (!text) {
        setOutputText("");
        return;
      }

      if (decode) {
        const decoded = decodeFromUrl(text);
        setOutputText(decoded || t("messages.decode.invalid"));
      } else {
        const encoded = encodeToUrl(text);
        setOutputText(encoded || t("messages.encode.failed"));
      }
    },
    [t]
  );

  // detect input type and process text
  const detectAndProcessInput = useCallback(
    (text: string, autoDetect: boolean = isAutoDetect) => {
      if (autoDetect) {
        const isUrlEncoded = isValidUrlEncoded(text);
        setIsDecodeMode(isUrlEncoded);
        processText(text, isUrlEncoded);
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
      detectAndProcessInput(inputText, true);
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
              <Label htmlFor="auto-detect">{t("controls.autoDetect")}</Label>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("tooltips.autoDetect")}</p>
            </TooltipContent>
          </div>
        </Tooltip>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="decode-mode"
            className={!isDecodeMode ? "" : "text-muted-foreground opacity-70"}
          >
            {t("controls.encode")}
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
            {t("controls.decode")}
          </Label>
        </div>
      </div>

      <div className="grid flex-1 gap-6 pt-6 md:gap-8 md:pt-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Label htmlFor="input" className="text-lg">
                {t("labels.input")}
              </Label>
              {(!isAutoDetect || inputText) && isDecodeMode && (
                <Badge>{t("labels.urlEncoded")}</Badge>
              )}
            </div>
            <CopyButton
              value={inputText}
              variant="outline"
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
            />
          </div>
          <Textarea
            id="input"
            className="h-full max-h-[400px] min-h-[100px] resize-none font-mono break-all"
            value={inputText}
            onChange={handleInputChange}
            placeholder={
              isAutoDetect
                ? t("placeholders.input.autoDetect")
                : isDecodeMode
                  ? t("placeholders.input.decode")
                  : t("placeholders.input.encode")
            }
            {...plainTypingProps}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Label htmlFor="output" className="text-lg">
                {t("labels.output")}
              </Label>
              {(!isAutoDetect || inputText) && !isDecodeMode && (
                <Badge>{t("labels.urlEncoded")}</Badge>
              )}
            </div>
            <CopyButton
              value={outputText}
              variant="outline"
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
            />
          </div>
          <Textarea
            id="output"
            className="bg-muted/50 dark:bg-muted/20 h-full max-h-[400px] min-h-[100px] resize-none font-mono break-all"
            value={outputText}
            readOnly
            placeholder={
              isAutoDetect
                ? t("placeholders.output.autoDetect")
                : isDecodeMode
                  ? t("placeholders.output.decode")
                  : t("placeholders.output.encode")
            }
          />
        </div>
      </div>
    </>
  );
}
