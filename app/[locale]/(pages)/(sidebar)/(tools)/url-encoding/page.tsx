"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
        setOutputText(decoded || t("Messages.Decode.Invalid"));
      } else {
        const encoded = encodeToUrl(text);
        setOutputText(encoded || t("Messages.Encode.Failed"));
      }
    },
    [t]
  );

  // detect input type and process text
  const detectAndProcessInput = useCallback(
    (text: string) => {
      if (isAutoDetect) {
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
      detectAndProcessInput(inputText);
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
      <div className="space-y-2 pb-8">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
          {t("Meta.Title")}
        </h1>
        {t.has("Meta.Description") && (
          <p className="text-base text-muted-foreground">
            {t("Meta.Description")}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <Tooltip>
          <div className="flex items-center space-x-2">
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
        <div className="flex items-center space-x-2">
          <Label htmlFor="decode-mode">{t("Controls.Encode")}</Label>
          <Switch
            id="decode-mode"
            checked={isDecodeMode}
            onCheckedChange={handleDecodeModeToggle}
          />
          <Label htmlFor="decode-mode">{t("Controls.Decode")}</Label>
        </div>
      </div>
      <div className="grid gap-6 pt-6 md:gap-8 md:pt-8 lg:grid-cols-2">
        <div className="flex h-full flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <h2 className="text-lg font-medium">{t("Labels.Input")}</h2>
              {(!isAutoDetect || inputText) && isDecodeMode && (
                <Badge>{t("Labels.URLEncoded")}</Badge>
              )}
            </div>
            <CopyButton
              value={inputText}
              variant="outline"
              className="h-8 w-8 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground [&_svg]:h-4 [&_svg]:w-4"
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
            className="h-[300px] lg:h-[500px]"
          />
        </div>
        <div className="flex h-full flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <h2 className="text-lg font-medium">{t("Labels.Output")}</h2>
              {(!isAutoDetect || inputText) && !isDecodeMode && (
                <Badge>{t("Labels.URLEncoded")}</Badge>
              )}
            </div>
            <CopyButton
              value={outputText}
              variant="outline"
              className="h-8 w-8 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground [&_svg]:h-4 [&_svg]:w-4"
            />
          </div>
          <div className="h-[300px] overflow-y-auto rounded-md border border-input bg-muted/50 px-3 py-2 text-base shadow-sm md:text-sm lg:h-[500px]">
            {outputText ? (
              <pre className="whitespace-pre-wrap break-all">{outputText}</pre>
            ) : (
              <p className="text-muted-foreground">
                {isDecodeMode
                  ? t("Placeholders.Output.Decode")
                  : t("Placeholders.Output.Encode")}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
