"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatISO9075 } from "date-fns";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateTimePicker } from "@/components/datetime-picker";
import { NumberInput } from "@/components/number-input";

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
  days: 31,
  hours: 23,
  minutes: 59,
  seconds: 59,
} as const;

const AUTO_FORMAT_FIELDS = Object.keys(TIME_FIELD_MAX_VALUES) as Array<
  keyof typeof TIME_FIELD_MAX_VALUES
>;

// Number of decimal places for display
const DECIMAL_PLACES = 4;

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
  let tempDate = new Date(earlier);
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
    // recalculate from original date to avoid month overflow issues
    tempDate = new Date(earlier);
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
  return Number(
    (interval.totalMilliseconds / MS_PER_UNIT[format as UnitFormat]).toFixed(
      DECIMAL_PLACES
    )
  );
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
      if (interval[field] !== value) {
        onIntervalChange({ ...interval, [field]: value });
      }
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
          <NumberInput
            key={field}
            id={`${field}-input`}
            value={interval[field]}
            min={0}
            max={TIME_FIELD_MAX_VALUES[field]}
            suffix={t(`Units.${field}`, { count: interval[field] }).replace(
              String(interval[field]),
              ""
            )}
            onValueChange={(value) => updateTimeField(field, value ?? 0)}
            aria-label={t(`Formats.${field}`)}
          />
        ))}
      </div>
    );
  }

  // render single unit format
  const value = getIntervalSingleUnitValue(interval, format);
  return (
    <NumberInput
      key={format}
      id={`${format}-input`}
      className="w-fit"
      value={value}
      min={0}
      suffix={t(`Units.${format}`, { count: value }).replace(String(value), "")}
      decimalScale={DECIMAL_PLACES}
      onValueChange={(value) => handleSingleUnitChange(value ?? 0)}
      aria-label={t(`Formats.${format}`)}
    />
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

export default function TimeIntervalPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [startDateTime, setStartDateTime] = useState<Date | undefined>();
  const [endDateTime, setEndDateTime] = useState<Date | undefined>();
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("auto");

  // flag to prevent an infinite loop when the interval updates the date
  const [isIntervalUpdate, setIsIntervalUpdate] = useState(false);

  const t = useTranslations("TimeIntervalPage");

  // initialize with default dates (today and tomorrow)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    setStartDateTime(today);
    setEndDateTime(tomorrow);
    setIsMounted(true);
  }, []);

  // calculate interval between start and end dates
  const currentInterval = useMemo(() => {
    if (!startDateTime || !endDateTime) return null;
    return calculateTimeInterval(startDateTime, endDateTime);
  }, [startDateTime, endDateTime]);

  // reset the update flag after the interval recalculates
  useEffect(() => {
    if (isIntervalUpdate) {
      setIsIntervalUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInterval]);

  // calculate end date from start date and interval
  const calculateEndDateTime = useCallback(
    (
      baseStartDateTime: Date | undefined,
      interval: TimeInterval
    ): Date | undefined => {
      if (!baseStartDateTime) return;

      const result =
        displayFormat === "auto"
          ? addTimeInterval(baseStartDateTime, interval)
          : new Date(baseStartDateTime.getTime() + interval.totalMilliseconds);

      return isNaN(result.getTime()) ? undefined : result;
    },
    [displayFormat]
  );

  // update end date when interval changes
  const handleIntervalChange = useCallback(
    (newInterval: TimeInterval) => {
      const result = calculateEndDateTime(startDateTime, newInterval);

      if (
        result &&
        (!endDateTime || result.getTime() !== endDateTime.getTime())
      ) {
        setIsIntervalUpdate(true);
        setEndDateTime(result);
      }
    },
    [startDateTime, endDateTime, calculateEndDateTime]
  );

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="text-lg font-medium">{t("Labels.Format")}</div>
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
              <Label htmlFor="start-time" className="text-lg">
                {t("Labels.Start")}
              </Label>
              {startDateTime && (
                <Badge variant="outline">{formatISO9075(startDateTime)}</Badge>
              )}
            </div>
            <DateTimePicker
              id="start-time"
              value={startDateTime}
              onChange={setStartDateTime}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Label htmlFor="end-time" className="text-lg">
                {t("Labels.End")}
              </Label>
              {endDateTime && (
                <Badge variant="outline">{formatISO9075(endDateTime)}</Badge>
              )}
            </div>
            <DateTimePicker
              id="end-time"
              value={endDateTime}
              onChange={setEndDateTime}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-lg font-medium">{t("Labels.Interval")}</div>
            {currentInterval && (
              <Badge variant="outline">
                {formatIntervalBadge(currentInterval, displayFormat, t)}
              </Badge>
            )}
          </div>
          {currentInterval ? (
            <IntervalEditor
              key={
                isIntervalUpdate
                  ? null
                  : `${startDateTime?.getTime()}-${endDateTime?.getTime()}`
              }
              format={displayFormat}
              interval={currentInterval}
              onIntervalChange={handleIntervalChange}
              t={t}
            />
          ) : (
            isMounted && (
              <div className="text-muted-foreground">
                {t("Placeholders.Interval")}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
