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
};

export function FormSelect({
  name,
  options,
  defaultValue = "",
  placeholder = "Select…",
  disabled = false,
  className,
}: Props) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={className}>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={setValue} disabled={disabled}>
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder={placeholder} />
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
