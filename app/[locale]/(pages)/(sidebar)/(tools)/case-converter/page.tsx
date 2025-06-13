"use client";

import { useCallback, useEffect, useState } from "react";
import { Case } from "change-case-all";
import { useTranslations } from "next-intl";

import { plainTypingProps } from "@/lib/props/typing";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyButton } from "@/components/copy-button";

// Define case formats
const CASE_FORMATS = {
  camel: Case.camel,
  pascal: Case.pascal,
  capital: Case.capital,
  sentence: Case.sentence,
  constant: Case.constant,
  snake: Case.snake,
  no: Case.no,
  kebab: Case.kebab,
  dot: Case.dot,
  path: Case.path,
  title: Case.title,
  train: Case.train,
  lower: Case.lower,
  upper: Case.upper,
  lowerFirst: Case.lowerFirst,
  upperFirst: Case.upperFirst,
  sponge: Case.sponge,
} as const;

type CaseFormat = keyof typeof CASE_FORMATS;
type ConvertedText = Record<CaseFormat, string>;

export default function CaseConverterPage() {
  const [inputText, setInputText] = useState("");
  const [convertedText, setConvertedText] = useState<ConvertedText>(
    {} as ConvertedText
  );

  const t = useTranslations("CaseConverterPage");

  // Convert input text to different case formats
  const convertText = useCallback((text: string) => {
    if (!text) return {} as ConvertedText;

    return Object.entries(CASE_FORMATS).reduce(
      (acc, [format, convertFn]) => ({
        ...acc,
        [format]: convertFn(text),
      }),
      {} as ConvertedText
    );
  }, []);

  // Handle input text changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newText = e.target.value;
      setInputText(newText);
      setConvertedText(convertText(newText));
    },
    [convertText]
  );

  // Converted text when component mounts
  useEffect(() => {
    setConvertedText(convertText(inputText));
  }, [convertText, inputText]);

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

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Label htmlFor="text-input" className="text-lg">
            {t("Labels.Input")}
          </Label>

          <Input
            id="text-input"
            value={inputText}
            placeholder={t("Placeholders.Input")}
            onChange={handleInputChange}
            {...plainTypingProps}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label className="text-lg">{t("Labels.Output")}</Label>

          <div className="grid gap-4 md:grid-cols-2">
            {(Object.keys(CASE_FORMATS) as CaseFormat[]).map((format) => (
              <div key={format} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 md:gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor={`format-${format}`}>
                        {t(`Formats.${format}`)}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t(`Tooltips.${format}`)}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Badge variant="outline">{t(`Badges.${format}`)}</Badge>
                </div>

                <div className="relative">
                  <Input
                    id={`format-${format}`}
                    className="pr-9"
                    value={convertedText[format] || ""}
                    readOnly
                  />
                  <div className="absolute inset-y-0 right-1 flex items-center">
                    <CopyButton
                      value={convertedText[format] || ""}
                      size="sm"
                      variant="ghost"
                      className="text-foreground hover:bg-accent hover:text-accent-foreground size-7 rounded-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
