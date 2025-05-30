"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PropertyItem = { name: PropertyName; deprecated?: boolean };
type PropertyName = (typeof PROPERTIES)[number]["name"];

interface EventType {
  keydown: KeyboardEvent | null;
  keypress: KeyboardEvent | null;
  keyup: KeyboardEvent | null;
}

const PROPERTIES = [
  { name: "key" },
  { name: "code" },
  { name: "location" },
  { name: "repeat" },
  { name: "isComposing" },
  { name: "shiftKey" },
  { name: "ctrlKey" },
  { name: "altKey" },
  { name: "metaKey" },
  { name: "which", deprecated: true },
  { name: "keyCode", deprecated: true },
  { name: "charCode", deprecated: true },
] as const;

const EVENT_PROPERTIES: readonly PropertyItem[] = PROPERTIES;

const formatValue = (
  event: KeyboardEvent | null,
  name: PropertyName
): string => {
  if (!event) return "";
  const value = event[name];
  return String(value);
};

export default function KeyboardEventPage() {
  const t = useTranslations("KeyboardEventPage");
  const [events, setEvents] = useState<EventType>({
    keydown: null,
    keypress: null,
    keyup: null,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // clear keyup and keypress event
      setEvents((prev) => ({
        ...prev,
        keydown: e,
        keypress: null,
        keyup: null,
      }));
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      setEvents((prev) => ({ ...prev, keypress: e }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setEvents((prev) => ({ ...prev, keyup: e }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keypress", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keypress", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
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
        <Textarea className="h-16" placeholder={t("Placeholders.Input")} />

        <Table className="min-w-150 table-fixed font-mono">
          <TableHeader>
            <TableRow>
              <TableHead>KeyboardEvent</TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>keydown</span>
                  </TooltipTrigger>
                  <TooltipContent>{t("Tooltips.keydown")}</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="line-through">keypress</span>
                  </TooltipTrigger>
                  <TooltipContent>{t("Tooltips.keypress")}</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>keyup</span>
                  </TooltipTrigger>
                  <TooltipContent>{t("Tooltips.keyup")}</TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EVENT_PROPERTIES.map((prop) => (
              <TableRow key={prop.name}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "font-medium",
                          prop.deprecated && "line-through"
                        )}
                      >{`e.${prop.name}`}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t(`Tooltips.${prop.name}`)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>{formatValue(events.keydown, prop.name)}</TableCell>
                <TableCell>{formatValue(events.keypress, prop.name)}</TableCell>
                <TableCell>{formatValue(events.keyup, prop.name)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
