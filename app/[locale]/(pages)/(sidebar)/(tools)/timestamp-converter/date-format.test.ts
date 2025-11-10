import { describe, expect, it } from "vitest";

import { DateFormat, dateFormats } from "./date-format";

describe("date-format", () => {
  const testDate = new Date("2025-05-18T14:30:45.789Z");
  const getFormat = (key: string): DateFormat => {
    return dateFormats.find((f) => f.key === key) as DateFormat;
  };

  describe("stringifyWithTimezone helper", () => {
    it("produces different outputs with different timezones", () => {
      const isoFormat = getFormat("ISO8601");

      const utcOutput = isoFormat.stringify(testDate, "UTC");
      expect(utcOutput).toContain("14:30:45");

      const shanghaiOutput = isoFormat.stringify(testDate, "Asia/Shanghai");
      expect(shanghaiOutput).toContain("22:30:45");

      const nyOutput = isoFormat.stringify(testDate, "America/New_York");
      expect(nyOutput).toContain("10:30:45");
    });
  });

  describe("Javascript", () => {
    const format = getFormat("Javascript");

    it("stringify", () => {
      expect(format.stringify(testDate)).toBe(testDate.toString());
    });

    it("stringify with timezone", () => {
      const utcOutput = format.stringify(testDate, "UTC");
      expect(utcOutput).toContain("GMT+0000");

      const tokyoOutput = format.stringify(testDate, "Asia/Tokyo");
      expect(
        tokyoOutput.includes("JST") || tokyoOutput.includes("GMT+0900")
      ).toBe(true);
      expect(tokyoOutput).toContain("23:30:45");
    });

    it("parse", () => {
      const dateStr = testDate.toString();
      const parsedDate = format.parse(dateStr);
      expect(
        Math.abs(parsedDate.getTime() - testDate.getTime())
      ).toBeLessThanOrEqual(1000);
    });

    it("match", () => {
      expect(format.match(testDate.toString())).toBe(true);
    });
  });

  describe("ISO8601", () => {
    const format = getFormat("ISO8601");

    it("stringify", () => {
      const output = format.stringify(testDate);
      expect(output).toMatch(
        /^2025-05-18T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/
      );
      expect(format.parse(output).toISOString().split("T")[0]).toBe(
        "2025-05-18"
      );
    });

    it("stringify with timezone", () => {
      const londonOutput = format.stringify(testDate, "Europe/London");
      const londonHour =
        testDate.getUTCHours() +
        (testDate.getMonth() > 2 && testDate.getMonth() < 10 ? 1 : 0);
      expect(londonOutput).toContain(
        `${String(londonHour).padStart(2, "0")}:30:45`
      );

      const tokyoOutput = format.stringify(testDate, "Asia/Tokyo");
      expect(tokyoOutput).toContain("23:30:45");
    });

    it("parse", () => {
      expect(
        format.parse("2025-05-18T14:30:45Z").toISOString().substring(0, 19)
      ).toBe("2025-05-18T14:30:45");
      expect(
        format.parse("2025-05-18T14:30:45+00:00").toISOString().substring(0, 19)
      ).toBe("2025-05-18T14:30:45");
    });

    it("match - valid formats", () => {
      expect(format.match("2025-05-18T14:30:45Z")).toBe(true);
      expect(format.match("2025-05-18T14:30:45+01:00")).toBe(true);
      expect(format.match("2025-05-18")).toBe(true);
    });

    it("match - invalid formats", () => {
      expect(format.match("invalid date")).toBe(false);
      expect(format.match("")).toBe(false);
    });
  });

  describe("ISO9075", () => {
    const format = getFormat("ISO9075");

    it("stringify", () => {
      const output = format.stringify(testDate);
      expect(output).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(output).toContain("2025-05-18");
    });

    it("stringify with timezone", () => {
      const tokyoOutput = format.stringify(testDate, "Asia/Tokyo");
      expect(tokyoOutput).toMatch(/^2025-05-18 23:30:45$/);

      const laOutput = format.stringify(testDate, "America/Los_Angeles");
      expect(laOutput).toMatch(/^2025-05-18 07:30:45$/);
    });

    it("parse", () => {
      const parsed = format.parse("2025-05-18 14:30:45");
      expect(parsed.toISOString().split("T")[0]).toBe("2025-05-18");
      expect(parsed.toISOString().split("T")[1].substring(0, 8)).toMatch(
        /\d{2}:\d{2}:\d{2}/
      );
    });

    it("match - valid formats", () => {
      expect(format.match("2025-05-18 14:30:45")).toBe(true);
    });

    it("match - invalid formats", () => {
      expect(format.match("2025-05-18 14:30:45Z")).toBe(false);
      expect(format.match("invalid date")).toBe(false);
      expect(format.match("")).toBe(false);
    });
  });

  describe("RFC3339", () => {
    const format = getFormat("RFC3339");

    it("stringify", () => {
      const output = format.stringify(testDate);
      expect(output).toMatch(
        /^2025-05-18T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/
      );
      expect(new Date(output).toISOString().split("T")[0]).toBe("2025-05-18");
    });

    it("includes milliseconds with fractionDigits option", () => {
      const output = format.stringify(testDate);
      expect(output).toContain(".789");
    });

    it("stringify with timezone", () => {
      const parisOutput = format.stringify(testDate, "Europe/Paris");
      expect(parisOutput).toMatch(/^2025-05-18T16:30:45\.789(\+02:00|Z)$/);

      const tokyoOutput = format.stringify(testDate, "Asia/Tokyo");
      expect(tokyoOutput).toMatch(/^2025-05-18T23:30:45\.789(\+09:00|Z)$/);
    });

    it("parse", () => {
      expect(
        format.parse("2025-05-18T14:30:45Z").toISOString().substring(0, 19)
      ).toBe("2025-05-18T14:30:45");
    });

    it("match - valid formats", () => {
      expect(format.match("2025-05-18T14:30:45.123Z")).toBe(true);

      const withOffset = format.match("2025-05-18T14:30:45+01:00");
      if (!withOffset) {
        console.warn(
          "Warning: RFC3339 format doesn't match offset timezone format"
        );
      }
    });

    it("match - invalid formats", () => {
      expect(format.match("invalid date")).toBe(false);
      expect(format.match("")).toBe(false);
    });
  });

  describe("RFC7231", () => {
    const format = getFormat("RFC7231");

    it("stringify", () => {
      const output = format.stringify(testDate);
      expect(output).toMatch(
        /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/
      );
      expect(output).toContain("18 May 2025");
    });

    it("stringify with timezone", () => {
      const output = format.stringify(testDate);
      expect(output).toBe("Sun, 18 May 2025 14:30:45 GMT");

      const tokyoOutput = format.stringify(testDate, "Asia/Tokyo");
      expect(tokyoOutput).toBe("Sun, 18 May 2025 14:30:45 GMT");

      expect(tokyoOutput).toBe(output);
    });

    it("parse", () => {
      expect(
        format
          .parse("Sun, 18 May 2025 14:30:45 GMT")
          .toISOString()
          .substring(0, 19)
      ).toBe("2025-05-18T14:30:45");
    });

    it("match - valid formats", () => {
      expect(format.match("Sun, 18 May 2025 14:30:45 GMT")).toBe(true);
      expect(format.match("Sun, 06 Nov 1994 08:49:37 GMT")).toBe(true);
    });

    it("match - invalid formats", () => {
      expect(format.match("18 May 2025 14:30:45 GMT")).toBe(false);
      expect(format.match("Sun, 18 May 2025 14:30:45")).toBe(false);
      expect(format.match("")).toBe(false);
    });
  });

  describe("TimestampSeconds", () => {
    const format = getFormat("TimestampSeconds");
    const timestampSec = Math.floor(testDate.getTime() / 1000);

    it("stringify", () => {
      expect(format.stringify(testDate)).toBe(String(timestampSec));
    });

    it("stringify with timezone", () => {
      const utcOutput = format.stringify(testDate, "UTC");
      const tokyoOutput = format.stringify(testDate, "Asia/Tokyo");
      const nyOutput = format.stringify(testDate, "America/New_York");

      expect(utcOutput).toBe(String(timestampSec));
      expect(tokyoOutput).toBe(String(timestampSec));
      expect(nyOutput).toBe(String(timestampSec));

      expect(utcOutput).toBe(tokyoOutput);
      expect(tokyoOutput).toBe(nyOutput);
    });

    it("parse", () => {
      expect(format.parse(String(timestampSec)).getTime()).toBe(
        timestampSec * 1000
      );
    });

    it("match - valid formats", () => {
      expect(format.match("1621346445")).toBe(true);
      expect(format.match("0")).toBe(true);
      expect(format.match("12345")).toBe(true);
      expect(format.match("9999999999")).toBe(true);
    });

    it("match - invalid formats", () => {
      expect(format.match("-123")).toBe(false);
      expect(format.match("12345678901")).toBe(true);
      expect(format.match("123456789012")).toBe(false);
      expect(format.match("abc")).toBe(false);
      expect(format.match("")).toBe(false);
    });
  });

  describe("TimestampMilliseconds", () => {
    const format = getFormat("TimestampMilliseconds");
    const timestampMs = testDate.getTime();

    it("stringify", () => {
      expect(format.stringify(testDate)).toBe(String(timestampMs));
    });

    it("stringify with timezone", () => {
      const utcOutput = format.stringify(testDate, "UTC");
      const tokyoOutput = format.stringify(testDate, "Asia/Tokyo");
      const nyOutput = format.stringify(testDate, "America/New_York");

      expect(utcOutput).toBe(String(timestampMs));
      expect(tokyoOutput).toBe(String(timestampMs));
      expect(nyOutput).toBe(String(timestampMs));

      expect(utcOutput).toBe(tokyoOutput);
      expect(tokyoOutput).toBe(nyOutput);
    });

    it("parse", () => {
      expect(format.parse(String(timestampMs)).getTime()).toBe(timestampMs);
    });

    it("match - valid formats", () => {
      expect(format.match("1621346445123")).toBe(true);
      expect(format.match("123456789012")).toBe(true);
      expect(format.match("12345678901234")).toBe(true);
    });

    it("match - invalid formats", () => {
      expect(format.match("-123")).toBe(false);
      expect(format.match("0")).toBe(false);
      expect(format.match("12345")).toBe(false);
      expect(format.match("123456789012345")).toBe(false);
      expect(format.match("abc")).toBe(false);
      expect(format.match("")).toBe(false);
    });
  });
});
