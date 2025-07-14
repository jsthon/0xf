"use client";

import { useCallback, useEffect, useState } from "react";
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

// DateTime picker component props
interface DateTimePickerProps {
  id?: string;
  className?: string;
  value?: Date;
  disabled?: boolean;
  onChange?: (date: Date | undefined) => void;
}

// Combined date and time picker component
export function DateTimePicker({
  className,
  value,
  disabled,
  onChange,
  ...props
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [dateValue, setDateValue] = useState<Date | undefined>(value);
  const [inputValue, setInputValue] = useState<string>(
    value ? formatISO9075(value) : ""
  );

  const locale = useLocale();
  const t = useTranslations("DateTimePicker");

  // computed time value
  const timeValue = dateValue ? format(dateValue, "HH:mm:ss") : "00:00:00";

  // apply time to date object
  const applyTimeToDate = (date: Date, time: string): Date => {
    const newDateTime = new Date(date);
    const [hours = 0, minutes = 0, seconds = 0] = time.split(":").map(Number);
    // clear milliseconds to avoid precision issues
    newDateTime.setHours(hours, minutes, seconds, 0);
    return newDateTime;
  };

  // update date value and notify parent
  const updateDateTime = useCallback(
    (newDate: Date | undefined) => {
      setDateValue(newDate);
      setInputValue(newDate ? formatISO9075(newDate) : "");
      onChange?.(newDate);
    },
    [onChange]
  );

  // sync with external value changes
  useEffect(() => {
    setDateValue(value);
    setInputValue(value ? formatISO9075(value) : "");
  }, [value]);

  // handle date selection from calendar
  const handleDateSelect = useCallback(
    (newDate: Date | undefined) => {
      if (!newDate) {
        updateDateTime(undefined);
        return;
      }

      const newDateTime = applyTimeToDate(newDate, timeValue);
      updateDateTime(newDateTime);
    },
    [timeValue, updateDateTime]
  );

  // handle time input change
  const handleTimeChange = useCallback(
    (newTimeValue: string) => {
      if (dateValue) {
        const newDateTime = applyTimeToDate(dateValue, newTimeValue);
        updateDateTime(newDateTime);
      }
    },
    [dateValue, updateDateTime]
  );

  // handle input value change
  const handleInputChange = useCallback(
    (inputText: string) => {
      setInputValue(inputText);

      const parsedDate = new Date(inputText);
      if (!isNaN(parsedDate.getTime())) {
        updateDateTime(parsedDate);
      }
    },
    [updateDateTime]
  );

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
              selected={dateValue}
              captionLayout="dropdown"
              startMonth={new Date(1900, 0)}
              endMonth={new Date(2100, 11)}
              disabled={disabled}
              onSelect={handleDateSelect}
              formatters={{
                formatMonthDropdown: (date) =>
                  date.toLocaleString(locale, { month: "short" }),
                formatWeekdayName: (date) =>
                  date.toLocaleString(locale, { weekday: "narrow" }),
              }}
            />
            <div className="flex justify-center border-t p-3">
              <Input
                className="h-8 w-auto appearance-none font-medium [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                type="time"
                step="1"
                value={timeValue}
                disabled={disabled}
                onChange={(e) => handleTimeChange(e.target.value)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input
        className={cn("pl-9", className)}
        value={inputValue}
        disabled={disabled}
        onChange={(e) => handleInputChange(e.target.value)}
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
