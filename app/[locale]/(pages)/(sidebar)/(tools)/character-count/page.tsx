"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";

import { countText, PATTERNS } from "./count";

export default function CharacterCountPage() {
  const [text, setText] = useState("");
  const t = useTranslations("CharacterCountPage");

  const result = countText(text);

  // map character types to translation labels
  const countLabels = {
    whitespace: t("Labels.Whitespace"),
    latin: t("Labels.LatinScript"),
    nonLatin: t("Labels.NonLatinScript"),
    digit: t("Labels.Digits"),
    symbols: t("Labels.Symbols"),
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
          <div className="flex items-center justify-between">
            <Label htmlFor="text" className="text-lg">
              {t("Labels.Text")}
            </Label>
            <CopyButton
              value={text}
              variant="outline"
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
            />
          </div>
          <Textarea
            id="text"
            className="h-64"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("Placeholders.Input")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-base font-medium">{t("Labels.Total")}</h2>
            <span className="text-lg font-medium">
              {result.total.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <h2 className="text-base font-medium">{t("Labels.Words")}</h2>
            <span className="text-lg font-medium">
              {result.words.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <h2 className="text-base font-medium">{t("Labels.Lines")}</h2>
            <span className="text-lg font-medium">
              {result.lines.toLocaleString()}
            </span>
          </div>

          {Object.entries(countLabels).map(([type, label]) => {
            const value = result[type as keyof typeof PATTERNS];
            return (
              <div key={type} className="flex flex-col items-center gap-1">
                <h2 className="text-base font-medium">{label}</h2>
                <span className="text-lg font-medium">
                  {value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
