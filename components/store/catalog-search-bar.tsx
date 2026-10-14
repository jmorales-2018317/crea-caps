"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CatalogSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CatalogSearchBar({ value, onChange }: CatalogSearchBarProps) {
  const [input, setInput] = useState(value);
  const [trackedValue, setTrackedValue] = useState(value);

  if (value !== trackedValue) {
    setTrackedValue(value);
    setInput(value);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = input.trim();
      if (next !== value) {
        onChange(next);
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [input, onChange, value]);

  return (
    <div id="buscar" className="relative w-full max-w-xl scroll-mt-20">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Buscar por nombre…"
        aria-label="Buscar productos por nombre"
        className="h-10 pr-9 pl-9"
      />
      {input.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
          aria-label="Limpiar búsqueda"
          onClick={() => {
            setInput("");
            onChange("");
          }}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
