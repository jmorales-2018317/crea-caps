"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ColorFormDialog } from "@/components/dashboard/color-form-dialog";
import { DeleteColorDialog } from "@/components/dashboard/delete-color-dialog";
import {
  QueryEmptyState,
  QueryErrorState,
} from "@/components/dashboard/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useColors,
  useCreateColor,
  useDeleteColor,
  useDeleteColors,
  useUpdateColor,
  useUpdateColorsActive,
} from "@/hooks/use-colors";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import { toColorPayload } from "@/schemas/colors";
import type { Color } from "@/types/colors";

const PAGE_SIZE = 10;

export function ColorsAdmin() {
  const { data, isPending, isError, refetch, isFetching } = useColors();
  const createMutation = useCreateColor();
  const updateMutation = useUpdateColor();
  const updateActiveMutation = useUpdateColorsActive();
  const deleteMutation = useDeleteColor();
  const deleteColorsMutation = useDeleteColors();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [deleting, setDeleting] = useState<Color | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [search, page]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().replace(/^#/, "");
    if (!query) {
      return data ?? [];
    }
    return (data ?? []).filter((color) => {
      const name = color.name.toLowerCase();
      const hex = color.hex_code.toLowerCase().replace(/^#/, "");
      return name.includes(query) || hex.includes(query);
    });
  }, [data, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const pageIds = useMemo(() => items.map((item) => item.id), [items]);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
  const allPageSelected =
    pageIds.length > 0 && selectedOnPage === pageIds.length;
  const somePageSelected = selectedOnPage > 0 && !allPageSelected;
  const selectedCount = selectedIds.size;
  const selectedIdList = useMemo(() => Array.from(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );
  const canBulkActivate = selectedItems.some((item) => !item.is_active);
  const canBulkDeactivate = selectedItems.some((item) => item.is_active);
  const bulkBusy =
    updateActiveMutation.isPending || deleteColorsMutation.isPending;

  function toggleAllPageRows(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        for (const id of pageIds) {
          next.add(id);
        }
      } else {
        for (const id of pageIds) {
          next.delete(id);
        }
      }
      return next;
    });
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleBulkActiveChange(isActive: boolean) {
    const ids = selectedItems
      .filter((item) => item.is_active !== isActive)
      .map((item) => item.id);
    if (ids.length === 0) {
      return;
    }
    setActionError(null);
    try {
      await updateActiveMutation.mutateAsync({
        ids,
        isActive,
      });
      clearSelection();
    } catch (error) {
      setActionError(getSupabaseErrorMessage(error, "colors"));
    }
  }

  if (isPending && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        title="No se pudieron cargar los colores"
        message="Hubo un problema al consultar Supabase."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Colores</h1>
          <p className="text-sm text-muted-foreground">
            Paleta reutilizable del catálogo.{" "}
            {isFetching ? "Actualizando…" : null}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          Nuevo color
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por nombre o hex…"
          className="sm:max-w-sm"
        />
      </div>

      {selectedCount > 0 ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          role="region"
          aria-label="Acciones para colores seleccionados"
        >
          <p className="text-sm font-medium">
            {selectedCount} seleccionado{selectedCount === 1 ? "" : "s"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {canBulkActivate ? (
              <Button
                variant="outline"
                size="sm"
                disabled={bulkBusy}
                onClick={() => {
                  void handleBulkActiveChange(true);
                }}
              >
                <Eye data-icon="inline-start" />
                Activar
              </Button>
            ) : null}
            {canBulkDeactivate ? (
              <Button
                variant="outline"
                size="sm"
                disabled={bulkBusy}
                onClick={() => {
                  void handleBulkActiveChange(false);
                }}
              >
                <EyeOff data-icon="inline-start" />
                Desactivar
              </Button>
            ) : null}
            <Button
              variant="destructive"
              size="sm"
              disabled={bulkBusy}
              onClick={() => setBulkDeleting(true)}
            >
              <Trash2 data-icon="inline-start" />
              Eliminar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={bulkBusy}
              onClick={clearSelection}
            >
              <X data-icon="inline-start" />
              Limpiar
            </Button>
          </div>
        </div>
      ) : null}

      {actionError ? (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}

      {(data?.length ?? 0) === 0 ? (
        <QueryEmptyState
          title="No hay colores"
          description="Crea el primer color para usarlo en productos."
        />
      ) : total === 0 ? (
        <QueryEmptyState
          title="Sin resultados"
          description="Ningún color coincide con la búsqueda."
        />
      ) : (
        <Card className="py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allPageSelected}
                      indeterminate={somePageSelected}
                      onCheckedChange={(checked) => {
                        toggleAllPageRows(checked);
                      }}
                      aria-label="Seleccionar todos los colores de esta página"
                    />
                  </TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Hex</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((color) => {
                  const isSelected = selectedIds.has(color.id);
                  return (
                    <TableRow
                      key={color.id}
                      data-state={isSelected ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            toggleRow(color.id, checked);
                          }}
                          aria-label={`Seleccionar ${color.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          className="inline-block size-7 rounded-md border border-border shadow-sm"
                          style={{ backgroundColor: color.hex_code }}
                          title={color.hex_code}
                          aria-hidden
                        />
                      </TableCell>
                      <TableCell className="font-medium">{color.name}</TableCell>
                      <TableCell className="font-mono text-xs uppercase">
                        {color.hex_code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={color.is_active}
                            aria-label={
                              color.is_active
                                ? "Desactivar color"
                                : "Activar color"
                            }
                            onCheckedChange={async (checked) => {
                              setActionError(null);
                              try {
                                await updateMutation.mutateAsync({
                                  id: color.id,
                                  input: { is_active: checked },
                                });
                              } catch (error) {
                                setActionError(
                                  getSupabaseErrorMessage(error, "colors"),
                                );
                              }
                            }}
                          />
                          <Badge
                            variant={color.is_active ? "secondary" : "outline"}
                          >
                            {color.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider delay={300}>
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Editar ${color.name}`}
                                    onClick={() => {
                                      setEditing(color);
                                      setFormOpen(true);
                                    }}
                                  />
                                }
                              >
                                <Pencil />
                              </TooltipTrigger>
                              <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Eliminar ${color.name}`}
                                    onClick={() => setDeleting(color)}
                                  />
                                }
                              >
                                <Trash2 />
                              </TooltipTrigger>
                              <TooltipContent>Eliminar</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {total > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex-1 text-sm text-muted-foreground">
            Página {safePage} de {totalPages} · {total} color
            {total === 1 ? "" : "es"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft data-icon="inline-start" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Siguiente
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}

      <ColorFormDialog
        open={formOpen}
        color={editing}
        onOpenChange={setFormOpen}
        onSubmit={async (values) => {
          const payload = toColorPayload(values);
          if (editing) {
            await updateMutation.mutateAsync({
              id: editing.id,
              input: payload,
            });
            return;
          }
          await createMutation.mutateAsync(payload);
        }}
      />

      <DeleteColorDialog
        color={deleting}
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
        onConfirm={async () => {
          if (!deleting) {
            return;
          }
          setActionError(null);
          await deleteMutation.mutateAsync(deleting.id);
        }}
      />

      <DeleteColorDialog
        count={selectedCount}
        open={bulkDeleting}
        onOpenChange={setBulkDeleting}
        onConfirm={async () => {
          if (selectedIdList.length === 0) {
            return;
          }
          setActionError(null);
          await deleteColorsMutation.mutateAsync(selectedIdList);
          clearSelection();
        }}
      />
    </div>
  );
}
