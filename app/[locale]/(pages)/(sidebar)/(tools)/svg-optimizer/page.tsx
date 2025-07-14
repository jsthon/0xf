"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  optimize,
  type Config,
  type Output,
  type PluginConfig,
} from "svgo/browser";

import { formatBytes, saveBlobAsFile } from "@/lib/file";
import { plainTypingProps } from "@/lib/props/typing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyButton } from "@/components/copy-button";

const OPTIONS_CONFIG = [
  { name: "pretty", checked: false },
  { name: "removeXMLNS", checked: false },
  { name: "removeRasterImages", checked: false },
  { name: "removeDimensions", checked: false },
  { name: "removeViewBox", checked: false },
  { name: "convertStyleToAttrs", checked: false },
  { name: "reusePaths", checked: false },
  { name: "removeScripts", checked: false },
  { name: "removeOffCanvasPaths", checked: false },
  { name: "removeDoctype", checked: true },
  { name: "removeXMLProcInst", checked: true },
  { name: "removeComments", checked: true },
  { name: "removeMetadata", checked: true },
  { name: "removeTitle", checked: true },
  { name: "removeEditorsNSData", checked: true },
  { name: "cleanupAttrs", checked: true },
  { name: "mergeStyles", checked: true },
  { name: "inlineStyles", checked: true },
  { name: "minifyStyles", checked: true },
  { name: "cleanupIds", checked: true },
  { name: "removeUselessDefs", checked: true },
  { name: "cleanupNumericValues", checked: true },
  { name: "convertColors", checked: true },
  { name: "removeUnknownsAndDefaults", checked: true },
  { name: "removeNonInheritableGroupAttrs", checked: true },
  { name: "removeUselessStrokeAndFill", checked: true },
  { name: "cleanupEnableBackground", checked: true },
  { name: "removeHiddenElems", checked: true },
  { name: "removeEmptyText", checked: true },
  { name: "convertShapeToPath", checked: true },
  { name: "convertEllipseToCircle", checked: true },
  { name: "moveElemsAttrsToGroup", checked: true },
  { name: "moveGroupAttrsToElems", checked: true },
  { name: "collapseGroups", checked: true },
  { name: "convertPathData", checked: true },
  { name: "convertTransform", checked: true },
  { name: "removeEmptyAttrs", checked: true },
  { name: "removeEmptyContainers", checked: true },
  { name: "mergePaths", checked: true },
  { name: "removeUnusedNS", checked: true },
  { name: "sortAttrs", checked: true },
  { name: "sortDefsChildren", checked: true },
  { name: "removeDesc", checked: true },
] as const;

type OptionName = (typeof OPTIONS_CONFIG)[number]["name"];

