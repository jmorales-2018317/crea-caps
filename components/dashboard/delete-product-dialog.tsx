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
import type { AdminProductListItem } from "@/types/products";

type DeleteProductDialogProps = {
  product?: AdminProductListItem | null;
  count?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

export function DeleteProductDialog({
  product = null,
  count,
  open,
  onOpenChange,
  onConfirm,
}: DeleteProductDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isBulk = typeof count === "number";
  const canConfirm = isBulk ? count > 0 : Boolean(product);

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
            {isBulk && count > 1 ? "Eliminar productos" : "Eliminar producto"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk ? (
              <>
                ¿Seguro que quieres eliminar{" "}
                <span className="font-medium text-foreground">
                  {count === 1 ? "1 producto" : `${count} productos`}
                </span>
                ? Se eliminarán también sus atributos físicos, vínculos de
                categorías y colores por parte. Esta acción no se puede
                deshacer.
              </>
            ) : (
              <>
                ¿Seguro que quieres eliminar{" "}
                <span className="font-medium text-foreground">
                  {product?.name ?? "este producto"}
                </span>
                ? Se eliminarán también sus atributos físicos, vínculos de
                categorías y colores por parte. Esta acción no se puede
                deshacer.
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
                setError(getSupabaseErrorMessage(err, "products"));
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
