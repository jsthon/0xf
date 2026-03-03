"use client";

import { ChangeEvent, useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import {
  decodeCharacters,
  detectEscapeType,
  encodeCharacters,
  EscapeType,
} from "@/lib/character";
import { plainTypingProps } from "@/lib/props/typing";
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
    (text: string, decode: boolean, encoding: EscapeType = charEncoding) => {
      if (!text) {
        setOutputText("");
        return;
      }

      if (decode) {
        let decoded: string | null;

        if (isAutoDetect) {
          // auto-detect encoding
          decoded = decodeCharacters(text);
          setOutputText(decoded || t("messages.decode.invalidEncoding"));
        } else {
          // use specific encoding selected by user
          decoded = decodeCharacters(text, encoding);

          // show specific error message based on the selected format
          if (!decoded) {
            switch (encoding) {
              case EscapeType.CodePoint:
                setOutputText(t("messages.decode.invalidCodePoint"));
                break;
              case EscapeType.EscapeSequence:
                setOutputText(t("messages.decode.invalidEscapeSequence"));
                break;
              case EscapeType.CssEscape:
                setOutputText(t("messages.decode.invalidCssEscape"));
                break;
              case EscapeType.HtmlCode:
                setOutputText(t("messages.decode.invalidHtmlCode"));
                break;
              case EscapeType.HtmlEntity:
                setOutputText(t("messages.decode.invalidHtmlEntity"));
                break;
              default:
                setOutputText(t("messages.decode.invalidEncoding"));
            }
          } else {
            setOutputText(decoded);
          }
        }
      } else {
        const encoded = encodeCharacters(text, encoding);
        setOutputText(encoded || t("messages.encode.failed"));
      }
    },
    [isAutoDetect, charEncoding, t]
  );

  // detect input type and process text
  const detectAndProcessInput = useCallback(
    (text: string, autoDetect: boolean = isAutoDetect) => {
      if (autoDetect) {
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
      detectAndProcessInput(inputText, true);
    }
  };

  // handle encoding change
  const handleEncodingChange = (value: string) => {
    const encoding = value as EscapeType;
    setIsAutoDetect(false);
    setCharEncoding(encoding);
    if (inputText) {
      processText(inputText, isDecodeMode, encoding);
    }
  };

  // get encoding badges for display
  const getEncodingBadges = (encoding: EscapeType) => {
    let labelKey:
      | "codePoint"
      | "escapeSequence"
      | "cssEscape"
      | "htmlCode"
      | "htmlEntity"
      | null = null;
    let formatExample: string = "";

    switch (encoding) {
      case EscapeType.CodePoint:
        labelKey = "codePoint";
        formatExample = "U+0000";
        break;
      case EscapeType.EscapeSequence:
        labelKey = "escapeSequence";
        formatExample = "\\u0000";
        break;
      case EscapeType.CssEscape:
        labelKey = "cssEscape";
        formatExample = "\\0000";
        break;
      case EscapeType.HtmlCode:
        labelKey = "htmlCode";
        formatExample = "&#00;";
        break;
      case EscapeType.HtmlEntity:
        labelKey = "htmlEntity";
        formatExample = "&name;";
        break;
      default:
        return null;
    }

    return (
      <>
        {labelKey && <Badge>{t(`labels.${labelKey}`)}</Badge>}
        <Badge variant="secondary">{formatExample}</Badge>
      </>
    );
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

      <RadioGroup
        value={charEncoding}
        onValueChange={handleEncodingChange}
        className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2 md:pt-8 lg:grid-cols-3"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value={EscapeType.CodePoint} id="format-codepoint" />
          <Label htmlFor="format-codepoint">{t("controls.codePoint")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem
            value={EscapeType.EscapeSequence}
            id="format-escapesequence"
          />
          <Label htmlFor="format-escapesequence">
            {t("controls.escapeSequence")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value={EscapeType.CssEscape} id="format-cssescape" />
          <Label htmlFor="format-cssescape">{t("controls.cssEscape")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value={EscapeType.HtmlCode} id="format-htmlcode" />
          <Label htmlFor="format-htmlcode">{t("controls.htmlCode")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem
            value={EscapeType.HtmlEntity}
            id="format-htmlentity"
          />
          <Label htmlFor="format-htmlentity">{t("controls.htmlEntity")}</Label>
        </div>
      </RadioGroup>

      <div className="grid flex-1 gap-6 pt-6 md:gap-8 md:pt-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Label htmlFor="input" className="text-lg">
                {t("labels.input")}
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
