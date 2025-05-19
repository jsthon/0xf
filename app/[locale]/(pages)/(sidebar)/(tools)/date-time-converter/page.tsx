"use client";

import { useEffect, useMemo, useState } from "react";
import { isValid } from "date-fns";
import { useTranslations } from "next-intl";

import { getUserTimezone } from "@/lib/timezones";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/copy-button";
import { TimezoneSelect } from "@/components/timezone-select";

import { dateFormats } from "./date-format";

// auto detect select value
const AUTO_DETECT_VALUE = -1;

export default function DateTimeConverterPage() {
  const [inputText, setInputText] = useState<string>("");
  const [inputFormatIndex, setInputFormatIndex] =
    useState<number>(AUTO_DETECT_VALUE);
  const [detectedFormatIndex, setDetectedFormatIndex] = useState<number>(-1);
  const [currentDate, setCurrentDate] = useState<Date>();
  const [outputTimezone, setOutputTimezone] = useState<string>();

  const t = useTranslations("DateTimeConverterPage");

  // Prevent hydration mismatch
  useEffect(() => {
    setOutputTimezone(getUserTimezone());
  }, []);

  // Update current date every second
  useEffect(() => {
    if (inputText) return;

    setCurrentDate(new Date());

    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 40);

    return () => clearInterval(interval);
  }, [inputText]);

  // Get input format key for badge
  const getInputFormatKey = useMemo(() => {
    if (!inputText) {
      return "CurrentTime";
    }

    return dateFormats[
      inputFormatIndex === AUTO_DETECT_VALUE
        ? detectedFormatIndex
        : inputFormatIndex
    ]?.key;
  }, [inputText, inputFormatIndex, detectedFormatIndex]);

  // Get input date or current date
  const getTargetDate = (): Date | undefined => {
    if (!inputText) {
      return currentDate;
    }

    try {
      // use detected format or user selected format
      const index =
        inputFormatIndex === AUTO_DETECT_VALUE
          ? detectedFormatIndex
          : inputFormatIndex;

      return dateFormats[index]?.parse(inputText);
    } catch {
      return undefined;
    }
  };

  // Convert date to string
  const toDateString = (
    stringify: (date: Date, timezone?: string) => string,
    date?: Date
  ): string => {
    if (!date || !isValid(date)) return "";

    try {
      return stringify(date, outputTimezone) || "";
    } catch {
      return "";
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputText(value);

    // match format
    if (value) {
      setDetectedFormatIndex(
        // find the last format, because javascript can match most of the formats
        dateFormats.findLastIndex(({ match }) => match(value))
      );
    } else {
      setDetectedFormatIndex(-1);
    }
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

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Label htmlFor="date-input" className="text-lg">
              {t("Labels.Input")}
            </Label>
            {getInputFormatKey && (
              <Badge>{t(`DateFormats.${getInputFormatKey}`)}</Badge>
            )}
          </div>

          <Input
            id="date-input"
            className="font-mono"
            value={inputText}
            placeholder={t("Placeholders.Input")}
            onChange={(e) => handleInputChange(e.target.value)}
            autoComplete="off"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-format">{t("Labels.InputFormat")}</Label>

              <Select
                value={String(inputFormatIndex)}
                onValueChange={(value) => setInputFormatIndex(Number(value))}
              >
                <SelectTrigger id="input-format" className="w-full">
                  <SelectValue placeholder={t("Labels.InputFormat")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    key="auto-detect"
                    value={String(AUTO_DETECT_VALUE)}
                  >
                    {t("Labels.AutoDetect")}
                  </SelectItem>
                  {dateFormats.map((format, index) => (
                    <SelectItem key={format.key} value={String(index)}>
                      {t(`DateFormats.${format.key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("Labels.OutputTimezone")}</Label>
              <TimezoneSelect
                value={outputTimezone}
                onChange={setOutputTimezone}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Label className="text-lg">{t("Labels.Output")}</Label>
            <Badge variant="outline">{outputTimezone}</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {dateFormats.map((format, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col gap-2",
                  index === 0 && "lg:col-span-2"
                )}
              >
                <Label htmlFor={`date-${index}`}>
                  {t(`DateFormats.${format.key}`)}
                </Label>

                <div className="relative">
                  <Input
                    id={`date-${index}`}
                    className="pr-9 font-mono"
                    value={toDateString(format.stringify, getTargetDate())}
                    placeholder={inputText && t("Placeholders.Invalid")}
                    readOnly
                  />

                  <div className="absolute inset-y-0 right-1 flex items-center">
                    <CopyButton
                      value={toDateString(format.stringify, getTargetDate())}
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
