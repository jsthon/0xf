import { add, intervalToDuration } from "date-fns";

// Time interval with all units
export interface TimeInterval {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
}

// Time units in milliseconds
export const MS_PER_UNIT = {
  days: 24 * 60 * 60 * 1000,
  hours: 60 * 60 * 1000,
  minutes: 60 * 1000,
  seconds: 1000,
  milliseconds: 1,
} as const;

// Calculate time interval between two dates
export function calculateTimeInterval(
  startDate: Date,
  endDate: Date
): TimeInterval {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const [earlier, later] = start <= end ? [start, end] : [end, start];

  const duration = intervalToDuration({ start: earlier, end: later });
  const durationYears = duration.years ?? 0;
  const durationMonths = duration.months ?? 0;
  const totalMonths = durationYears * 12 + durationMonths;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const anchor = add(earlier, { years, months });
  const remainingMs = later.getTime() - anchor.getTime();
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
}

// Add a calendar interval to a base date.
export function addTimeInterval(baseDate: Date, interval: TimeInterval): Date {
  return add(new Date(baseDate), {
    years: interval.years,
    months: interval.months,
    days: interval.days,
    hours: interval.hours,
    minutes: interval.minutes,
    seconds: interval.seconds,
  });
}
