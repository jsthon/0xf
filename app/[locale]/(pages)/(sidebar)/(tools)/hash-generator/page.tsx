"use client";

import { ChangeEvent, useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import { plainTypingProps } from "@/lib/props/typing";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import FileUpload from "@/components/file-upload";

import {
  DIGEST_ENCODINGS,
  DigestEncoding,
  fileToUint8Array,
  generateHash,
  HASH_ALGORITHMS,
  HashAlgorithm,
  IDataType,
} from "./hash";

// Supported input types
type InputType = "text" | "file";

// Default selected hash algorithms
const DEFAULT_ALGORITHMS: HashAlgorithm[] = ["MD5", "SHA1", "SHA256"];

export default function HashGeneratorPage() {
  // input states
  const [inputType, setInputType] = useState<InputType>("text");
  const [inputText, setInputText] = useState<string>("");
  const [inputFile, setInputFile] = useState<File | null>(null);
  // hash generation states
  const [encoding, setEncoding] = useState<DigestEncoding>("hexLower");
  const [hashResults, setHashResults] = useState<
    Partial<Record<HashAlgorithm, string>>
  >({});
  const [loadingSkeleton, setLoadingSkeleton] = useState<Set<HashAlgorithm>>(
    new Set()
  );
  const [selectedAlgorithms, setSelectedAlgorithms] =
    useState<HashAlgorithm[]>(DEFAULT_ALGORITHMS);

  const t = useTranslations("HashGeneratorPage");

  // Get current input data based on input type
  const getCurrentInput = useCallback((): { data: string | File | null } => {
    return {
      data: inputType === "text" ? inputText : inputFile,
    };
  }, [inputType, inputText, inputFile]);

  // Process file data to Uint8Array
  const processFileData = useCallback(
    async (file: File): Promise<IDataType | null> => {
      try {
        return await fileToUint8Array(file);
      } catch (err) {
        console.error("Failed to read file:", err);
        return null;
      }
    },
    []
  );

  // Generate hash for a single algorithm
  const generateSingleHash = useCallback(
    async (data: IDataType, algorithm: HashAlgorithm, enc: DigestEncoding) => {
      try {
        const hash = await generateHash(data, algorithm, enc);
        setHashResults((current) => ({ ...current, [algorithm]: hash }));
      } catch (error) {
        console.error(`Error generating hash for ${algorithm}:`, error);
      } finally {
        setLoadingSkeleton((prev) => {
          const next = new Set(prev);
          next.delete(algorithm);
          return next;
        });
      }
    },
    []
  );

  // Update all selected algorithm hashes
  const updateAllHashes = useCallback(
    async (input: string | File, enc: DigestEncoding) => {
      if (!input) {
        setHashResults({});
        setLoadingSkeleton(new Set());
        return;
      }

      try {
        const data =
          inputType === "text"
            ? (input as string)
            : await processFileData(input as File);
        if (!data) {
          setLoadingSkeleton(new Set());
          return;
        }

        // process each algorithm independently
        selectedAlgorithms.forEach((algorithm) => {
          generateSingleHash(data, algorithm, enc);
        });
      } catch (error) {
        console.error("Error processing input:", error);
        setHashResults({});
        setLoadingSkeleton(new Set());
      }
    },
    [selectedAlgorithms, inputType, processFileData, generateSingleHash]
  );

  // Handle algorithm selection changes
  const handleAlgorithmToggle = useCallback(
    async (algorithm: HashAlgorithm) => {
      setSelectedAlgorithms((prev) => {
        const isRemoving = prev.includes(algorithm);
        if (isRemoving) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          setHashResults(({ [algorithm]: _, ...rest }) => rest);
          return prev.filter((a) => a !== algorithm);
        }

        const { data } = getCurrentInput();
        if (!data) return [...prev, algorithm];

        // Start hash generation for new algorithm
        setLoadingSkeleton((prev) => new Set([...prev, algorithm]));
        const input = data as string | File;
        if (inputType === "text") {
          generateSingleHash(input as string, algorithm, encoding);
        } else {
          processFileData(input as File).then((fileData) => {
            if (fileData) {
              generateSingleHash(fileData, algorithm, encoding);
            }
          });
        }

        return [...prev, algorithm];
      });
    },
    [getCurrentInput, inputType, encoding, processFileData, generateSingleHash]
  );

  // Handle text input changes
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setInputText(newText);
      setLoadingSkeleton(new Set(selectedAlgorithms));
      updateAllHashes(newText, encoding);
    },
    [selectedAlgorithms, encoding, updateAllHashes]
  );

  // Handle file upload
  const handleFileUploaded = useCallback(
    (file: File | File[] | null) => {
      setHashResults({});
      setInputFile(null);

      if (!file) return;

      const singleFile = Array.isArray(file) ? file[0] : file;
      setInputFile(singleFile);
      setLoadingSkeleton(new Set(selectedAlgorithms));
      updateAllHashes(singleFile, encoding);
    },
    [selectedAlgorithms, encoding, updateAllHashes]
  );

  // Handle encoding format changes
  const handleEncodingChange = useCallback(
    (value: string) => {
      if (!DIGEST_ENCODINGS.includes(value as DigestEncoding)) return;

      setEncoding(value as DigestEncoding);
      const { data } = getCurrentInput();
      if (data) {
        setLoadingSkeleton(new Set(selectedAlgorithms));
        updateAllHashes(data, value as DigestEncoding);
      }
    },
    [selectedAlgorithms, getCurrentInput, updateAllHashes]
  );

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="text-lg font-medium">{t("Labels.Input")}</div>
          <RadioGroup
            className="flex flex-wrap gap-6"
            value={inputType}
            onValueChange={(value) => {
              setInputText("");
              setInputFile(null);
              setHashResults({});
              setInputType(value as InputType);
            }}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="text" id="input-text" />
              <Label htmlFor="input-text">{t("InputType.Text")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="file" id="input-file" />
              <Label htmlFor="input-file">{t("InputType.File")}</Label>
            </div>
          </RadioGroup>

          {inputType === "text" ? (
            <Textarea
              placeholder={t("Placeholders.Input")}
              value={inputText}
              onChange={handleInputChange}
              className="h-32"
              {...plainTypingProps}
            />
          ) : (
            <FileUpload
              className="h-32"
              onFilesUploaded={handleFileUploaded}
              secondaryText={t("Messages.LocalProcessing")}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-lg font-medium">
            {t("Labels.DigestEncoding")}
          </div>
          <RadioGroup
            value={encoding}
            onValueChange={handleEncodingChange}
            className="flex flex-wrap gap-4"
          >
            {DIGEST_ENCODINGS.map((enc) => (
              <div key={enc} className="flex items-center gap-2">
                <RadioGroupItem value={enc} id={enc} />
                <Label htmlFor={enc}>
                  {enc === "hexLower" && t("DigestEncoding.HexLower")}
                  {enc === "hexUpper" && t("DigestEncoding.HexUpper")}
                  {enc === "base64" && t("DigestEncoding.Base64")}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-lg font-medium">{t("Labels.Algorithm")}</div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {HASH_ALGORITHMS.map((algorithm) => (
              <div key={algorithm} className="flex items-center gap-2">
                <Checkbox
                  id={`algo-${algorithm}`}
                  checked={selectedAlgorithms.includes(algorithm)}
                  onCheckedChange={() => handleAlgorithmToggle(algorithm)}
                />
                <Label
                  htmlFor={`algo-${algorithm}`}
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {algorithm}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-lg font-medium">{t("Labels.Output")}</div>
          {selectedAlgorithms.map((algorithm) => (
            <div key={algorithm} className="flex items-center gap-2">
              <div className="w-24 flex-shrink-0 md:w-32">
                <Label htmlFor={`hash-${algorithm}`}>{algorithm}</Label>
              </div>
              <div className="relative flex-grow">
                {loadingSkeleton.has(algorithm) ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <div className="relative flex-grow">
                    <Input
                      id={`hash-${algorithm}`}
                      value={hashResults[algorithm] || ""}
                      readOnly
                      className="pr-9 font-mono"
                    />
                    <div className="absolute inset-y-0 right-1 flex items-center">
                      <CopyButton
                        value={hashResults[algorithm] || ""}
                        size="sm"
                        variant="ghost"
                        className="text-foreground hover:bg-accent hover:text-accent-foreground size-7 rounded-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
