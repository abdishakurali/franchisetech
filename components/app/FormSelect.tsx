"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormSelectOption = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  options: FormSelectOption[];
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
};

export function FormSelect({
  name,
  options,
  defaultValue = "",
  placeholder = "Select…",
  disabled = false,
  className,
  onValueChange,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className={className} key={defaultValue}>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange?.(next);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
