"use client";

import { useState } from "react";

type Props = {
  name: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
};

/** Checkbox that always submits an explicit true/false value (works in server actions). */
export function FormCheckbox({
  name,
  defaultChecked = false,
  disabled = false,
  className,
  onCheckedChange,
}: Props) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <>
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          setChecked(e.target.checked);
          onCheckedChange?.(e.target.checked);
        }}
        className={className}
      />
    </>
  );
}
