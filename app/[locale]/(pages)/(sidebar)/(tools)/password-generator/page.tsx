"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon, ClipboardIcon, RefreshCw } from "lucide-react";
import { customAlphabet } from "nanoid";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";

// Character sets for password generation
const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARS = "0123456789";
const SYMBOL_CHARS = "-!#$%&()*,.:?@[]^_{}~+<=>";

// Password length constraints
const MIN_CHARACTER_LENGTH = 8;
const MAX_CHARACTER_LENGTH = 100;

// Interface for password generation options
interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

// Default password options
const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
};

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState<string>("");
  const [options, setOptions] = useState<PasswordOptions>(
    DEFAULT_PASSWORD_OPTIONS
  );

  const t = useTranslations("PasswordGeneratorPage");
  const tCopy = useTranslations("CopyButton");

  // Generate a random password based on provided options
  const generatePassword = useCallback(
    (options: PasswordOptions): string => {
      // validate that at least one character type is selected
      if (
        !options.includeUppercase &&
        !options.includeLowercase &&
        !options.includeNumbers &&
        !options.includeSymbols
      ) {
        return t("Messages.SelectCharType");
      }

      // build character set based on options
      let chars = "";
      if (options.includeUppercase) chars += UPPERCASE_CHARS;
      if (options.includeLowercase) chars += LOWERCASE_CHARS;
      if (options.includeNumbers) chars += NUMBER_CHARS;
      if (options.includeSymbols) chars += SYMBOL_CHARS;

      // create a nanoid generator with our custom alphabet
      const generateNanoId = customAlphabet(chars, options.length);

      // generate password
      const password = generateNanoId();

      // ensure at least one character from each selected type is included
      if (options.length >= 4) {
        const types = [];
        if (options.includeUppercase) types.push(UPPERCASE_CHARS);
        if (options.includeLowercase) types.push(LOWERCASE_CHARS);
        if (options.includeNumbers) types.push(NUMBER_CHARS);
        if (options.includeSymbols) types.push(SYMBOL_CHARS);

        // check if all required character types are present
        const missingTypes = types.filter(
          (type) => !password.split("").some((char) => type.includes(char))
        );

        // if any types are missing, regenerate the password
        if (missingTypes.length > 0) {
          return generatePassword(options);
        }
      }

      return password;
    },
    [t]
  );

  // Update options and generate new password
  const updateOptionsAndGeneratePassword = useCallback(
    (newOptions: PasswordOptions) => {
      setOptions(newOptions);

      try {
        const newPassword = generatePassword(newOptions);
        setPassword(newPassword);
      } catch (error) {
        setPassword(t("Messages.GenerateError"));
        console.error("Password generation error:", error);
      }
    },
    [generatePassword, t]
  );

  // Generate a new password with current options
  const handleGeneratePassword = useCallback(() => {
    try {
      const newPassword = generatePassword(options);
      setPassword(newPassword);
    } catch (error) {
      setPassword(t("Messages.GenerateError"));
      console.error("Password generation error:", error);
    }
  }, [options, generatePassword, t]);

  // Handle manual password edit
  const handlePasswordChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPassword(e.target.value);
  };

  // Update character length
  const handleLengthChange = (values: number[]) => {
    if (values.length > 0) {
      updateOptionsAndGeneratePassword({
        ...options,
        length: values[0],
      });
    }
  };

  // Handle character length input
  const handleLengthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    if (isNaN(value)) return;

    const newLength = Math.max(
      MIN_CHARACTER_LENGTH,
      Math.min(MAX_CHARACTER_LENGTH, value)
    );

    updateOptionsAndGeneratePassword({
      ...options,
      length: newLength,
    });
  };

  // Toggle character type options
  const handleToggleUppercase = (checked: boolean) => {
    updateOptionsAndGeneratePassword({
      ...options,
      includeUppercase: checked,
    });
  };

  const handleToggleLowercase = (checked: boolean) => {
    updateOptionsAndGeneratePassword({
      ...options,
      includeLowercase: checked,
    });
  };

  const handleToggleNumbers = (checked: boolean) => {
    updateOptionsAndGeneratePassword({
      ...options,
      includeNumbers: checked,
    });
  };

  const handleToggleSymbols = (checked: boolean) => {
    updateOptionsAndGeneratePassword({
      ...options,
      includeSymbols: checked,
    });
  };

  // Generate password only on initial load
  useEffect(() => {
    handleGeneratePassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-lg">
              {t("Labels.Password")}
            </Label>
            <Textarea
              id="password"
              value={password}
              spellCheck={false}
              onChange={handlePasswordChange}
              className="h-24 font-mono break-all md:text-xl"
            />
          </div>

          <div className="flex gap-4">
            <CopyButton
              variant="default"
              size="default"
              className="flex-1"
              value={password}
            >
              {(hasCopied) => (
                <>
                  {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
                  {tCopy("Copy")}
                </>
              )}
            </CopyButton>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleGeneratePassword}
              title={t("Labels.Refresh")}
            >
              <RefreshCw className="size-4" />
              {t("Labels.Refresh")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="character-length" className="text-base">
              {t("Labels.CharacterLength")}
            </Label>
            <Input
              id="character-length"
              value={options.length}
              onChange={handleLengthInputChange}
              className="h-8 w-16 text-center text-base font-medium"
            />
          </div>
          <Slider
            min={MIN_CHARACTER_LENGTH}
            max={MAX_CHARACTER_LENGTH}
            step={1}
            value={[options.length]}
            onValueChange={handleLengthChange}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Label className="text-base">{t("Labels.CharacterTypes")}</Label>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="uppercase"
                checked={options.includeUppercase}
                onCheckedChange={handleToggleUppercase}
              />
              <Label htmlFor="uppercase" className="text-base">
                ABC
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="lowercase"
                checked={options.includeLowercase}
                onCheckedChange={handleToggleLowercase}
              />
              <Label htmlFor="lowercase" className="text-base">
                abc
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="numbers"
                checked={options.includeNumbers}
                onCheckedChange={handleToggleNumbers}
              />
              <Label htmlFor="numbers" className="text-base">
                123
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="symbols"
                checked={options.includeSymbols}
                onCheckedChange={handleToggleSymbols}
              />
              <Label htmlFor="symbols" className="text-base">
                !@#
              </Label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
