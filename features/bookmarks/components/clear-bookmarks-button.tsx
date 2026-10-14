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
import { Button } from "@/components/ui/button";
import { useBookmarksStore } from "@/features/bookmarks/stores/bookmarks.store";
import { toastSuccess } from "@/lib/toast";

type ClearBookmarksButtonProps = {
  disabled?: boolean;
};

export function ClearBookmarksButton({
  disabled = false,
}: ClearBookmarksButtonProps) {
  const [open, setOpen] = useState(false);
  const clearBookmarks = useBookmarksStore((state) => state.clearBookmarks);
  const count = useBookmarksStore((state) => state.productIds.length);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || count === 0}
        onClick={() => setOpen(true)}
      >
        Quitar todos
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitar todos los guardados</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres quitar{" "}
              <span className="font-medium text-foreground">
                {count === 1 ? "1 producto" : `${count} productos`}
              </span>{" "}
              de tus guardados? Esta acción solo borra la lista local de este
              navegador; no elimina productos del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                clearBookmarks();
                setOpen(false);
                toastSuccess("Guardados vaciados");
              }}
            >
              Quitar todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
