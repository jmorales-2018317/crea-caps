"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CategoryFormDialog } from "@/components/dashboard/category-form-dialog";
import { DeleteCategoryDialog } from "@/components/dashboard/delete-category-dialog";
import {
  QueryEmptyState,
  QueryErrorState,
} from "@/components/dashboard/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import { toCategoryPayload } from "@/schemas/categories";
import type { Category } from "@/types/categories";

export function CategoriesAdmin() {
  const { data, isPending, isError, refetch, isFetching } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
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

  if (isPending) {
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
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, slug o descripción…"
          className="sm:max-w-sm"
        />
      </div>

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
      ) : filtered.length === 0 ? (
        <QueryEmptyState
          title="Sin resultados"
          description="Ninguna categoría coincide con la búsqueda."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
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
                {filtered.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
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
                          variant={category.is_active ? "secondary" : "outline"}
                        >
                          {category.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${category.name}`}
                          onClick={() => {
                            setEditing(category);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Eliminar ${category.name}`}
                          onClick={() => setDeleting(category)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
          await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
