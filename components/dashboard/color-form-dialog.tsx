"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import {
  colorFormSchema,
  type ColorFormValues,
} from "@/schemas/colors";
import type { Color } from "@/types/colors";

type ColorFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  color?: Color | null;
  onSubmit: (values: ColorFormValues) => Promise<void>;
};

function ColorFormFields({
  color,
  onSubmit,
  onCancel,
}: {
  color?: Color | null;
  onSubmit: (values: ColorFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const isEditing = Boolean(color);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: color
      ? {
          name: color.name,
          hex_code: color.hex_code,
          is_active: color.is_active,
        }
      : {
          name: "",
          hex_code: "#000000",
          is_active: true,
        },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(getSupabaseErrorMessage(error, "colors"));
    }
  });

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-2">
        <Label htmlFor="color-name">Nombre</Label>
        <Input
          id="color-name"
          autoFocus
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="color-hex">Color</Label>
        <Controller
          control={form.control}
          name="hex_code"
          render={({ field }) => (
            <ColorPicker
              id="color-hex"
              value={field.value}
              onChange={field.onChange}
              aria-invalid={Boolean(form.formState.errors.hex_code)}
            />
          )}
        />
        {form.formState.errors.hex_code ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.hex_code.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
        <div>
          <p className="text-sm font-medium">Activo</p>
          <p className="text-xs text-muted-foreground">
            Los colores inactivos no se muestran en la tienda.
          </p>
        </div>
        <Controller
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-label="Color activo"
            />
          )}
        />
      </div>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={form.formState.isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Guardando…"
            : isEditing
              ? "Guardar cambios"
              : "Crear color"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ColorFormDialog({
  open,
  onOpenChange,
  color,
  onSubmit,
}: ColorFormDialogProps) {
  const formKey = color?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{color ? "Editar color" : "Nuevo color"}</DialogTitle>
          <DialogDescription>
            {color
              ? "Actualiza el nombre o el código hexadecimal."
              : "Define un color reutilizable para el catálogo."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <ColorFormFields
            key={formKey}
            color={color}
            onCancel={() => onOpenChange(false)}
            onSubmit={async (values) => {
              await onSubmit(values);
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
