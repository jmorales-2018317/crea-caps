"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import {
  categoryFormSchema,
  slugifyCategoryName,
  type CategoryFormValues,
} from "@/schemas/categories";
import type { Category } from "@/types/categories";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

function CategoryFormFields({
  category,
  onSubmit,
  onCancel,
}: {
  category?: Category | null;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const isEditing = Boolean(category);
  const [formError, setFormError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(isEditing);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          is_active: category.is_active,
        }
      : {
          name: "",
          slug: "",
          description: "",
          is_active: true,
        },
  });

  const nameRegister = form.register("name");
  const slugRegister = form.register("slug");

  const handleSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(getSupabaseErrorMessage(error, "categories"));
    }
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        // Evita que el submit burbujee al formulario padre (p. ej. producto)
        // aunque el Dialog esté portaleado en el DOM.
        event.stopPropagation();
        void handleSubmit(event);
      }}
      noValidate
    >
      <div className="grid gap-2">
        <Label htmlFor="category-name">Nombre</Label>
        <Input
          id="category-name"
          autoFocus
          aria-invalid={Boolean(form.formState.errors.name)}
          {...nameRegister}
          onChange={(event) => {
            void nameRegister.onChange(event);
            if (!slugManual) {
              form.setValue("slug", slugifyCategoryName(event.target.value), {
                shouldValidate: form.formState.isSubmitted,
              });
            }
          }}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category-slug">Slug</Label>
        <Input
          id="category-slug"
          spellCheck={false}
          aria-invalid={Boolean(form.formState.errors.slug)}
          {...slugRegister}
          onChange={(event) => {
            setSlugManual(true);
            void slugRegister.onChange(event);
          }}
        />
        {form.formState.errors.slug ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.slug.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category-description">Descripción</Label>
        <Textarea
          id="category-description"
          rows={3}
          {...form.register("description")}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
        <div>
          <p className="text-sm font-medium">Activa</p>
          <p className="text-xs text-muted-foreground">
            Las categorías inactivas no se muestran en la tienda.
          </p>
        </div>
        <Controller
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-label="Categoría activa"
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
              : "Crear categoría"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
}: CategoryFormDialogProps) {
  const formKey = category?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Actualiza el nombre, slug o descripción."
              : "Crea una categoría para organizar el catálogo."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <CategoryFormFields
            key={formKey}
            category={category}
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
