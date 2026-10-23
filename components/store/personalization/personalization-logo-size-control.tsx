"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LOGO_SIZE_PX_MIN } from "@/types/personalization";

type PersonalizationLogoSizeControlProps = {
  value: number;
  max: number;
  label?: string;
  onChange: (sizePx: number) => void;
};

export function PersonalizationLogoSizeControl({
  value,
  max,
  label = "Tamaño del logo",
  onChange,
}: PersonalizationLogoSizeControlProps) {
  const labelId = useId();
  const inputId = `${labelId}-input`;
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? String(value);

  const commitDraft = (raw: string | null) => {
    const parsed = Number.parseInt(raw ?? "", 10);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    }
    setDraft(null);
  };

  return (
    <>
      <div className="min-w-0 space-y-1.5">
        <Label
          id={labelId}
          htmlFor={inputId}
          className="text-xs font-medium text-text-strong"
        >
          {label}
        </Label>
        <Input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={LOGO_SIZE_PX_MIN}
          max={max}
          step={1}
          value={display}
          className="tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            const parsed = Number.parseInt(next, 10);
            if (
              Number.isFinite(parsed) &&
              parsed >= LOGO_SIZE_PX_MIN &&
              parsed <= max
            ) {
              onChange(parsed);
            }
          }}
          onBlur={() => commitDraft(draft)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
        />
      </div>
      <div className="col-span-2 space-y-2 my-2">
        <Slider
          min={LOGO_SIZE_PX_MIN}
          max={max}
          step={1}
          value={[value]}
          aria-labelledby={labelId}
          aria-valuetext={`${value} píxeles`}
          onValueChange={(next) => {
            const sizePx = Array.isArray(next) ? next[0] : next;
            if (typeof sizePx === "number") {
              setDraft(null);
              onChange(sizePx);
            }
          }}
        />
      </div>
    </>
  );
}
