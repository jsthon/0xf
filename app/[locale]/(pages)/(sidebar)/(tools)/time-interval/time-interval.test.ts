import { describe, expect, it } from "vitest";

import {
  addTimeInterval,
  calculateTimeInterval,
  type TimeInterval,
} from "./time-interval";

const toDate = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
) => new Date(year, month - 1, day, hour, minute, second, 0);

const expectLocalDateTime = (
  value: Date,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
) => {
  expect(value.getFullYear()).toBe(year);
  expect(value.getMonth()).toBe(month - 1);
  expect(value.getDate()).toBe(day);
  expect(value.getHours()).toBe(hour);
  expect(value.getMinutes()).toBe(minute);
  expect(value.getSeconds()).toBe(second);
};

describe("time-interval", () => {
  const expectReversible = (a: Date, b: Date) => {
    const [earlier, later] = a <= b ? [a, b] : [b, a];
    const interval = calculateTimeInterval(a, b);
    const rebuilt = addTimeInterval(earlier, interval);

    expect(rebuilt.getTime()).toBe(later.getTime());
    expect(interval.totalMilliseconds).toBe(
      later.getTime() - earlier.getTime()
    );
  };

  it("returns zeros for identical timestamps", () => {
    const now = toDate(2024, 6, 1, 12, 34, 56);
    expect(calculateTimeInterval(now, now)).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
    });
  });

  it("is symmetric for reversed inputs", () => {
    const a = toDate(2024, 3, 1, 12, 34, 56);
    const b = toDate(2025, 4, 5, 6, 7, 8);

    expect(calculateTimeInterval(a, b)).toEqual(calculateTimeInterval(b, a));
  });

  it("keeps leap-day edge case reversible", () => {
    const start = toDate(2024, 2, 29);
    const end = toDate(2025, 2, 28);
    const interval = calculateTimeInterval(start, end);

    expect(interval).toMatchObject({
      years: 1,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expectReversible(start, end);
  });

  it("handles century leap-year rules correctly (1900 vs 2000)", () => {
    const nonLeapStart = toDate(1900, 2, 28);
    const nonLeapEnd = toDate(1900, 3, 1);
    const nonLeapInterval = calculateTimeInterval(nonLeapStart, nonLeapEnd);
    expect(nonLeapInterval).toMatchObject({
      years: 0,
      months: 0,
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    const leapStart = toDate(2000, 2, 28);
    const leapEnd = toDate(2000, 3, 1);
    const leapInterval = calculateTimeInterval(leapStart, leapEnd);
    expect(leapInterval).toMatchObject({
      years: 0,
      months: 0,
      days: 2,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("handles month-end transition in leap year", () => {
    const start = toDate(2024, 1, 31);
    const end = toDate(2024, 2, 29);
    const interval = calculateTimeInterval(start, end);

    expect(interval).toMatchObject({
      years: 0,
      months: 1,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expectReversible(start, end);
  });

  it("handles month-end transition in non-leap year", () => {
    const start = toDate(2023, 1, 31);
    const end = toDate(2023, 2, 28);
    const interval = calculateTimeInterval(start, end);

    expect(interval).toMatchObject({
      years: 0,
      months: 1,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expectReversible(start, end);
  });

  it("treats full February spans as one month in leap and common years", () => {
    const leapStart = toDate(2024, 2, 1);
    const leapEnd = toDate(2024, 3, 1);
    expect(calculateTimeInterval(leapStart, leapEnd)).toMatchObject({
      years: 0,
      months: 1,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    const commonStart = toDate(2023, 2, 1);
    const commonEnd = toDate(2023, 3, 1);
    expect(calculateTimeInterval(commonStart, commonEnd)).toMatchObject({
      years: 0,
      months: 1,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("preserves pure month jumps", () => {
    const start = toDate(2024, 1, 31);
    const end = toDate(2024, 3, 31);

    expect(calculateTimeInterval(start, end)).toMatchObject({
      years: 0,
      months: 2,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expectReversible(start, end);
  });

  it("handles month boundary at 23:59:59 correctly", () => {
    const start = toDate(2024, 6, 30, 23, 59, 59);
    const end = toDate(2024, 7, 1, 0, 0, 0);
    const interval = calculateTimeInterval(start, end);

    expect(interval).toMatchObject({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    });
    expectReversible(start, end);
  });

  it("decomposes remaining day/hour/minute/second values", () => {
    const start = toDate(2024, 3, 1, 10, 0, 0);
    const end = toDate(2024, 3, 2, 12, 3, 4);

    expect(calculateTimeInterval(start, end)).toMatchObject({
      years: 0,
      months: 0,
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
    });
    expectReversible(start, end);
  });

  it("handles year component with remaining month/day/time", () => {
    const start = toDate(2023, 12, 31, 23, 59, 58);
    const end = toDate(2025, 2, 1, 0, 0, 0);
    const interval = calculateTimeInterval(start, end);

    expect(interval).toMatchObject({
      years: 1,
      months: 1,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 2,
    });
    expectReversible(start, end);
  });

  it("handles cross-year second-level boundary", () => {
    const start = toDate(2024, 12, 31, 23, 59, 59);
    const end = toDate(2025, 1, 1, 0, 0, 0);
    const interval = calculateTimeInterval(start, end);

    expect(interval).toMatchObject({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    });
    expectReversible(start, end);
  });

  it("is reversible for boundary-heavy samples", () => {
    const pairs: Array<[Date, Date]> = [
      [toDate(2024, 3, 10, 1, 59, 59), toDate(2024, 3, 10, 3, 0, 1)],
      [toDate(2024, 5, 1), toDate(2026, 8, 15, 9, 10, 11)],
      [toDate(2022, 2, 28), toDate(2024, 2, 29)],
    ];

    pairs.forEach(([start, end]) => {
      expectReversible(start, end);
    });
  });

  it("applies manual interval values exactly", () => {
    const base = toDate(2024, 1, 1);
    const interval: TimeInterval = {
      years: 1,
      months: 2,
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
      totalMilliseconds: 0,
    };

    const result = addTimeInterval(base, interval);
    expectLocalDateTime(result, 2025, 3, 4, 4, 5, 6);
  });

  it("applies +1 year from leap day to the expected calendar date", () => {
    const base = toDate(2024, 2, 29);
    const result = addTimeInterval(base, {
      years: 1,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
    });

    expectLocalDateTime(result, 2025, 2, 28, 0, 0, 0);
  });
});
