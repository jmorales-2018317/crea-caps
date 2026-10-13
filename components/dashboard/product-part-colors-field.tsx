"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ColorFormDialog } from "@/components/dashboard/color-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateColor } from "@/hooks/use-colors";
import { toColorPayload } from "@/schemas/colors";
import {
  PRODUCT_PART_LABELS,
  resolvePartColor,
} from "@/schemas/products";
import type { Color } from "@/types/colors";
import type { ProductPart } from "@/types/products";
import { cn } from "cn";

type PartColors = Partial<Record<ProductPart, string | null | undefined>>;

type ProductPartColorsFieldProps = {
  parts: ProductPart[];
  colors: Color[];
  value: PartColors;
  onChange: (part: ProductPart, colorId: string | null) => void;
};

function ColorSwatch({
  hex,
  className,
}: {
  hex: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-5 rounded-full border border-border",
        !hex &&
          "bg-[linear-gradient(45deg,var(--border)_25%,transparent_25%,transparent_75%,var(--border)_75%),linear-gradient(45deg,var(--border)_25%,transparent_25%,transparent_75%,var(--border)_75%)] bg-size-[8px_8px] bg-position-[0_0,4px_4px]",
        className,
      )}
      style={hex ? { backgroundColor: hex } : undefined}
      aria-hidden
    />
  );
}

export function ProductPartColorsField({
  parts,
  colors,
  value,
  onChange,
}: ProductPartColorsFieldProps) {
  const [activePartPreference, setActivePartPreference] =
    useState<ProductPart>("all");
  const [colorSearch, setColorSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const createMutation = useCreateColor();

  const activePart = parts.includes(activePartPreference)
    ? activePartPreference
    : (parts[0] ?? "all");

  const colorHexById = useMemo(
    () => Object.fromEntries(colors.map((color) => [color.id, color.hex_code])),
    [colors],
  );

  const colorNameById = useMemo(
    () => Object.fromEntries(colors.map((color) => [color.id, color.name])),
    [colors],
  );

  const filteredColors = useMemo(() => {
    const query = colorSearch.trim().toLowerCase();
    if (!query) {
      return colors;
    }
    return colors.filter((color) => {
      const haystack = `${color.name} ${color.hex_code}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [colorSearch, colors]);

  const selectedColorId = value[activePart] ?? null;
  const resolvedHex = resolvePartColor(activePart, value, colorHexById);
  const showAuto = activePart !== "all";

  const selectCreatedColor = (color: Color) => {
    if (!color.is_active) {
      return;
    }
    if (!value.all) {
      onChange("all", color.id);
    }
    onChange(activePart, color.id);
  };

  return (
    <div className="space-y-4">
      {colors.length === 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Crea colores primero</p>
            <p className="text-sm text-muted-foreground">
              Sin colores activos no se puede asignar ninguno a las partes. Las
              partes quedarán sin color hasta que crees al menos uno.
            </p>
          </div>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" />
            Nuevo color
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {parts.map((part) => {
              const partColorId = value[part] ?? null;
              const swatch = resolvePartColor(part, value, colorHexById);
              const isActive = part === activePart;
              return (
                <button
                  key={part}
                  type="button"
                  onClick={() => setActivePartPreference(part)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "border-foreground bg-muted"
                      : "border-border hover:bg-muted/60",
                  )}
                >
                  <ColorSwatch hex={swatch} />
                  <span className="whitespace-nowrap">
                    {PRODUCT_PART_LABELS[part]}
                  </span>
                  {!partColorId && part !== "all" ? (
                    <span className="text-[10px] text-muted-foreground">
                      auto
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-border p-3 sm:p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <ColorSwatch hex={resolvedHex} className="size-6" />
                <div>
                  <Label className="text-sm">
                    {PRODUCT_PART_LABELS[activePart]}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {selectedColorId
                      ? (colorNameById[selectedColorId] ?? resolvedHex)
                      : showAuto
                        ? "Auto (color general)"
                        : "Sin color"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={colorSearch}
                  onChange={(event) => setColorSearch(event.target.value)}
                  placeholder="Buscar color por nombre o hex…"
                  className="sm:max-w-xs"
                />
                <Button
                  type="button"
                  size="icon"
                  aria-label="Crear color"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2">
              {showAuto ? (
                <button
                  type="button"
                  onClick={() => onChange(activePart, null)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-lg border text-[10px] leading-tight text-muted-foreground transition-colors hover:bg-muted",
                    selectedColorId === null
                      ? "border-foreground ring-2 ring-foreground/20"
                      : "border-dashed border-border",
                  )}
                  title="Auto (color general)"
                  aria-label="Auto (color general)"
                  aria-pressed={selectedColorId === null}
                >
                  Auto
                </button>
              ) : null}

              {filteredColors.map((color) => {
                const selected = selectedColorId === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => onChange(activePart, color.id)}
                    className={cn(
                      "aspect-square rounded-lg border border-border transition-transform hover:scale-[1.04]",
                      selected &&
                        "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                    )}
                    style={{ backgroundColor: color.hex_code }}
                    title={`${color.name} (${color.hex_code})`}
                    aria-label={color.name}
                    aria-pressed={selected}
                  />
                );
              })}
            </div>

            {filteredColors.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Ningún color coincide con la búsqueda.
              </p>
            ) : null}
          </div>
        </>
      )}

      <ColorFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (values) => {
          const created = await createMutation.mutateAsync(
            toColorPayload(values),
          );
          selectCreatedColor(created);
        }}
      />
    </div>
  );
}
