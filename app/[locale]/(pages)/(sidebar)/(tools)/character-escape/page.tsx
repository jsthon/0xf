"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  decodeCharacters,
  detectEscapeType,
  encodeCharacters,
  EscapeType,
} from "@/lib/character";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyButton } from "@/components/copy-button";

export default function CharacterEscapePage() {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [isAutoDetect, setIsAutoDetect] = useState(true);
  const [isDecodeMode, setIsDecodeMode] = useState(false);
  const [charEncoding, setCharEncoding] = useState<EscapeType>(
    EscapeType.CodePoint
  );

  const t = useTranslations("CharacterEscapePage");

  // process text based on current state
  const processText = useCallback(
    (text: string, decode: boolean) => {
      if (!text) {
        setOutputText("");
        return;
      }

      if (decode) {
        let decoded: string | null;

        if (isAutoDetect) {
          // auto-detect encoding
          decoded = decodeCharacters(text);
          setOutputText(decoded || t("Messages.Decode.InvalidEncoding"));
        } else {
          // use specific encoding selected by user
          decoded = decodeCharacters(text, charEncoding);

          // show specific error message based on the selected format
          if (!decoded) {
            switch (charEncoding) {
              case EscapeType.CodePoint:
                setOutputText(t("Messages.Decode.InvalidCodePoint"));
                break;
              case EscapeType.EscapeSequence:
                setOutputText(t("Messages.Decode.InvalidEscapeSequence"));
                break;
              case EscapeType.CssEscape:
                setOutputText(t("Messages.Decode.InvalidCssEscape"));
                break;
              case EscapeType.HtmlCode:
                setOutputText(t("Messages.Decode.InvalidHtmlCode"));
                break;
              case EscapeType.HtmlEntity:
                setOutputText(t("Messages.Decode.InvalidHtmlEntity"));
                break;
              default:
                setOutputText(t("Messages.Decode.InvalidEncoding"));
            }
          } else {
            setOutputText(decoded);
          }
        }
      } else {
        const encoded = encodeCharacters(text, charEncoding);
        setOutputText(encoded || t("Messages.Encode.Failed"));
      }
    },
    [isAutoDetect, charEncoding, t]
  );

  // detect input type and process text
  const detectAndProcessInput = useCallback(
    (text: string) => {
      if (isAutoDetect) {
        const detectedFormat = detectEscapeType(text);
        const isEncodedFormat = detectedFormat !== null;

        setIsDecodeMode(isEncodedFormat);
        if (detectedFormat) {
          setCharEncoding(detectedFormat);
        }
        processText(text, isEncodedFormat);
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

  // handle encoding change
  const handleEncodingChange = (value: string) => {
    setIsAutoDetect(false);
    setCharEncoding(value as EscapeType);
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

  // get encoding badges for display
  const getEncodingBadges = (encoding: EscapeType) => {
    let labelKey:
      | "CodePoint"
      | "EscapeSequence"
      | "CssEscape"
      | "HtmlCode"
      | "HtmlEntity"
      | null = null;
    let formatExample: string = "";

    switch (encoding) {
      case EscapeType.CodePoint:
        labelKey = "CodePoint";
        formatExample = "U+0000";
        break;
      case EscapeType.EscapeSequence:
        labelKey = "EscapeSequence";
        formatExample = "\\u0000";
        break;
      case EscapeType.CssEscape:
        labelKey = "CssEscape";
        formatExample = "\\0000";
        break;
      case EscapeType.HtmlCode:
        labelKey = "HtmlCode";
        formatExample = "&#00;";
        break;
      case EscapeType.HtmlEntity:
        labelKey = "HtmlEntity";
        formatExample = "&name;";
        break;
      default:
        return null;
    }

    return (
      <>
        {labelKey && <Badge>{t(`Labels.${labelKey}`)}</Badge>}
        <Badge variant="secondary">{formatExample}</Badge>
      </>
    );
  };

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
      </div>

      <RadioGroup
        value={charEncoding}
        onValueChange={handleEncodingChange}
        className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2 md:pt-8 lg:grid-cols-3"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value={EscapeType.CodePoint} id="format-codepoint" />
          <Label htmlFor="format-codepoint">{t("Controls.CodePoint")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem
            value={EscapeType.EscapeSequence}
            id="format-escapesequence"
          />
          <Label htmlFor="format-escapesequence">
            {t("Controls.EscapeSequence")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value={EscapeType.CssEscape} id="format-cssescape" />
          <Label htmlFor="format-cssescape">{t("Controls.CssEscape")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value={EscapeType.HtmlCode} id="format-htmlcode" />
          <Label htmlFor="format-htmlcode">{t("Controls.HtmlCode")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem
            value={EscapeType.HtmlEntity}
            id="format-htmlentity"
          />
          <Label htmlFor="format-htmlentity">{t("Controls.HtmlEntity")}</Label>
        </div>
      </RadioGroup>

      <div className="grid flex-1 gap-6 pt-6 md:gap-8 md:pt-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Label htmlFor="input" className="text-lg">
                {t("Labels.Input")}
              </Label>
              {(!isAutoDetect || inputText) && isDecodeMode && (
                <div className="flex items-center gap-2">
                  {getEncodingBadges(charEncoding)}
                </div>
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
            className="h-full max-h-[400px] min-h-[100px] font-mono"
            value={inputText}
            spellCheck={false}
            onChange={handleInputChange}
            placeholder={
              isDecodeMode
                ? t("Placeholders.Input.Decode")
                : t("Placeholders.Input.Encode")
            }
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
                  {getEncodingBadges(charEncoding)}
                </div>
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
            className="bg-muted/50 h-full max-h-[400px] min-h-[100px] font-mono"
            value={outputText}
            spellCheck={false}
            readOnly
            placeholder={
              isDecodeMode
                ? t("Placeholders.Output.Decode")
                : t("Placeholders.Output.Encode")
            }
          />
        </div>
      </div>
    </>
  );
}
