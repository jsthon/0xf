"use client";

import { useCallback, useMemo, useState } from "react";
import { format, formatISO9075 } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { plainTypingProps } from "@/lib/props/typing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimeInput } from "@/components/time-input";

// DateTime picker component props
interface DateTimePickerProps {
  id?: string;
  className?: string;
  value?: Date;
  disabled?: boolean;
  onChange?: (date: Date | undefined) => void;
}

export function DateTimePicker({
  className,
  value,
  disabled,
  onChange,
  ...props
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(() =>
    value ? formatISO9075(value) : ""
  );
  const [prevValue, setPrevValue] = useState(value);

  const locale = useLocale();
  const t = useTranslations("DateTimePicker");

  // sync input text when value prop changes (compare by time value, not reference)
  if (value?.getTime() !== prevValue?.getTime()) {
    setPrevValue(value);
    setInputText(value ? formatISO9075(value) : "");
  }

  // computed time value for TimeInput
  const timeValue = useMemo(
    () => (value ? format(value, "HH:mm:ss") : "00:00:00"),
    [value]
  );

  // merge date and time into a new Date object
  const mergeDateTime = useCallback((date: Date | undefined, time: string) => {
    if (!date) return undefined;

    const newDateTime = new Date(date);
    const [hours = 0, minutes = 0, seconds = 0] = time.split(":").map(Number);
    // clear milliseconds to avoid precision issues
    newDateTime.setHours(hours, minutes, seconds, 0);
    return newDateTime;
  }, []);

  // handle date and time change
  const handleDateTimeChange = useCallback(
    (date?: Date, time: string = timeValue) => {
      onChange?.(mergeDateTime(date, time));
    },
    [timeValue, mergeDateTime, onChange]
  );

  // handle input blur (validate and update or restore)
  const handleInputBlur = useCallback(() => {
    const date = new Date(inputText);

    // check if the date is valid
    if (!isNaN(date.getTime())) {
      // check if the date is actually changed
      if (!value || date.getTime() !== value.getTime()) {
        onChange?.(date);
      }
    } else {
      // if invalid, restore to previous valid value
      setInputText(value ? formatISO9075(value) : "");
    }
  }, [inputText, value, onChange]);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-foreground hover:bg-accent hover:text-accent-foreground absolute top-0 bottom-0 left-1 my-auto size-7 rounded-sm"
            disabled={disabled}
          >
            <CalendarIcon />
            <span className="sr-only">{t("SelectDate")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="start"
          sideOffset={10}
        >
          <div className="flex flex-col">
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
              startMonth={new Date(1900, 0)}
              endMonth={new Date(2100, 11)}
              onSelect={(date) => handleDateTimeChange(date)}
              formatters={{
                formatMonthDropdown: (date) =>
                  date.toLocaleString(locale, { month: "short" }),
                formatWeekdayName: (date) =>
                  date.toLocaleString(locale, { weekday: "narrow" }),
              }}
            />
            <div className="flex justify-center border-t p-3">
              <TimeInput
                value={timeValue}
                onChange={(time) => handleDateTimeChange(value, time)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input
        className={cn("pl-9", className)}
        value={inputText}
        disabled={disabled}
        onChange={(e) => setInputText(e.target.value)}
        onBlur={handleInputBlur}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        {...plainTypingProps}
        {...props}
      />
    </div>
  );
}
