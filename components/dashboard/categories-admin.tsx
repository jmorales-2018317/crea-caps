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
import { CategoryFormDialog } from "@/components/dashboard/category-form-dialog";
import { DeleteCategoryDialog } from "@/components/dashboard/delete-category-dialog";
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
  useCategories,
  useCreateCategory,
  useDeleteCategories,
  useDeleteCategory,
  useUpdateCategoriesActive,
  useUpdateCategory,
} from "@/hooks/use-categories";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import { toCategoryPayload } from "@/schemas/categories";
import type { Category } from "@/types/categories";

const PAGE_SIZE = 10;

export function CategoriesAdmin() {
  const { data, isPending, isError, refetch, isFetching } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const updateActiveMutation = useUpdateCategoriesActive();
  const deleteMutation = useDeleteCategory();
  const deleteCategoriesMutation = useDeleteCategories();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
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
    const query = search.toLowerCase();
    if (!query) {
      return data ?? [];
    }
    return (data ?? []).filter((category) => {
      const haystack = [
        category.name,
        category.slug,
        category.description ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
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
    updateActiveMutation.isPending || deleteCategoriesMutation.isPending;

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
      setActionError(getSupabaseErrorMessage(error, "categories"));
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
        title="No se pudieron cargar las categorías"
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
          <h1 className="text-lg font-semibold tracking-tight">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Organiza el catálogo. {isFetching ? "Actualizando…" : null}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          Nueva categoría
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por nombre, slug o descripción…"
          className="sm:max-w-sm"
        />
      </div>

      {selectedCount > 0 ? (
        <div
          className="flex flex-col gap-3 rounded-lg border bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          role="region"
          aria-label="Acciones para categorías seleccionadas"
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
          title="No hay categorías"
          description="Crea la primera categoría para organizar tus productos."
        />
      ) : total === 0 ? (
        <QueryEmptyState
          title="Sin resultados"
          description="Ninguna categoría coincide con la búsqueda."
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
                      aria-label="Seleccionar todas las categorías de esta página"
                    />
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Descripción
                  </TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((category) => {
                  const isSelected = selectedIds.has(category.id);
                  return (
                    <TableRow
                      key={category.id}
                      data-state={isSelected ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            toggleRow(category.id, checked);
                          }}
                          aria-label={`Seleccionar ${category.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {category.slug}
                      </TableCell>
                      <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                        {category.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={category.is_active}
                            aria-label={
                              category.is_active
                                ? "Desactivar categoría"
                                : "Activar categoría"
                            }
                            onCheckedChange={async (checked) => {
                              setActionError(null);
                              try {
                                await updateMutation.mutateAsync({
                                  id: category.id,
                                  input: { is_active: checked },
                                });
                              } catch (error) {
                                setActionError(
                                  getSupabaseErrorMessage(error, "categories"),
                                );
                              }
                            }}
                          />
                          <Badge
                            variant={
                              category.is_active ? "secondary" : "outline"
                            }
                          >
                            {category.is_active ? "Activa" : "Inactiva"}
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
                                    aria-label={`Editar ${category.name}`}
                                    onClick={() => {
                                      setEditing(category);
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
                                    aria-label={`Eliminar ${category.name}`}
                                    onClick={() => setDeleting(category)}
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
            Página {safePage} de {totalPages} · {total} categor
            {total === 1 ? "ía" : "ías"}
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

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onOpenChange={setFormOpen}
        onSubmit={async (values) => {
          const payload = toCategoryPayload(values);
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

      <DeleteCategoryDialog
        category={deleting}
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

      <DeleteCategoryDialog
        count={selectedCount}
        open={bulkDeleting}
        onOpenChange={setBulkDeleting}
        onConfirm={async () => {
          if (selectedIdList.length === 0) {
            return;
          }
          setActionError(null);
          await deleteCategoriesMutation.mutateAsync(selectedIdList);
          clearSelection();
        }}
      />
    </div>
  );
}