export default function SvgOptimizerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputSvg, setInputSvg] = useState("");
  const [outputSvg, setOutputSvg] = useState("");
  const [isOriginal, setIsOriginal] = useState(false);
  const [floatPrecision, setFloatPrecision] = useState(3);
  const [svgoOptions, setSvgoOptions] = useState<Record<OptionName, boolean>>(
    () =>
      Object.fromEntries(
        OPTIONS_CONFIG.map((opt) => [opt.name, opt.checked])
      ) as Record<OptionName, boolean>
  );

  const t = useTranslations("SvgOptimizerPage");

  const inputSize = useMemo(() => new Blob([inputSvg]).size, [inputSvg]);
  const outputSize = useMemo(() => new Blob([outputSvg]).size, [outputSvg]);
  const sizeRatio = useMemo(() => {
    if (inputSize === 0 || outputSize === 0) return 0;
    return (outputSize / inputSize) * 100;
  }, [inputSize, outputSize]);

  const svgProcess = useCallback(
    (
      svg: string,
      options: Record<OptionName, boolean>,
      floatPrecision: number
    ): { data: string; error: boolean } => {
      try {
        const plugins: PluginConfig[] = [];
        for (const optionName in options) {
          const name = optionName as OptionName;
          if (options[name] && name !== "pretty") {
            plugins.push(name);
          }
        }
        const config: Config = {
          multipass: true,
          floatPrecision,
          js2svg: { indent: 2, pretty: options.pretty },
          plugins,
        };
        const result: Output = optimize(svg, config);
        return { data: result.data, error: false };
      } catch {
        return { data: "", error: true };
      }
    },
    []
  );

  useEffect(() => {
    const { data, error } = svgProcess(inputSvg, svgoOptions, floatPrecision);
    setOutputSvg(error ? "" : data);
  }, [inputSvg, svgoOptions, floatPrecision, svgProcess]);

  const handleOptionToggle = (optionName: OptionName) => {
    setSvgoOptions((prev) => ({ ...prev, [optionName]: !prev[optionName] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) =>
        setInputSvg((event.target?.result as string) || "");
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const content = isOriginal ? inputSvg : outputSvg;
    const blob = new Blob([content], { type: "image/svg+xml" });
    saveBlobAsFile(blob, `${isOriginal ? "original" : "optimized"}.svg`);
  };

  const displaySvg = isOriginal ? inputSvg : outputSvg;
  const displaySize = isOriginal ? inputSize : outputSize;
  const showSizeRatio = !isOriginal && outputSize > 0 && inputSize > 0;

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Label htmlFor="input" className="text-lg">
                {t("Labels.Input")}
              </Label>
              <div className="flex items-center gap-2">
                {inputSize > 0 && (
                  <Badge variant="outline">{formatBytes(inputSize)}</Badge>
                )}
                {inputSize > 0 && outputSize === 0 && (
                  <Badge variant="destructive">{t("Badges.Invalid")}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="original"
                checked={isOriginal}
                onCheckedChange={setIsOriginal}
              />
              <Label htmlFor="original">{t("Labels.ShowOriginal")}</Label>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Input
              id="input"
              placeholder={t("Placeholders.Input")}
              value={inputSvg}
              onChange={(e) => setInputSvg(e.target.value)}
              {...plainTypingProps}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload />
              {t("Labels.Upload")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".svg,image/svg+xml"
            />
          </div>
        </div>

        <Tabs defaultValue="preview" className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <TabsList>
                <TabsTrigger value="preview">{t("Labels.Preview")}</TabsTrigger>
                <TabsTrigger value="code">{t("Labels.Code")}</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                {outputSize > 0 && (
                  <Badge variant="outline">{formatBytes(displaySize)}</Badge>
                )}
                {showSizeRatio && (
                  <Badge variant="secondary">{sizeRatio.toFixed(0)}%</Badge>
                )}
                {isOriginal && (
                  <Badge variant="secondary">{t("Badges.Original")}</Badge>
                )}
              </div>
            </div>
            {displaySvg && (
              <div className="flex flex-auto items-center justify-end gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
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
                  value={displaySvg}
                  variant="outline"
                  className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
                />
              </div>
            )}
          </div>
          <TabsContent value="preview">
            <div
              className="border-input h-100 overflow-hidden rounded-md border shadow-xs"
              style={{
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Cpath d='M1 2V0h1v1H0v1z' fill='%23999' fill-opacity='.1'/%3E%3C/svg%3E") 0 0/16px 16px`,
              }}
            >
              {displaySvg && (
                <iframe
                  title="SVG Preview"
                  className="h-full w-full"
                  sandbox=""
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(displaySvg)}`}
                />
              )}
            </div>
          </TabsContent>
          <TabsContent value="code">
            <Textarea
              className="h-100 resize-none font-mono break-all"
              value={displaySvg}
              readOnly
            />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-base font-medium">
              {t("Options.floatPrecision")}
            </div>
            <span className="text-base font-medium">{floatPrecision}</span>
          </div>
          <Slider
            min={0}
            max={8}
            step={1}
            value={[floatPrecision]}
            onValueChange={(value) => setFloatPrecision(value[0])}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {OPTIONS_CONFIG.map((option) => (
            <div className="flex items-center gap-2" key={option.name}>
              <Checkbox
                id={`opt-${option.name}`}
                checked={svgoOptions[option.name]}
                onCheckedChange={() => handleOptionToggle(option.name)}
              />
              <Label
                htmlFor={`opt-${option.name}`}
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t(`Options.${option.name}`)}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
