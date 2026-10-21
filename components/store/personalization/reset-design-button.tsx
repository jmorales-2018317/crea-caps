"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
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
import { usePersonalizationStore } from "@/hooks/use-personalization-store";
import { toastSuccess } from "@/lib/toast";
import {
  isDefaultPartColors,
  LOGO_SIZE_PX_DEFAULT,
} from "@/types/personalization";

type ResetDesignButtonProps = {
  hasLogo: boolean;
  onResetLogo: () => void;
};

export function ResetDesignButton({
  hasLogo,
  onResetLogo,
}: ResetDesignButtonProps) {
  const [open, setOpen] = useState(false);
  const partColors = usePersonalizationStore((state) => state.partColors);
  const logoSizePx = usePersonalizationStore((state) => state.logoSizePx);
  const resetDesign = usePersonalizationStore((state) => state.resetDesign);

  const isDefault =
    !hasLogo &&
    logoSizePx === LOGO_SIZE_PX_DEFAULT &&
    isDefaultPartColors(partColors);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full cursor-pointer"
        disabled={isDefault}
        title={
          isDefault
            ? "El diseño ya está en los valores iniciales"
            : "Quitar el logo y restaurar los colores"
        }
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Reiniciar diseño
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar diseño</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará el logo y los colores volverán a los valores iniciales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                onResetLogo();
                resetDesign();
                setOpen(false);
                toastSuccess("Diseño restablecido");
              }}
            >
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
