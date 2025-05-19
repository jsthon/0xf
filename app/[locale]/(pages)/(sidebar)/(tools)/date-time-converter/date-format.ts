import { TZDate } from "@date-fns/tz";
import {
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isValid,
  parse,
  parseISO,
  type FormatRFC3339Options,
} from "date-fns";

export type DateFormatKey =
  | "Javascript"
  | "ISO8601"
  | "ISO9075"
  | "RFC3339"
  | "RFC7231"
  | "TimestampSeconds"
  | "TimestampMilliseconds";

export interface DateFormat {
  key: DateFormatKey;
  stringify: (date: Date, timezone?: string) => string;
  parse: (text: string) => Date;
  match: (text: string) => boolean;
}

function stringifyWithTimezone(
  date: Date,
  formatter: (date: Date, options?: FormatRFC3339Options) => string,
  timezone?: string,
  options?: FormatRFC3339Options
): string {
  return timezone
    ? formatter(new TZDate(date, timezone), options)
    : formatter(date, options);
}

export const dateFormats: DateFormat[] = [
  {
    key: "Javascript",
    stringify: (date, timezone) =>
      timezone ? new TZDate(date, timezone).toString() : date.toString(),
    parse: (text) => new Date(text),
    match: (text) => !isNaN(new Date(text).getTime()),
  },
  {
    key: "ISO8601",
    stringify: (date, timezone) =>
      stringifyWithTimezone(date, formatISO, timezone),
    parse: parseISO,
    match: (text) => isValid(parseISO(text)),
  },
  {
    key: "ISO9075",
    stringify: (date, timezone) =>
      stringifyWithTimezone(date, formatISO9075, timezone),
    parse: parseISO,
    match: (text) =>
      /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,6})?$/.test(
        text
      ),
  },
  {
    key: "RFC3339",
    stringify: (date, timezone) =>
      stringifyWithTimezone(date, formatRFC3339, timezone, {
        fractionDigits: 3,
      }),
    parse: (text) => new Date(text),
    match: (text) =>
      /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,9})?(([+-])([0-9]{2}):([0-9]{2})|Z)$/.test(
        text
      ),
  },
  {
    key: "RFC7231",
    stringify: (date, timezone) =>
      stringifyWithTimezone(date, formatRFC7231, timezone),
    parse: (text) => new Date(text),
    match: (text) =>
      isValid(parse(text, "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date())),
  },
  {
    key: "TimestampSeconds",
    stringify: (date) => String(getUnixTime(date)),
    parse: (text) => fromUnixTime(Number(text)),
    match: (text) => {
      const num = Number(text);
      // 1970-01-01 to 5138-11-16
      return /^\d{1,11}$/.test(text) && !isNaN(num) && num >= 0;
    },
  },
  {
    key: "TimestampMilliseconds",
    stringify: (date) => String(getTime(date)),
    parse: (text) => new Date(Number(text)),
    match: (text) => {
      const num = Number(text);
      // 1973-03-03 to 5138-11-16
      return /^\d{12,14}$/.test(text) && !isNaN(num) && num >= 0;
    },
  },
];
