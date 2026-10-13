"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ColorFormDialog } from "@/components/dashboard/color-form-dialog";
import { DeleteColorDialog } from "@/components/dashboard/delete-color-dialog";
import {
  QueryEmptyState,
  QueryErrorState,
} from "@/components/dashboard/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  useColors,
  useCreateColor,
  useDeleteColor,
  useUpdateColor,
} from "@/hooks/use-colors";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import { toColorPayload } from "@/schemas/colors";
import type { Color } from "@/types/colors";

export function ColorsAdmin() {
  const { data, isPending, isError, refetch, isFetching } = useColors();
  const createMutation = useCreateColor();
  const updateMutation = useUpdateColor();
  const deleteMutation = useDeleteColor();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [deleting, setDeleting] = useState<Color | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Hex</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((color) => (
                  <TableRow key={color.id}>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${color.name}`}
                          onClick={() => {
                            setEditing(color);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Eliminar ${color.name}`}
                          onClick={() => setDeleting(color)}
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
          await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
