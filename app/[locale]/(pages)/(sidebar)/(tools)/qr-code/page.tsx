"use client";

import { useRef, useState } from "react";
import { CheckIcon, ClipboardIcon, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ColorInput } from "@/components/color-input";
import { CopyButton } from "@/components/copy-button";
import { PasswordInput } from "@/components/password-input";

// Supported input types
type InputType = "text" | "wifi";

// WiFi related types
interface WiFiData {
  type: AuthenticationType;
  ssid: string;
  password?: string;
  hidden?: boolean;
  eap_method?: string;
  identity?: string;
  anonymous_identity?: string;
  phase2_method?: string;
}

const AUTHENTICATION_TYPES = ["WPA", "WEP", "WPA2-EAP", "nopass"] as const;

type AuthenticationType = (typeof AUTHENTICATION_TYPES)[number];
type WiFiDataValue<K extends keyof WiFiData> = WiFiData[K];

export default function QRCodePage() {
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [inputType, setInputType] = useState<InputType>("text");
  const [textData, setTextData] = useState<string>("");
  const [wifiData, setWifiData] = useState<WiFiData>({
    type: "WPA",
    ssid: "",
    password: "",
    hidden: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = useTranslations("QRCodePage");
  const tCopy = useTranslations("CopyButton");

  // Get QR code value based on the selected input type
  const getQRCodeValue = (): string => {
    switch (inputType) {
      case "wifi": {
        let str = `WIFI:`;
        if (wifiData.type) {
          str += `T:${wifiData.type};`;
        }
        if (wifiData.ssid) {
          str += `S:${wifiData.ssid};`;
        }
        if (wifiData.type !== "nopass" && wifiData.password) {
          str += `P:${wifiData.password};`;
        }
        if (wifiData.hidden) {
          str += "H:true;";
        }
        if (wifiData.type === "WPA2-EAP") {
          if (wifiData.eap_method) {
            str += `E:${wifiData.eap_method};`;
          }
          if (wifiData.anonymous_identity) {
            str += `A:${wifiData.anonymous_identity};`;
          }
          if (wifiData.identity) {
            str += `I:${wifiData.identity};`;
          }
          if (wifiData.phase2_method) {
            str += `PH2:${wifiData.phase2_method};`;
          }
        }
        return str + ";";
      }
      case "text":
      default:
        return textData || "";
    }
  };

  // Get canvas blob for copy button
  const getCanvasBlob = async (): Promise<Blob> => {
    return new Promise<Blob>((resolve) => {
      canvasRef.current?.toBlob(
        (blob) => resolve(blob || new Blob([], { type: "image/png" })),
        "image/png"
      );
    });
  };

  // Download QR code image
  const downloadImage = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qrcode.png";
      link.click();

      URL.revokeObjectURL(url);
    }, "image/png");
  };

  // Update WiFi data
  const updateWifiData = <K extends keyof WiFiData>(
    field: K,
    value: WiFiDataValue<K>
  ) => {
    setWifiData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

      <div className="grid flex-1 gap-6 md:gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6 md:gap-8">
          <Label className="text-lg">{t("Labels.Generated")}</Label>

          <div className="flex justify-center">
            <QRCodeCanvas
              ref={canvasRef}
              value={getQRCodeValue()}
              size={200}
              bgColor={bgColor}
              fgColor={fgColor}
              marginSize={1}
            />
          </div>

          <div className="flex gap-4">
            <CopyButton
              variant="outline"
              size="default"
              className="flex-1"
              getValue={getCanvasBlob}
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
              onClick={downloadImage}
              title={t("Labels.Download")}
            >
              <Download className="size-4" />
              {t("Labels.Download")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          <Tabs
            className="gap-4"
            value={inputType}
            onValueChange={(value) => setInputType(value as InputType)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">{t("Tabs.Text")}</TabsTrigger>
              <TabsTrigger value="wifi">{t("Tabs.WiFi")}</TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <div className="flex flex-col gap-4">
                <Label className="text-lg">{t("Labels.InputText")}</Label>
                <Textarea
                  placeholder={t("Placeholders.InputText")}
                  value={textData}
                  spellCheck={false}
                  onChange={(e) => setTextData(e.target.value)}
                  className="min-h-40"
                />
              </div>
            </TabsContent>

            <TabsContent value="wifi">
              <div className="flex flex-col gap-4">
                <Label className="text-lg">{t("WiFi.Title")}</Label>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="wifi-ssid">{t("WiFi.SSID")}</Label>
                  <Input
                    id="wifi-ssid"
                    placeholder="SSID"
                    value={wifiData.ssid}
                    onChange={(e) => updateWifiData("ssid", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="wifi-type">{t("WiFi.Type")}</Label>
                  <Select
                    value={wifiData.type}
                    onValueChange={(value) =>
                      updateWifiData("type", value as AuthenticationType)
                    }
                  >
                    <SelectTrigger id="wifi-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTHENTICATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`WiFi.AuthenticationType.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {wifiData.type !== "nopass" && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="wifi-password">{t("WiFi.Password")}</Label>
                    <PasswordInput
                      id="wifi-password"
                      value={wifiData.password}
                      onChange={(e) =>
                        updateWifiData("password", e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="wifi-hidden"
                    checked={!!wifiData.hidden}
                    onCheckedChange={(checked) =>
                      updateWifiData("hidden", !!checked)
                    }
                  />
                  <Label htmlFor="wifi-hidden">{t("WiFi.Hidden")}</Label>
                </div>

                {wifiData.type === "WPA2-EAP" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wifi-eap">{t("WiFi.EAPMethod")}</Label>
                      <Input
                        id="wifi-eap"
                        value={wifiData.eap_method || ""}
                        onChange={(e) =>
                          updateWifiData(
                            "eap_method",
                            e.target.value.toUpperCase()
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wifi-identity">
                        {t("WiFi.Identity")}
                      </Label>
                      <Input
                        id="wifi-identity"
                        value={wifiData.identity || ""}
                        onChange={(e) =>
                          updateWifiData("identity", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wifi-anonymous">
                        {t("WiFi.AnonymousIdentity")}
                      </Label>
                      <Input
                        id="wifi-anonymous"
                        value={wifiData.anonymous_identity || ""}
                        onChange={(e) =>
                          updateWifiData("anonymous_identity", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wifi-phase2">
                        {t("WiFi.Phase2Method")}
                      </Label>
                      <Input
                        id="wifi-phase2"
                        value={wifiData.phase2_method || ""}
                        onChange={(e) =>
                          updateWifiData(
                            "phase2_method",
                            e.target.value.toUpperCase()
                          )
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="foreground-color">
                {t("Labels.ForegroundColor")}
              </Label>
              <ColorInput
                id="foreground-color"
                format="hex"
                value={fgColor}
                onChange={setFgColor}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="background-color">
                {t("Labels.BackgroundColor")}
              </Label>
              <ColorInput
                id="background-color"
                format="hex"
                value={bgColor}
                onChange={setBgColor}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
