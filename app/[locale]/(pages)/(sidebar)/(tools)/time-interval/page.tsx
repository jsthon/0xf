"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatISO9075 } from "date-fns";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateTimePicker } from "@/components/datetime-picker";

// Display formats
const DISPLAY_FORMATS = [
  "auto",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds",
] as const;
type DisplayFormat = (typeof DISPLAY_FORMATS)[number];
type UnitFormat = Exclude<DisplayFormat, "auto">;

// Time interval with all units
interface TimeInterval {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
}

// Time units in milliseconds
const MS_PER_UNIT = {
  days: 24 * 60 * 60 * 1000,
  hours: 60 * 60 * 1000,
  minutes: 60 * 1000,
  seconds: 1000,
  milliseconds: 1,
} as const;

// Date input field configuration for auto format
const TIME_FIELD_MAX_VALUES = {
  years: undefined,
  months: 11,
  days: undefined,
  hours: 23,
  minutes: 59,
  seconds: 59,
} as const;

const AUTO_FORMAT_FIELDS = Object.keys(TIME_FIELD_MAX_VALUES) as Array<
  keyof typeof TIME_FIELD_MAX_VALUES
>;

// Calculate time interval between two dates
const calculateTimeInterval = (
  startDate: Date,
  endDate: Date
): TimeInterval => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // ensure calculation from earlier to later date
  const [earlier, later] = start <= end ? [start, end] : [end, start];

  // calculate years and months using calendar arithmetic
  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  // calculate remaining time after years/months
  const tempDate = new Date(earlier);
  tempDate.setFullYear(earlier.getFullYear() + years);
  tempDate.setMonth(earlier.getMonth() + months);

  // adjust if calculation went past target date
  if (tempDate > later) {
    if (months > 0) {
      months--;
    } else {
      years--;
      months = 11;
    }
    tempDate.setFullYear(earlier.getFullYear() + years);
    tempDate.setMonth(earlier.getMonth() + months);
  }

  // calculate remaining time components
  const remainingMs = later.getTime() - tempDate.getTime();
  const days = Math.floor(remainingMs / MS_PER_UNIT.days);
  const hours = Math.floor(
    (remainingMs % MS_PER_UNIT.days) / MS_PER_UNIT.hours
  );
  const minutes = Math.floor(
    (remainingMs % MS_PER_UNIT.hours) / MS_PER_UNIT.minutes
  );
  const seconds = Math.floor(
    (remainingMs % MS_PER_UNIT.minutes) / MS_PER_UNIT.seconds
  );

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalMilliseconds: later.getTime() - earlier.getTime(),
  };
};

// Add time interval to base date (only forward)
const addTimeInterval = (baseDate: Date, interval: TimeInterval): Date => {
  const result = new Date(baseDate);

  // add calendar units first (years, months)
  result.setFullYear(result.getFullYear() + interval.years);
  result.setMonth(result.getMonth() + interval.months);

  // add time units (days, hours, minutes, seconds)
  const timeMs =
    interval.days * MS_PER_UNIT.days +
    interval.hours * MS_PER_UNIT.hours +
    interval.minutes * MS_PER_UNIT.minutes +
    interval.seconds * MS_PER_UNIT.seconds;

  result.setTime(result.getTime() + timeMs);
  return result;
};

// Convert interval to display value for specific format
const getIntervalSingleUnitValue = (
  interval: TimeInterval,
  format: DisplayFormat
): number => {
  if (format === "auto") return 0;
  return interval.totalMilliseconds / MS_PER_UNIT[format as UnitFormat];
};

// Create interval from single unit value
const createIntervalFromSingleUnit = (
  value: number,
  format: UnitFormat
): TimeInterval => ({
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalMilliseconds: value * MS_PER_UNIT[format],
});

// Time interval editor component
interface IntervalEditorProps {
  format: DisplayFormat;
  interval: TimeInterval;
  onIntervalChange: (interval: TimeInterval) => void;
  t: ReturnType<typeof useTranslations>;
}

