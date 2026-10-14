"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Info,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { DeleteProductDialog } from "@/components/dashboard/delete-product-dialog";
import { getCatalogImagePublicUrl } from "@/lib/catalog-images";
import {
  QueryEmptyState,
  QueryErrorState,
} from "@/components/dashboard/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  useAdminProducts,
  useDeleteProduct,
  useDeleteProducts,
  useUpdateProductFeatured,
  useUpdateProductStatus,
  useUpdateProductsStatus,
} from "@/hooks/use-products";
import { formatGtq } from "@/lib/format-currency";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/schemas/products";
import type { AdminProductListItem, ProductStatus } from "@/types/products";

const PAGE_SIZE = 10;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function statusVariant(
  status: ProductStatus,
): "default" | "secondary" | "outline" {
  if (status === "published") {
    return "default";
  }
  if (status === "archived") {
    return "secondary";
  }
  return "outline";
}

function categoryLabels(product: AdminProductListItem) {
  return product.product_categories
    .map((row) =>
      row.categories
        ? { id: row.categories.id, name: row.categories.name }
        : null,
    )
    .filter((row): row is { id: string; name: string } => Boolean(row));
}

function primaryImageIndex(
  images: AdminProductListItem["product_images"],
): number {
  const primary = images.findIndex((image) => image.is_primary);
  return primary >= 0 ? primary : 0;
}

