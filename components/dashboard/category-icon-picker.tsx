"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Search, X } from "lucide-react";
import { CategoryLucideIcon } from "@/components/shared/category-lucide-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_CATEGORY_ICON,
  filterLucideIconNames,
  formatLucideIconLabel,
} from "@/lib/category-icons";
import { cn } from "cn";

const BATCH_SIZE = 96;
const SCROLL_LOAD_THRESHOLD_PX = 160;

type CategoryIconPickerProps = {
  id?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

export function CategoryIconPicker({
  id,
  value,
  onChange,
  disabled = false,
  "aria-invalid": ariaInvalid,
}: CategoryIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const deferredQuery = useDeferredValue(query);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [listNode, setListNode] = useState<HTMLDivElement | null>(null);

  const matched = useMemo(
    () => filterLucideIconNames(deferredQuery),
    [deferredQuery],
  );

  const visibleIcons = useMemo(
    () => matched.slice(0, visibleCount),
    [matched, visibleCount],
  );

  const hasMore = visibleCount < matched.length;

  const loadMore = () => {
    setVisibleCount((count) => Math.min(count + BATCH_SIZE, matched.length));
  };

  const setListRef = useCallback((node: HTMLDivElement | null) => {
    listRef.current = node;
    setListNode((prev) => (prev === node ? prev : node));
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [deferredQuery]);

  // Carga el siguiente lote al acercarse al final, o si el lote actual
  // no llena el viewport (sin depender de IntersectionObserver).
  useEffect(() => {
    if (!open || !listNode) {
      return;
    }

    const maybeLoadMore = () => {
      if (visibleCount >= matched.length) {
        return;
      }

      const distanceToBottom =
        listNode.scrollHeight - listNode.scrollTop - listNode.clientHeight;
      const doesNotFillViewport =
        listNode.clientHeight > 0 &&
        listNode.scrollHeight <= listNode.clientHeight + 1;

      if (doesNotFillViewport || distanceToBottom < SCROLL_LOAD_THRESHOLD_PX) {
        setVisibleCount((count) =>
          Math.min(count + BATCH_SIZE, matched.length),
        );
      }
    };

    const frame = requestAnimationFrame(maybeLoadMore);
    listNode.addEventListener("scroll", maybeLoadMore, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      listNode.removeEventListener("scroll", maybeLoadMore);
    };
  }, [open, listNode, visibleCount, matched.length]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setQuery("");
    setVisibleCount(BATCH_SIZE);
  };

  const handleSelect = (name: string) => {
    onChange(name);
    handleOpenChange(false);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <CategoryLucideIcon
            name={value}
            className="size-4"
            fallbackToDefault
          />
        </span>
        <div className="min-w-0 flex-1">
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="h-8 w-full justify-start gap-2 px-2.5 font-normal"
            onClick={() => handleOpenChange(true)}
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {value
                ? formatLucideIconLabel(value)
                : formatLucideIconLabel(DEFAULT_CATEGORY_ICON)}
            </span>
          </Button>
        </div>
        {value && value !== DEFAULT_CATEGORY_ICON ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label="Restablecer icono por defecto"
            onClick={() => onChange(DEFAULT_CATEGORY_ICON)}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Busca un icono por diseño o por nombre. Si no eliges uno, se usará "tag" por defecto
      </p>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="z-[60] flex h-[min(85vh,40rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-3 overflow-hidden sm:max-w-3xl"
          overlayClassName="z-[60]"
        >
          <DialogHeader>
            <DialogTitle>Elegir icono</DialogTitle>
            <DialogDescription>
              Desplázate por todos los iconos de Lucide o filtra por nombre.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(BATCH_SIZE);
              }}
              placeholder="Buscar icono…"
              className="sm:max-w-sm"
              aria-label="Buscar icono"
            />
            <p className="text-xs text-muted-foreground tabular-nums">
              {matched.length.toLocaleString("es-MX")} iconos
              {query.trim() ? " encontrados" : ""}
            </p>
          </div>

          <div
            ref={setListRef}
            className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2"
          >
            {matched.length === 0 ? (
              <p className="px-2 py-10 text-center text-sm text-muted-foreground">
                No se encontraron iconos.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                  {visibleIcons.map((name) => {
                    const selected = value === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => handleSelect(name)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg border border-transparent px-1.5 py-2 text-center transition-colors outline-none hover:border-border hover:bg-card focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                          selected &&
                            "border-primary bg-primary/10 text-foreground",
                        )}
                      >
                        <CategoryLucideIcon
                          name={name}
                          className="size-5 text-foreground"
                          fallbackToDefault={false}
                        />
                        <span className="w-full truncate font-mono text-[10px] leading-tight text-muted-foreground">
                          {name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {hasMore ? (
                  <div className="flex justify-center py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                    >
                      Cargar más
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
