"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { timezones } from "@/lib/timezones";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimezoneSelectProps {
  className?: string;
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function TimezoneSelect({
  className,
  value,
  placeholder,
  onChange,
}: TimezoneSelectProps) {
  const [open, setOpen] = useState(false);

  const t = useTranslations("TimezoneSelect");

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn("justify-between", className)}
          variant="outline"
          role="combobox"
          aria-expanded={open}
        >
          <span>
            {value
              ? timezones.find((timezone) => timezone === value)
              : placeholder}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" collisionPadding={16}>
        <Command>
          <CommandInput placeholder={t("Placeholder")} className="h-9" />
          <CommandList>
            <CommandEmpty>{t("NoResults")}</CommandEmpty>
            <CommandGroup>
              {timezones.map((timezone) => (
                <CommandItem
                  key={timezone}
                  value={timezone}
                  onSelect={() => handleSelect(timezone)}
                >
                  {timezone}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === timezone ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
