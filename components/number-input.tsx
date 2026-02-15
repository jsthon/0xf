import { forwardRef, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  NumericFormat,
  NumericFormatProps,
  OnValueChange,
} from "react-number-format";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NumberInputProps extends Omit<
  NumericFormatProps,
  "value" | "onValueChange"
> {
  className?: string;
  defaultValue?: number;
  value?: number; // Controlled value from parent
  placeholder?: string;
  step?: number;
  thousandSeparator?: boolean | string;
  min?: number;
  max?: number;
  suffix?: string;
  prefix?: string;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
  onValueChange?: (value: number | undefined) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      className,
      defaultValue,
      value: controlledValue,
      placeholder,
      step = 1,
      thousandSeparator = false,
      min = -Infinity,
      max = Infinity,
      suffix,
      prefix,
      fixedDecimalScale = false,
      decimalScale = 0,
      onValueChange,
      ...props
    },
    ref
  ) {
    // Internal state for uncontrolled mode.
    const [internalValue, setInternalValue] = useState<number | undefined>(
      defaultValue
    );

    // The component's actual, valid value.
    const value = controlledValue ?? internalValue;

    // Visual state of the input, can be temporarily invalid or empty.
    const [inputValue, setInputValue] = useState<string | number | undefined>(
      value
    );

    // Sync visual input when controlled value changes.
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Commits a new value: clamps, updates state, and notifies parent.
    const updateValue = (newValue: number | undefined) => {
      const finalValue =
        newValue !== undefined
          ? Math.max(min, Math.min(max, newValue))
          : undefined;

      if (controlledValue === undefined) {
        setInternalValue(finalValue);
      }

      if (onValueChange && finalValue !== value) {
        onValueChange(finalValue);
      }
    };

    // Updates visual input and commits the value if it's valid.
    const handleInputChange: OnValueChange = (values) => {
      setInputValue(values.value);

      if (values.floatValue !== undefined) {
        if (values.floatValue >= min && values.floatValue <= max) {
          updateValue(values.floatValue);
        }
      }
    };

    // Reverts the input to the last valid value on blur.
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setInputValue(value);
      props.onBlur?.(event);
    };

    const handleIncrement = () => {
      const startValue = value ?? defaultValue ?? 0;
      const newValue = startValue + step;
      setInputValue(newValue);
      updateValue(newValue);
    };

    const handleDecrement = () => {
      const startValue = value ?? defaultValue ?? 0;
      const newValue = startValue - step;
      setInputValue(newValue);
      updateValue(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleDecrement();
      }
    };

    const t = useTranslations("NumberInput");

    return (
      <div className={cn("flex items-center", className)}>
        <NumericFormat
          className="relative z-10 [appearance:textfield] rounded-r-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          value={inputValue} // Input is controlled by the visual state.
          placeholder={placeholder}
          thousandSeparator={thousandSeparator}
          suffix={suffix}
          prefix={prefix}
          fixedDecimalScale={fixedDecimalScale}
          decimalScale={decimalScale}
          allowNegative={min < 0}
          onValueChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          customInput={Input}
          getInputRef={ref}
          autoComplete="off"
          {...props}
        />
        <div className="flex h-9 flex-col">
          <Button
            className="border-input w-5 flex-1 rounded-l-none rounded-br-none border-b border-l-0 focus-visible:relative"
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            disabled={value !== undefined && value >= max}
            tabIndex={-1}
            aria-label={t("Increment")}
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            className="border-input w-5 flex-1 rounded-l-none rounded-tr-none border-t-0 border-l-0 focus-visible:relative"
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={value !== undefined && value <= min}
            tabIndex={-1}
            aria-label={t("Decrement")}
          >
            <ChevronDown className="size-3.5" />
          </Button>
        </div>
      </div>
    );
  }
);
