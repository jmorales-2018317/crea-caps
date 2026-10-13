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
import type { Color } from "@/types/colors";

type DeleteColorDialogProps = {
  color?: Color | null;
  count?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

export function DeleteColorDialog({
  color = null,
  count,
  open,
  onOpenChange,
  onConfirm,
}: DeleteColorDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isBulk = typeof count === "number";
  const canConfirm = isBulk ? count > 0 : Boolean(color);

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
            {isBulk && count > 1 ? "Eliminar colores" : "Eliminar color"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk ? (
              <>
                ¿Seguro que quieres eliminar{" "}
                <span className="font-medium text-foreground">
                  {count === 1 ? "1 color" : `${count} colores`}
                </span>
                ? Esta acción no se puede deshacer. Si alguno está en uso en
                productos, la base de datos impedirá el borrado.
              </>
            ) : (
              <>
                ¿Seguro que quieres eliminar{" "}
                <span className="font-medium text-foreground">
                  {color?.name ?? "este color"}
                </span>
                ? Esta acción no se puede deshacer. Si está en uso en productos,
                la base de datos impedirá el borrado.
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
                setError(getSupabaseErrorMessage(err, "colors"));
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
