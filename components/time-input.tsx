"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { plainTypingProps } from "@/lib/props/typing";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  className?: string;
  value: string; // format: HH:mm:ss
  onChange: (value: string) => void;
}

type TimeField = "hours" | "minutes" | "seconds";

export function TimeInput({
  className,
  value,
  onChange,
  ...props
}: TimeInputProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  const refs = useMemo(
    () => ({
      hours: hoursRef,
      minutes: minutesRef,
      seconds: secondsRef,
    }),
    []
  );

  const fields = useMemo(
    () => ({
      hours: {
        max: 23,
        value: hours,
        setter: setHours,
        next: "minutes" as TimeField,
      },
      minutes: {
        max: 59,
        value: minutes,
        setter: setMinutes,
        next: "seconds" as TimeField,
      },
      seconds: {
        max: 59,
        value: seconds,
        setter: setSeconds,
        next: null,
      },
    }),
    [hours, minutes, seconds]
  );

  // parse incoming time value
  useEffect(() => {
    const [h = "00", m = "00", s = "00"] = value.split(":");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHours(h.padStart(2, "0"));
    setMinutes(m.padStart(2, "0"));
    setSeconds(s.padStart(2, "0"));
  }, [value]);

  // focus and select field
  const focusField = useCallback(
    (field: TimeField) => {
      const ref = refs[field].current;
      if (ref) {
        ref.focus();
        ref.select();
      }
    },
    [refs]
  );

  // adjust time value with step
  const adjustValue = useCallback(
    (current: string, step: number, max: number) => {
      const num = parseInt(current) || 0;
      let newValue = num + step;
      if (newValue < 0) newValue = max;
      else if (newValue > max) newValue = 0;
      return newValue.toString().padStart(2, "0");
    },
    []
  );

  // validate field value and notify parent
  const validateAndNotify = useCallback(
    (field: TimeField, value: string) => {
      const { max, setter } = fields[field];
      const validValue = Math.max(0, Math.min(max, parseInt(value) || 0))
        .toString()
        .padStart(2, "0");
      setter(validValue);

      const newValues = { hours, minutes, seconds, [field]: validValue };
      onChange(`${newValues.hours}:${newValues.minutes}:${newValues.seconds}`);
    },
    [hours, minutes, seconds, fields, onChange]
  );

  // handle field input change
  const handleChange = useCallback(
    (field: TimeField, newValue: string) => {
      const sanitized = newValue.replace(/\D/g, "").slice(0, 2);
      const { setter, next } = fields[field];

      // 2 digits entered, validate and notify parent
      if (sanitized.length === 2) {
        validateAndNotify(field, sanitized);

        // auto advance to next field if exists
        if (next) {
          setTimeout(() => focusField(next), 0);
        }
      } else {
        // partial input, just update display
        setter(sanitized);
      }
    },
    [fields, validateAndNotify, focusField]
  );

  // handle field blur (validation)
  const handleBlur = useCallback(
    (field: TimeField) => {
      validateAndNotify(field, fields[field].value);
    },
    [fields, validateAndNotify]
  );

  // handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, field: TimeField) => {
      const { max, value } = fields[field];

      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown": {
          e.preventDefault();
          const step = e.key === "ArrowUp" ? 1 : -1;
          const newValue = adjustValue(value, step, max);
          validateAndNotify(field, newValue);
          break;
        }
        case "ArrowLeft":
          e.preventDefault();
          if (field === "minutes") focusField("hours");
          else if (field === "seconds") focusField("minutes");
          break;
        case "ArrowRight":
          e.preventDefault();
          if (field === "hours") focusField("minutes");
          else if (field === "minutes") focusField("seconds");
          break;
      }
    },
    [fields, adjustValue, validateAndNotify, focusField]
  );

  // handle mouse interaction for focus and select
  const handleMouseInteraction = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.currentTarget.focus();
      e.currentTarget.select();
    },
    []
  );

  // render individual time field
  const renderField = (field: TimeField, placeholder: string) => (
    <input
      ref={refs[field]}
      type="text"
      className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-full w-6 bg-transparent text-center outline-none"
      value={fields[field].value}
      placeholder={placeholder}
      maxLength={2}
      onChange={(e) => handleChange(field, e.target.value)}
      onBlur={() => handleBlur(field)}
      onMouseDown={handleMouseInteraction}
      onClick={handleMouseInteraction}
      onKeyDown={(e) => handleKeyDown(e, field)}
      {...plainTypingProps}
    />
  );

  return (
    <div
      className={cn(
        "dark:bg-input/30 border-input flex h-8 rounded-md border bg-transparent px-2 text-base font-medium shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    >
      <div className="flex items-center">
        {renderField("hours", "00")}
        <span className="text-muted-foreground">:</span>
        {renderField("minutes", "00")}
        <span className="text-muted-foreground">:</span>
        {renderField("seconds", "00")}
      </div>
    </div>
  );
}
