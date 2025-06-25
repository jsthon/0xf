"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { plainTypingProps } from "@/lib/props/typing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyButton } from "@/components/copy-button";
import { NumberInput } from "@/components/number-input";

import {
  GenerateUUIDs,
  PREDEFINED_NAMESPACES,
  RequiresNamespace,
  UUID_VERSIONS,
  UUIDOptions,
  UUIDVersion,
  ValidateUUID,
} from "./uuid";

// Default configuration values
const DEFAULT_OPTIONS: UUIDOptions = {
  version: "v4",
  quantity: 1,
  namespace: "",
  name: "",
  hyphens: true,
  uppercase: false,
  braces: false,
  quotes: false,
  commas: false,
};

export default function UUIDGeneratorPage() {
  const [uuids, setUUIDs] = useState<string[]>([]);
  const [options, setOptions] = useState<UUIDOptions>(DEFAULT_OPTIONS);

  const t = useTranslations("UUIDGeneratorPage");

  // Update options
  const updateOptions = useCallback((newOptions: Partial<UUIDOptions>) => {
    setOptions((prevOptions) => ({ ...prevOptions, ...newOptions }));
  }, []);

  // Handle generate button click
  const handleGenerate = useCallback(() => {
    // check if namespace is required and valid
    if (RequiresNamespace(options.version)) {
      if (!options.namespace || !options.name) {
        setUUIDs([t("Messages.NamespaceRequired")]);
        return;
      }

      if (!ValidateUUID(options.namespace)) {
        setUUIDs([t("Messages.InvalidNamespace")]);
        return;
      }
    }

    // generate UUIDs
    const generatedUUIDs = GenerateUUIDs(options);
    if (generatedUUIDs.length > 0) {
      setUUIDs(generatedUUIDs);
    } else {
      setUUIDs([t("Messages.GenerateError")]);
    }
  }, [options, t]);

  // Version change handler
  const handleVersionChange = (value: string) => {
    updateOptions({ version: value as UUIDVersion });
  };

  // Quantity change handler
  const handleQuantityChange = (value: number | undefined) => {
    if (value === undefined) return;

    updateOptions({ quantity: value });
  };

  // Hyphens toggle handler
  const handleHyphensToggle = (checked: boolean) => {
    updateOptions({ hyphens: checked });
  };

  // Uppercase toggle handler
  const handleUppercaseToggle = (checked: boolean) => {
    updateOptions({ uppercase: checked });
  };

  // Braces toggle handler
  const handleBracesToggle = (checked: boolean) => {
    updateOptions({ braces: checked });
  };

  // Quotes toggle handler
  const handleQuotesToggle = (checked: boolean) => {
    updateOptions({ quotes: checked });
  };

  // Commas toggle handler
  const handleCommasToggle = (checked: boolean) => {
    updateOptions({ commas: checked });
  };

  // Namespace change handler
  const handleNamespaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateOptions({ namespace: e.target.value });
  };

  // Handle predefined namespace selection
  const handlePredefinedNamespace = (namespace: string) => {
    updateOptions({ namespace });
  };

  // Name change handler
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateOptions({ name: e.target.value });
  };

  // Generate UUIDs when options change or on initial load
  useEffect(() => {
    handleGenerate();
  }, [options, handleGenerate]);

  // Whether to show namespace and name fields
  const showNamespaceFields = RequiresNamespace(options.version);

  // Check if current namespace matches a predefined one
  const isSelectedNamespace = (value: string) => options.namespace === value;

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
            <Label htmlFor="uuids" className="text-lg">
              {t("Labels.Generated")}
            </Label>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleGenerate}
                    className="size-8"
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
                value={uuids.join("\n")}
                variant="outline"
                className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
              />
            </div>
          </div>
          <Textarea
            id="uuids"
            value={uuids.join("\n")}
            className="h-32 font-mono break-all"
            readOnly
          />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Label className="text-lg">{t("Labels.Version")}</Label>
            <RadioGroup
              className="flex flex-wrap gap-6"
              value={options.version}
              onValueChange={handleVersionChange}
            >
              {UUID_VERSIONS.map((version) => (
                <div key={version} className="flex items-center gap-2">
                  <RadioGroupItem value={version} id={version} />
                  <Label htmlFor={version}>{t(`Versions.${version}`)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-4">
            <Label htmlFor="quantity" className="text-lg">
              {t("Labels.Quantity")}
            </Label>
            <NumberInput
              id="quantity"
              className="w-24"
              value={options.quantity}
              min={1}
              max={1000}
              onValueChange={handleQuantityChange}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Label className="text-lg">{t("Labels.Format")}</Label>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hyphens"
                    checked={options.hyphens}
                    onCheckedChange={handleHyphensToggle}
                  />
                  <TooltipTrigger asChild>
                    <Label htmlFor="hyphens" className="text-base">
                      {t("Labels.Hyphens")}
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("Tooltips.Hyphens")}</p>
                  </TooltipContent>
                </div>
              </Tooltip>

              <Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="uppercase"
                    checked={options.uppercase}
                    onCheckedChange={handleUppercaseToggle}
                  />
                  <TooltipTrigger asChild>
                    <Label htmlFor="uppercase" className="text-base">
                      {t("Labels.Uppercase")}
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("Tooltips.Uppercase")}</p>
                  </TooltipContent>
                </div>
              </Tooltip>

              <Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="braces"
                    checked={options.braces}
                    onCheckedChange={handleBracesToggle}
                  />
                  <TooltipTrigger asChild>
                    <Label htmlFor="braces" className="text-base">
                      {t("Labels.Braces")}
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("Tooltips.Braces")}</p>
                  </TooltipContent>
                </div>
              </Tooltip>

              <Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="quotes"
                    checked={options.quotes}
                    onCheckedChange={handleQuotesToggle}
                  />
                  <TooltipTrigger asChild>
                    <Label htmlFor="quotes" className="text-base">
                      {t("Labels.Quotes")}
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("Tooltips.Quotes")}</p>
                  </TooltipContent>
                </div>
              </Tooltip>

              <Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="commas"
                    checked={options.commas}
                    onCheckedChange={handleCommasToggle}
                  />
                  <TooltipTrigger asChild>
                    <Label htmlFor="commas" className="text-base">
                      {t("Labels.Commas")}
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("Tooltips.Commas")}</p>
                  </TooltipContent>
                </div>
              </Tooltip>
            </div>
          </div>

          {showNamespaceFields && (
            <>
              <div className="flex flex-col gap-4">
                <Label htmlFor="namespace" className="text-lg">
                  {t("Labels.Namespace")}
                </Label>
                <Input
                  id="namespace"
                  className="font-mono"
                  value={options.namespace}
                  onChange={handleNamespaceChange}
                  {...plainTypingProps}
                />

                <div className="flex flex-wrap gap-4">
                  {Object.entries(PREDEFINED_NAMESPACES).map(([key, value]) => (
                    <Toggle
                      variant="outline"
                      key={key}
                      pressed={isSelectedNamespace(value)}
                      onPressedChange={() => handlePredefinedNamespace(value)}
                    >
                      {key}
                    </Toggle>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("Messages.NamespaceHint")}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Label htmlFor="name" className="text-lg">
                  {t("Labels.Name")}
                </Label>
                <Input
                  id="name"
                  value={options.name}
                  onChange={handleNameChange}
                  {...plainTypingProps}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
