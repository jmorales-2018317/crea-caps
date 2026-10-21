"use client";

import { useRef } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  serializeDesign,
  type CapPartColors,
} from "@/types/personalization";

type ShareDesignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partColors: CapPartColors;
  logoSizePx: number;
};

export function ShareDesignDialog({
  open,
  onOpenChange,
  partColors,
  logoSizePx,
}: ShareDesignDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const json = serializeDesign(partColors, logoSizePx);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json);
      toastSuccess("Diseño copiado");
    } catch {
      const textarea = textareaRef.current;
      if (!textarea) {
        toastError("No se pudo copiar. Selecciona el texto manualmente.");
        return;
      }
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      if (copied) {
        toastSuccess("Diseño copiado");
        return;
      }
      toastError("No se pudo copiar. Selecciona el texto manualmente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Compartir diseño</DialogTitle>
          <DialogDescription>
            Copia los colores de cada pieza y el tamaño del logo en píxeles. Es
            un diseño local: no se guarda en la tienda.
          </DialogDescription>
        </DialogHeader>
        <textarea
          ref={textareaRef}
          readOnly
          value={json}
          aria-label="Configuración del diseño en JSON"
          className="field-sizing-content max-h-64 min-h-40 w-full resize-none rounded-lg border border-border bg-muted px-2.5 py-2 font-mono text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          onFocus={(event) => event.currentTarget.select()}
        />
        <DialogFooter>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => {
              void copyJson();
            }}
          >
            <Copy className="size-3.5" aria-hidden="true" />
            Copiar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