export function ProductsAdmin() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [deleting, setDeleting] = useState<AdminProductListItem | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [previewing, setPreviewing] = useState<AdminProductListItem | null>(
    null,
  );
  const [previewIndex, setPreviewIndex] = useState(0);
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
  }, [search, status, page]);

  const { data, isPending, isError, refetch, isFetching } = useAdminProducts({
    search,
    status,
    page,
    pageSize: PAGE_SIZE,
  });
  const updateStatusMutation = useUpdateProductStatus();
  const updateFeaturedMutation = useUpdateProductFeatured();
  const updateProductsStatusMutation = useUpdateProductsStatus();
  const deleteMutation = useDeleteProduct();
  const deleteProductsMutation = useDeleteProducts();

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = data?.items ?? [];
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
  const canBulkPublish = selectedItems.some(
    (item) => item.status !== "published",
  );
  const canBulkArchive = selectedItems.some(
    (item) => item.status !== "archived",
  );
  const bulkBusy =
    updateProductsStatusMutation.isPending || deleteProductsMutation.isPending;

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

  async function handleStatusChange(
    product: AdminProductListItem,
    nextStatus: ProductStatus,
  ) {
    setActionError(null);
    try {
      await updateStatusMutation.mutateAsync({
        id: product.id,
        status: nextStatus,
        code: product.code,
      });
    } catch (error) {
      setActionError(getSupabaseErrorMessage(error, "products"));
    }
  }

  async function handleFeaturedToggle(product: AdminProductListItem) {
    setActionError(null);
    try {
      await updateFeaturedMutation.mutateAsync({
        id: product.id,
        isFeatured: !product.is_featured,
        code: product.code,
      });
    } catch (error) {
      setActionError(getSupabaseErrorMessage(error, "products"));
    }
  }

  function openImagePreview(product: AdminProductListItem) {
    const images = product.product_images ?? [];
    if (images.length === 0) {
      return;
    }
    setPreviewing(product);
    setPreviewIndex(primaryImageIndex(images));
  }

  const previewImages = previewing?.product_images ?? [];
  const previewCount = previewImages.length;
  const safePreviewIndex =
    previewCount === 0
      ? 0
      : Math.min(Math.max(previewIndex, 0), previewCount - 1);
  const previewUrl =
    previewCount > 0
      ? getCatalogImagePublicUrl(previewImages[safePreviewIndex].storage_path)
      : null;

  async function handleBulkStatusChange(nextStatus: ProductStatus) {
    const ids = selectedItems
      .filter((item) => item.status !== nextStatus)
      .map((item) => item.id);
    if (ids.length === 0) {
      return;
    }
    setActionError(null);
    try {
      await updateProductsStatusMutation.mutateAsync({
        ids,
        status: nextStatus,
      });
      clearSelection();
    } catch (error) {
      setActionError(getSupabaseErrorMessage(error, "products"));
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
        title="No se pudieron cargar los productos"
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
          <h1 className="text-lg font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona el catálogo de gorras.{" "}
            {isFetching ? "Actualizando…" : null}
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/productos/nuevo" />}
        >
          <Plus data-icon="inline-start" />
          Nuevo producto
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por nombre o código…"
          className="sm:max-w-sm"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus((value as ProductStatus | "all") ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Estado">
              {(value: ProductStatus | "all" | null) => {
                if (!value || value === "all") {
                  return "Todos los estados";
                }
                if (value === "draft") {
                  return "Borrador";
                }
                if (value === "published") {
                  return "Publicado";
                }
                return "Archivado";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="archived">Archivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedCount > 0 ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          role="region"
          aria-label="Acciones para productos seleccionados"
        >
          <p className="text-sm font-medium">
            {selectedCount} seleccionado{selectedCount === 1 ? "" : "s"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {canBulkPublish ? (
              <Button
                variant="outline"
                size="sm"
                disabled={bulkBusy}
                onClick={() => {
                  void handleBulkStatusChange("published");
                }}
              >
                <Upload data-icon="inline-start" />
                Publicar
              </Button>
            ) : null}
            {canBulkArchive ? (
              <Button
                variant="outline"
                size="sm"
                disabled={bulkBusy}
                onClick={() => {
                  void handleBulkStatusChange("archived");
                }}
              >
                <Archive data-icon="inline-start" />
                Archivar
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

      {total === 0 && !search && status === "all" ? (
        <QueryEmptyState
          title="Sin productos"
          description="Crea el primer producto del catálogo."
        />
      ) : total === 0 ? (
        <QueryEmptyState
          title="Sin resultados"
          description="Prueba con otros términos de búsqueda o cambia el filtro de estado."
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
                      aria-label="Seleccionar todos los productos de esta página"
                    />
                  </TableHead>
                  <TableHead className="w-20">Foto</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Categorías</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((product) => {
                  const categories = categoryLabels(product);
                  const isSelected = selectedIds.has(product.id);
                  const images = product.product_images ?? [];
                  const imageCount = images.length;
                  const primaryImage =
                    images.find((image) => image.is_primary) ??
                    images[0] ??
                    null;
                  const thumbUrl = primaryImage
                    ? getCatalogImagePublicUrl(primaryImage.storage_path)
                    : null;
                  return (
                    <TableRow
                      key={product.id}
                      data-state={isSelected ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            toggleRow(product.id, checked);
                          }}
                          aria-label={`Seleccionar ${product.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        {thumbUrl ? (
                          <button
                            type="button"
                            onClick={() => openImagePreview(product)}
                            className="relative size-10 shrink-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                            aria-label={
                              imageCount > 1
                                ? `Ver galería de ${product.name} (${imageCount} imágenes)`
                                : `Ver imagen de ${product.name}`
                            }
                          >
                            <span className="relative block size-full overflow-hidden rounded-md border border-border bg-muted transition-opacity hover:opacity-90">
                              <Image
                                src={thumbUrl}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized
                              />
                            </span>
                            {imageCount > 1 ? (
                              <span
                                className="absolute -right-1 -top-1 z-10 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground tabular-nums shadow-sm"
                                aria-hidden
                              >
                                +{imageCount - 1}
                              </span>
                            ) : null}
                          </button>
                        ) : (
                          <span
                            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground"
                            aria-hidden
                          >
                            <ImageIcon className="size-4" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.status === "archived" ? (
                          <TooltipProvider delay={300}>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="text-muted-foreground line-through">
                                {product.name}
                              </span>
                              <Tooltip>
                                <TooltipTrigger
                                  type="button"
                                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                                  aria-label={`${product.name} está archivado`}
                                >
                                  <Info className="size-3.5" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[220px] text-pretty">
                                  Archivado: no se muestra en la tienda ni en
                                  productos destacados.
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          </TooltipProvider>
                        ) : (
                          product.name
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.code}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {formatGtq(product.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {categories.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            categories.map((category) => (
                              <Badge key={category.id} variant="secondary">
                                {category.name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(product.status)}>
                          {STATUS_LABELS[product.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(product.created_at)}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider delay={300}>
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-pressed={product.is_featured}
                                    aria-label={
                                      product.is_featured
                                        ? `Quitar ${product.name} de destacados`
                                        : `Destacar ${product.name}`
                                    }
                                    disabled={updateFeaturedMutation.isPending}
                                    onClick={() => {
                                      void handleFeaturedToggle(product);
                                    }}
                                    className={cn(
                                      "text-muted-foreground hover:text-primary",
                                      product.is_featured &&
                                        "text-primary hover:text-primary-hover",
                                    )}
                                  />
                                }
                              >
                                <Star
                                  className={cn(
                                    product.is_featured && "fill-primary",
                                  )}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                {product.is_featured
                                  ? "Quitar de destacados"
                                  : "Destacar"}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    nativeButton={false}
                                    render={
                                      <Link
                                        href={`/dashboard/productos/${product.id}`}
                                      />
                                    }
                                    aria-label={`Editar ${product.name}`}
                                  />
                                }
                              >
                                <Pencil />
                              </TooltipTrigger>
                              <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                            {product.status !== "published" ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label={`Publicar ${product.name}`}
                                      disabled={updateStatusMutation.isPending}
                                      onClick={() => {
                                        void handleStatusChange(
                                          product,
                                          "published",
                                        );
                                      }}
                                    />
                                  }
                                >
                                  <Upload />
                                </TooltipTrigger>
                                <TooltipContent>Publicar</TooltipContent>
                              </Tooltip>
                            ) : null}
                            {product.status !== "archived" ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label={`Archivar ${product.name}`}
                                      disabled={updateStatusMutation.isPending}
                                      onClick={() => {
                                        void handleStatusChange(
                                          product,
                                          "archived",
                                        );
                                      }}
                                    />
                                  }
                                >
                                  <Archive />
                                </TooltipTrigger>
                                <TooltipContent>Archivar</TooltipContent>
                              </Tooltip>
                            ) : null}
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Eliminar ${product.name}`}
                                    onClick={() => setDeleting(product)}
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
            Página {page} de {totalPages} · {total} producto
            {total === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft data-icon="inline-start" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
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

      <DeleteProductDialog
        product={deleting}
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

      <DeleteProductDialog
        count={selectedCount}
        open={bulkDeleting}
        onOpenChange={setBulkDeleting}
        onConfirm={async () => {
          if (selectedIdList.length === 0) {
            return;
          }
          setActionError(null);
          await deleteProductsMutation.mutateAsync(selectedIdList);
          clearSelection();
        }}
      />

      <Dialog
        open={Boolean(previewing)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewing(null);
          }
        }}
      >
        <DialogContent
          className="max-w-3xl border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl"
          showCloseButton
        >
          <DialogTitle className="sr-only">
            {previewing
              ? `Imagen de ${previewing.name}`
              : "Vista previa de imagen"}
          </DialogTitle>
          {previewUrl ? (
            <div className="relative mx-auto aspect-square w-full max-w-[min(90vw,36rem)] overflow-hidden rounded-xl bg-background">
              <Image
                src={previewUrl}
                alt={previewing ? `Imagen de ${previewing.name}` : ""}
                fill
                className="object-cover"
                sizes="90vw"
                unoptimized
              />
            </div>
          ) : null}
          {previewCount > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={() =>
                  setPreviewIndex((current) =>
                    current <= 0 ? previewCount - 1 : current - 1,
                  )
                }
                aria-label="Imagen anterior"
              >
                <ChevronLeft aria-hidden />
              </Button>
              <p className="min-w-14 text-center text-sm tabular-nums text-background">
                {safePreviewIndex + 1} / {previewCount}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={() =>
                  setPreviewIndex((current) =>
                    current >= previewCount - 1 ? 0 : current + 1,
                  )
                }
                aria-label="Imagen siguiente"
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