const IntervalEditor = ({
  format,
  interval,
  onIntervalChange,
  t,
}: IntervalEditorProps) => {
  // update specific time field
  const updateTimeField = useCallback(
    (field: keyof TimeInterval, value: number) => {
      onIntervalChange({ ...interval, [field]: value });
    },
    [interval, onIntervalChange]
  );

  // handle single unit format value change
  const handleSingleUnitChange = useCallback(
    (value: number) => {
      if (format === "auto") return;
      onIntervalChange(
        createIntervalFromSingleUnit(value, format as UnitFormat)
      );
    },
    [format, onIntervalChange]
  );

  // render auto format with all time fields
  if (format === "auto") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {AUTO_FORMAT_FIELDS.map((field) => (
          <div key={field} className="flex flex-1 flex-col gap-3">
            <Label htmlFor={`${field}-input`}>{t(`Formats.${field}`)}</Label>
            <Input
              id={`${field}-input`}
              type="number"
              min="0"
              max={TIME_FIELD_MAX_VALUES[field]}
              step={1}
              value={interval[field]}
              onChange={(e) =>
                updateTimeField(field, parseInt(e.target.value) || 0)
              }
            />
          </div>
        ))}
      </div>
    );
  }

  // render single unit format
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={`${format}-input`}>{t(`Formats.${format}`)}</Label>
      <Input
        id={`${format}-input`}
        type="number"
        min="0"
        step="1"
        value={getIntervalSingleUnitValue(interval, format)}
        onChange={(e) =>
          handleSingleUnitChange(parseFloat(e.target.value) || 0)
        }
      />
    </div>
  );
};

// Format interval for display badge
const formatIntervalBadge = (
  interval: TimeInterval,
  format: DisplayFormat,
  t: ReturnType<typeof useTranslations>
): string => {
  if (format === "auto") {
    const parts = (Object.keys(interval) as Array<keyof TimeInterval>)
      .filter((unit) => unit !== "totalMilliseconds" && interval[unit] > 0)
      .map((unit) => t(`Units.${unit}`, { count: interval[unit] }));
    return parts.join(" ") || t("Units.seconds", { count: 0 });
  }

  return t(`Units.${format}`, {
    count: getIntervalSingleUnitValue(interval, format),
  });
};

// Main time interval calculator page
export default function TimeIntervalPage() {
  const [startDateTime, setStartDateTime] = useState<Date | undefined>();
  const [endDateTime, setEndDateTime] = useState<Date | undefined>();
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("auto");

  const t = useTranslations("TimeIntervalPage");

  // initialize with default dates (today and tomorrow)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // clear time to midnight

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // clear time to midnight

    setStartDateTime(today);
    setEndDateTime(tomorrow);
  }, []);

  // calculate current time interval from datetime inputs
  const currentInterval = useMemo(() => {
    if (!startDateTime || !endDateTime) return null;
    return calculateTimeInterval(startDateTime, endDateTime);
  }, [startDateTime, endDateTime]);

  // calculate new end datetime when interval is modified
  const calculateEndDateTime = useCallback(
    (
      baseStartDateTime: Date | undefined,
      interval: TimeInterval
    ): Date | null => {
      if (!baseStartDateTime) return null;

      return displayFormat === "auto"
        ? addTimeInterval(baseStartDateTime, interval)
        : new Date(baseStartDateTime.getTime() + interval.totalMilliseconds);
    },
    [displayFormat]
  );

  // handle interval modification (updates end datetime)
  const handleIntervalChange = useCallback(
    (newInterval: TimeInterval) => {
      const result = calculateEndDateTime(startDateTime, newInterval);
      if (result) {
        setEndDateTime(result);
      }
    },
    [startDateTime, calculateEndDateTime]
  );

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
          <Label className="text-lg">{t("Labels.Format")}</Label>
          <RadioGroup
            className="flex flex-wrap gap-6"
            value={displayFormat}
            onValueChange={(value) => setDisplayFormat(value as DisplayFormat)}
          >
            {DISPLAY_FORMATS.map((format) => (
              <div key={format} className="flex items-center gap-2">
                <RadioGroupItem value={format} id={format} />
                <Label htmlFor={format}>{t(`Formats.${format}`)}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="grid flex-1 gap-6 md:gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Label className="text-lg">{t("Labels.Start")}</Label>
              {startDateTime && (
                <Badge variant="outline">{formatISO9075(startDateTime)}</Badge>
              )}
            </div>
            <DateTimePicker value={startDateTime} onChange={setStartDateTime} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Label className="text-lg">{t("Labels.End")}</Label>
              {endDateTime && (
                <Badge variant="outline">{formatISO9075(endDateTime)}</Badge>
              )}
            </div>
            <DateTimePicker value={endDateTime} onChange={setEndDateTime} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Label className="text-lg">{t("Labels.Interval")}</Label>
            {currentInterval && (
              <Badge variant="outline">
                {formatIntervalBadge(currentInterval, displayFormat, t)}
              </Badge>
            )}
          </div>
          {currentInterval ? (
            <IntervalEditor
              format={displayFormat}
              interval={currentInterval}
              onIntervalChange={handleIntervalChange}
              t={t}
            />
          ) : (
            <div className="text-muted-foreground">
              {t("Placeholders.Interval")}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
