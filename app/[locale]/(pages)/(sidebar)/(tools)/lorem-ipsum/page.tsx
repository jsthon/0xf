"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { loremIpsum } from "lorem-ipsum";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { plainTypingProps } from "@/lib/props/typing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyButton } from "@/components/copy-button";

// Options interface for Lorem Ipsum generation
interface LoremIpsumOptions {
  startWithLoremIpsum: boolean;
  randomRange: boolean;
  displayPTags: boolean;
  paragraphsRange: [number, number];
  sentencesPerParagraphRange: [number, number];
  wordsPerSentenceRange: [number, number];
}

// Default configuration values
const DEFAULT_OPTIONS: LoremIpsumOptions = {
  startWithLoremIpsum: true,
  randomRange: false,
  displayPTags: false,
  paragraphsRange: [3, 5],
  sentencesPerParagraphRange: [6, 8],
  wordsPerSentenceRange: [8, 10],
};

// Traditional Lorem Ipsum starting sentence
const TRADITIONAL_START =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export default function LoremIpsumPage() {
  const [text, setText] = useState<string>("");
  const [options, setOptions] = useState<LoremIpsumOptions>(DEFAULT_OPTIONS);
  const [, startTransition] = useTransition();
  const t = useTranslations("LoremIpsumPage");

  // Generate Lorem Ipsum text based on current options
  const generateText = useCallback(() => {
    try {
      const format = options.displayPTags ? "html" : "plain";

      // determine how many paragraphs to generate
      const paragraphCount = options.randomRange
        ? Math.floor(
            Math.random() *
              (options.paragraphsRange[1] - options.paragraphsRange[0] + 1)
          ) + options.paragraphsRange[0]
        : options.paragraphsRange[0];

      // generate paragraphs
      let result = loremIpsum({
        count: options.startWithLoremIpsum
          ? Math.max(0, paragraphCount - 1)
          : paragraphCount,
        format: format as "html" | "plain",
        paragraphLowerBound: options.sentencesPerParagraphRange[0],
        paragraphUpperBound: options.randomRange
          ? options.sentencesPerParagraphRange[1]
          : options.sentencesPerParagraphRange[0],
        random: Math.random,
        sentenceLowerBound: options.wordsPerSentenceRange[0],
        sentenceUpperBound: options.randomRange
          ? options.wordsPerSentenceRange[1]
          : options.wordsPerSentenceRange[0],
        suffix: "\n",
        units: "paragraphs" as const,
      });

      // add traditional Lorem Ipsum paragraph if needed
      if (options.startWithLoremIpsum && paragraphCount > 0) {
        const firstParagraph =
          format === "html" ? `<p>${TRADITIONAL_START}</p>` : TRADITIONAL_START;

        // add newline between paragraphs if needed
        result = firstParagraph + (result ? "\n" + result : "");
      }

      return result.trim();
    } catch (error) {
      console.error("Lorem Ipsum generation error:", error);
      return t("Messages.GenerateError");
    }
  }, [options, t]);

  // Update options and trigger text regeneration
  const updateOptions = useCallback((newOptions: LoremIpsumOptions) => {
    setOptions(newOptions);
  }, []);

  // Handle generate button click
  const handleGenerate = useCallback(() => {
    try {
      setText(generateText());
    } catch (error) {
      setText(t("Messages.GenerateError"));
      console.error("Lorem Ipsum generation error:", error);
    }
  }, [generateText, t]);

  // Handle text area changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Slider event handlers
  const handleParagraphsChange = (values: number[]) => {
    if (options.randomRange && values.length === 2) {
      updateOptions({ ...options, paragraphsRange: [values[0], values[1]] });
    } else if (!options.randomRange && values.length === 1) {
      updateOptions({ ...options, paragraphsRange: [values[0], values[0]] });
    }
  };

  const handleSentencesChange = (values: number[]) => {
    if (options.randomRange && values.length === 2) {
      updateOptions({
        ...options,
        sentencesPerParagraphRange: [values[0], values[1]],
      });
    } else if (!options.randomRange && values.length === 1) {
      updateOptions({
        ...options,
        sentencesPerParagraphRange: [values[0], values[0]],
      });
    }
  };

  const handleWordsChange = (values: number[]) => {
    if (options.randomRange && values.length === 2) {
      updateOptions({
        ...options,
        wordsPerSentenceRange: [values[0], values[1]],
      });
    } else if (!options.randomRange && values.length === 1) {
      updateOptions({
        ...options,
        wordsPerSentenceRange: [values[0], values[0]],
      });
    }
  };

  // Switch event handlers
  const handleStartWithLoremToggle = (checked: boolean) => {
    updateOptions({ ...options, startWithLoremIpsum: checked });
  };

  const handleRandomRangeToggle = (checked: boolean) => {
    updateOptions({ ...options, randomRange: checked });
  };

  const handleDisplayPTagsToggle = (checked: boolean) => {
    updateOptions({ ...options, displayPTags: checked });
  };

  // Generate text when options change or on initial load
  useEffect(() => {
    startTransition(() => {
      handleGenerate();
    });
  }, [options, handleGenerate]);

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="text" className="text-lg">
              {t("Labels.Text")}
            </Label>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="size-4" />
                    <span className="sr-only">{t("Labels.Regenerate")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("Labels.Regenerate")}</p>
                </TooltipContent>
              </Tooltip>
              <CopyButton
                value={text}
                variant="outline"
                className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
              />
            </div>
          </div>
          <Textarea
            id="text"
            value={text}
            onChange={handleTextChange}
            className="h-64"
            {...plainTypingProps}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-2">
            <Switch
              id="start-with-lorem"
              checked={options.startWithLoremIpsum}
              onCheckedChange={handleStartWithLoremToggle}
            />
            <Label htmlFor="start-with-lorem" className="text-base">
              {t("Labels.StartWithLorem")}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="random-range"
              checked={options.randomRange}
              onCheckedChange={handleRandomRangeToggle}
            />
            <Label htmlFor="random-range" className="text-base">
              {t("Labels.RandomRange")}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="display-p-tags"
              checked={options.displayPTags}
              onCheckedChange={handleDisplayPTagsToggle}
            />
            <Label htmlFor="display-p-tags" className="text-base">
              {t("Labels.DisplayPTags")}
            </Label>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-medium">
                {t("Labels.Paragraphs")}
              </div>
              <span className="text-base font-medium">
                {options.randomRange
                  ? `${options.paragraphsRange[0]} - ${options.paragraphsRange[1]}`
                  : options.paragraphsRange[0]}
              </span>
            </div>
            <Slider
              min={1}
              max={50}
              step={1}
              value={
                options.randomRange
                  ? options.paragraphsRange
                  : [options.paragraphsRange[0]]
              }
              onValueChange={handleParagraphsChange}
              minStepsBetweenThumbs={0}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-medium">
                {t("Labels.Sentences")}
              </div>
              <span className="text-base font-medium">
                {options.randomRange
                  ? `${options.sentencesPerParagraphRange[0]} - ${options.sentencesPerParagraphRange[1]}`
                  : options.sentencesPerParagraphRange[0]}
              </span>
            </div>
            <Slider
              min={4}
              max={20}
              step={1}
              value={
                options.randomRange
                  ? options.sentencesPerParagraphRange
                  : [options.sentencesPerParagraphRange[0]]
              }
              onValueChange={handleSentencesChange}
              minStepsBetweenThumbs={0}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-medium">{t("Labels.Words")}</div>
              <span className="text-base font-medium">
                {options.randomRange
                  ? `${options.wordsPerSentenceRange[0]} - ${options.wordsPerSentenceRange[1]}`
                  : options.wordsPerSentenceRange[0]}
              </span>
            </div>
            <Slider
              min={4}
              max={20}
              step={1}
              value={
                options.randomRange
                  ? options.wordsPerSentenceRange
                  : [options.wordsPerSentenceRange[0]]
              }
              onValueChange={handleWordsChange}
              minStepsBetweenThumbs={0}
            />
          </div>
        </div>
      </div>
    </>
  );
}
