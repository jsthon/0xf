"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { UAParser, type IResult } from "ua-parser-js";
import { Bots } from "ua-parser-js/extensions";
import { isBot, isChromeFamily } from "ua-parser-js/helpers";

import { plainTypingProps } from "@/lib/props/typing";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";

const USER_AGENT_FIELDS = {
  BrowserName: (result: IResult) => result.browser.name,
  BrowserVersion: (result: IResult) => result.browser.version,
  EngineName: (result: IResult) => result.engine.name,
  EngineVersion: (result: IResult) => result.engine.version,
  DeviceType: (result: IResult) => result.device.type,
  DeviceVendor: (result: IResult) => result.device.vendor,
  DeviceModel: (result: IResult) => result.device.model,
  CPUArchitecture: (result: IResult) => result.cpu.architecture,
  OSName: (result: IResult) => result.os.name,
  OSVersion: (result: IResult) => result.os.version,
  IsBot: (result: IResult) => isBot(result),
  ChromiumBased: (result: IResult) => isChromeFamily(result),
} as const;

export default function UserAgentPage() {
  const [userAgent, setUserAgent] = useState("");
  const t = useTranslations("UserAgentPage");

  const parseResult: IResult = userAgent
    ? new UAParser(userAgent, Bots).getResult()
    : new UAParser("", Bots).getResult();

  const formatFieldValue = (value: string | boolean | undefined) => {
    const defaultValue = "-";
    if (!userAgent) return defaultValue;
    if (typeof value === "boolean") {
      return t(value ? "Values.Yes" : "Values.No");
    }
    return value || defaultValue;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserAgent(navigator.userAgent);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="user-agent" className="text-lg">
              {t("Labels.Input")}
            </Label>

            <CopyButton
              value={userAgent}
              variant="outline"
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-8 rounded-md border [&_svg]:size-4"
            />
          </div>

          <Textarea
            id="user-agent"
            className="h-40 font-mono sm:h-24"
            value={userAgent}
            onChange={(e) => setUserAgent(e.target.value)}
            placeholder={t("Placeholders.Input")}
            {...plainTypingProps}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-lg font-medium">{t("Labels.Output")}</div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {(
              Object.keys(
                USER_AGENT_FIELDS
              ) as (keyof typeof USER_AGENT_FIELDS)[]
            ).map((name) => (
              <div key={name} className="flex flex-col gap-1">
                <p className="text-muted-foreground text-sm">
                  {t(`Labels.${name}`)}
                </p>
                <p className="font-medium">
                  {formatFieldValue(USER_AGENT_FIELDS[name](parseResult))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
