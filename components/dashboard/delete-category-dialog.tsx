"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import type { Category } from "@/types/categories";

type DeleteCategoryDialogProps = {
  category?: Category | null;
  count?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

export function DeleteCategoryDialog({
  category = null,
  count,
  open,
  onOpenChange,
  onConfirm,
}: DeleteCategoryDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isBulk = typeof count === "number";
  const canConfirm = isBulk ? count > 0 : Boolean(category);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setError(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBulk && count > 1
              ? "Eliminar categorías"
              : "Eliminar categoría"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk ? (
              <>
                ¿Seguro que quieres eliminar{" "}
                <span className="font-medium text-foreground">
                  {count === 1 ? "1 categoría" : `${count} categorías`}
                </span>
                ? Esta acción no se puede deshacer. Se quitarán de los productos
                asociados; los productos se conservan aunque queden sin
                categoría.
              </>
            ) : (
              <>
                ¿Seguro que quieres eliminar{" "}
                <span className="font-medium text-foreground">
                  {category?.name ?? "esta categoría"}
                </span>
                ? Esta acción no se puede deshacer. Se quitará de los productos
                asociados; los productos se conservan aunque queden sin
                categoría.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting || !canConfirm}
            onClick={async (event) => {
              event.preventDefault();
              if (!canConfirm) {
                return;
              }
              setIsDeleting(true);
              setError(null);
              try {
                await onConfirm();
                onOpenChange(false);
              } catch (err) {
                setError(getSupabaseErrorMessage(err, "categories"));
              } finally {
                setIsDeleting(false);
              }
            }}
          >
            {isDeleting
              ? "Eliminando…"
              : isBulk && count > 1
                ? `Eliminar ${count}`
                : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
