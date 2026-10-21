"use client";

import { useId } from "react";
import { Slider } from "@/components/ui/slider";
import {
  LOGO_SIZE_PX_MAX,
  LOGO_SIZE_PX_MIN,
} from "@/types/personalization";

type PersonalizationLogoSizeControlProps = {
  value: number;
  onChange: (sizePx: number) => void;
};

export function PersonalizationLogoSizeControl({
  value,
  onChange,
}: PersonalizationLogoSizeControlProps) {
  const labelId = useId();
  const valueId = `${labelId}-value`;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p id={labelId} className="text-sm font-medium text-text-strong">
          Tamaño del logo
        </p>
        <p
          id={valueId}
          className="text-sm tabular-nums text-text-secondary"
          aria-live="polite"
        >
          {value} px
        </p>
      </div>
      <Slider
        min={LOGO_SIZE_PX_MIN}
        max={LOGO_SIZE_PX_MAX}
        step={1}
        value={[value]}
        aria-labelledby={labelId}
        aria-describedby={valueId}
        aria-valuetext={`${value} píxeles`}
        onValueChange={(next) => {
          const sizePx = Array.isArray(next) ? next[0] : next;
          if (typeof sizePx === "number") {
            onChange(sizePx);
          }
        }}
      />
    </div>
  );
}
