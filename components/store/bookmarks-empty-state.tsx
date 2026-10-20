"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookmarksEmptyState() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-divider bg-card/40 px-5 py-10 sm:flex-row sm:items-center">
      <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Bookmark className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium text-text-strong">
          No tienes productos guardados todavía.
        </p>
        <p className="text-sm text-text-secondary">
          Guarda gorras desde el catálogo o la ficha de producto para verlas
          aquí.
        </p>
      </div>
      <Button
        size="lg"
        nativeButton={false}
        className="h-11 shrink-0 rounded-xl px-5"
        render={<Link href="/catalogo" />}
      >
        Explorar catálogo
      </Button>
    </div>
  );
}
