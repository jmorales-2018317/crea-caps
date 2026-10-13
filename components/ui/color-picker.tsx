"use client";

import { cn } from "cn";
import { Input } from "@/components/ui/input";

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

type ColorPickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
};

function normalizeHex(raw: string): string {
  const trimmed = raw.trim();
  if (HEX_PATTERN.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return trimmed;
}

export function ColorPicker({
  id,
  value,
  onChange,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: ColorPickerProps) {
  const safeNativeValue = HEX_PATTERN.test(value) ? value : "#000000";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label
        className={cn(
          "relative size-9 shrink-0 overflow-hidden rounded-lg border border-input shadow-sm",
          disabled && "pointer-events-none opacity-50",
        )}
        style={{ backgroundColor: HEX_PATTERN.test(value) ? value : "#e5e5e5" }}
        title="Seleccionar color"
      >
        <span className="sr-only">Selector visual de color</span>
        <input
          type="color"
          value={safeNativeValue}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.target.value.toUpperCase());
          }}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        spellCheck={false}
        placeholder="#000000"
        className="font-mono uppercase"
        onChange={(event) => {
          const next = event.target.value;
          if (next === "" || next.startsWith("#")) {
            onChange(next);
            return;
          }
          onChange(`#${next}`);
        }}
        onBlur={() => {
          if (HEX_PATTERN.test(value)) {
            onChange(normalizeHex(value));
          }
        }}
      />
    </div>
  );
}
