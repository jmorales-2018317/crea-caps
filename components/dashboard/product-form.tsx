"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { cn } from "cn";
import { Info, Star } from "lucide-react";
import { CategoryMultiSelect } from "@/components/dashboard/category-multi-select";
import {
  ProductImagesField,
  type PendingProductImage,
  type ProductImagesDraft,
} from "@/components/dashboard/product-images-field";
import { ProductPartColorsField } from "@/components/dashboard/product-part-colors-field";
import { QueryErrorState } from "@/components/dashboard/query-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/use-colors";
import { productImagesQueryKey } from "@/hooks/use-product-images";
import {
  adminProductDetailQueryKey,
  adminProductsQueryKey,
  publishedProductsQueryKey,
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-products";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import {
  CONSTRUCTION_LABELS,
  CONSTRUCTION_TYPES,
  PRODUCT_STATUSES,
  STATUS_LABELS,
  STRAP_LABELS,
  STRAP_TYPES,
  VISOR_LABELS,
  VISOR_TYPES,
  defaultProductFormValues,
  emptyPartColors,
  getApplicableParts,
  productFormSchema,
  slugifyProductName,
  toSaveAdminProductPayload,
  type ProductFormValues,
} from "@/schemas/products";
import {
  commitProductImageDraft,
  uploadProductImages,
} from "@/services/product-images";
import type { AdminProductDetail, ProductPart } from "@/types/products";

type ProductFormProps = {
  productId?: string;
};

function toFormValues(product: AdminProductDetail): ProductFormValues {
  const attributes = product.product_attributes;
  const partColors = emptyPartColors();
  for (const row of product.product_part_colors) {
    partColors[row.part] = row.color_id;
  }

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku ?? "",
    description: product.description ?? "",
    status: product.status,
    is_featured: product.is_featured,
    category_ids: product.product_categories.map((row) => row.category_id),
    visor_type: attributes?.visor_type ?? "curved",
    construction_type: attributes?.construction_type ?? "closed",
    has_strap: attributes?.has_strap ?? true,
    strap_type: attributes?.has_strap
      ? (attributes.strap_type ?? "snapback")
      : null,
    has_front_logo: attributes?.has_front_logo ?? false,
    part_colors: partColors,
  };
}

function Section({
  title,
  description,
  children,
  className,
  actions,
}: {
  title: ReactNode;
  description: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section
      className={[
        "space-y-4 rounded-xl border border-border p-4 sm:p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-0.5">{actions}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function OptionalLabel() {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium leading-none text-muted-foreground">
      Opcional
    </span>
  );
}

function ProductFormFields({
  productId,
  initialValues,
}: {
  productId?: string;
  initialValues: ProductFormValues;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const colorsQuery = useColors();
  const [pendingImages, setPendingImages] = useState<PendingProductImage[]>(
    [],
  );
  const [imageDraft, setImageDraft] = useState<ProductImagesDraft>({
    savedImages: [],
    baselineImages: [],
    removedImageIds: [],
  });
  const [formError, setFormError] = useState<string | null>(() =>
    searchParams.get("images_error") === "1"
      ? "El producto se creó, pero algunas imágenes no se pudieron subir. Reinténtalo desde esta galería."
      : null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageUploadMessage, setImageUploadMessage] = useState<string | null>(
    null,
  );
  const [slugManual, setSlugManual] = useState(Boolean(productId));

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues,
  });

  const constructionType = useWatch({
    control: form.control,
    name: "construction_type",
  });
  const hasStrap = useWatch({ control: form.control, name: "has_strap" });
  const partColors = useWatch({ control: form.control, name: "part_colors" });

  const applicableParts = useMemo(
    () => getApplicableParts(constructionType, hasStrap),
    [constructionType, hasStrap],
  );

  const activeColors = useMemo(
    () => (colorsQuery.data ?? []).filter((color) => color.is_active),
    [colorsQuery.data],
  );

  useEffect(() => {
    const applicable = new Set(applicableParts);
    const current = form.getValues("part_colors");
    let changed = false;
    const next = { ...current };
    for (const part of Object.keys(next) as ProductPart[]) {
      if (!applicable.has(part) && next[part] !== null) {
        next[part] = null;
        changed = true;
      }
    }
    if (changed) {
      form.setValue("part_colors", next, { shouldValidate: true });
    }
  }, [applicableParts, form]);

  useEffect(() => {
    if (!hasStrap) {
      form.setValue("strap_type", null, { shouldValidate: true });
    } else if (!form.getValues("strap_type")) {
      form.setValue("strap_type", "snapback", { shouldValidate: true });
    }
  }, [form, hasStrap]);

  useEffect(() => {
    if (activeColors.length === 0) {
      return;
    }
    const currentAll = form.getValues("part_colors.all");
    if (!currentAll) {
      form.setValue("part_colors.all", activeColors[0].id, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [activeColors, form]);

  const nameRegister = form.register("name");
  const slugRegister = form.register("slug");

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null);
    setSuccessMessage(null);
    setImageUploadMessage(null);
    const payload = toSaveAdminProductPayload(values, productId);
    try {
      if (productId) {
        await updateMutation.mutateAsync({ id: productId, payload });
        setImageUploadMessage("Actualizando imágenes…");
        const imageResult = await commitProductImageDraft({
          productId,
          savedImages: imageDraft.savedImages,
          baselineImages: imageDraft.baselineImages,
          removedImageIds: imageDraft.removedImageIds,
          pendingFiles: pendingImages.map((item) => item.file),
        });

        for (const item of pendingImages) {
          URL.revokeObjectURL(item.previewUrl);
        }
        setPendingImages([]);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: productImagesQueryKey(productId),
          }),
          queryClient.invalidateQueries({
            queryKey: adminProductDetailQueryKey(productId),
          }),
          queryClient.invalidateQueries({ queryKey: adminProductsQueryKey }),
          queryClient.invalidateQueries({
            queryKey: publishedProductsQueryKey,
          }),
        ]);
        setImageUploadMessage(null);

        if (imageResult.uploadErrors.length) {
          setFormError(
            [
              "El producto se actualizó, pero algunas imágenes no se pudieron guardar.",
              ...imageResult.uploadErrors.map(
                (entry) => `${entry.fileName}: ${entry.error}`,
              ),
            ].join(" "),
          );
          return;
        }

        if (imageResult.storageWarning) {
          setFormError(imageResult.storageWarning);
          return;
        }

        setSuccessMessage("Producto actualizado correctamente.");
        router.push("/dashboard/productos");
        router.refresh();
        return;
      }

      const newId = await createMutation.mutateAsync(payload);
      const pendingFiles = pendingImages.map((item) => item.file);

      if (pendingFiles.length > 0) {
        setImageUploadMessage("Subiendo imágenes…");
        const { errors } = await uploadProductImages(newId, pendingFiles);
        for (const item of pendingImages) {
          URL.revokeObjectURL(item.previewUrl);
        }
        setPendingImages([]);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: productImagesQueryKey(newId),
          }),
          queryClient.invalidateQueries({
            queryKey: adminProductDetailQueryKey(newId),
          }),
          queryClient.invalidateQueries({ queryKey: adminProductsQueryKey }),
          queryClient.invalidateQueries({
            queryKey: publishedProductsQueryKey,
          }),
        ]);

        if (errors.length > 0) {
          setImageUploadMessage(null);
          router.push(`/dashboard/productos/${newId}?images_error=1`);
          router.refresh();
          return;
        }
      }

      setImageUploadMessage(null);
      setSuccessMessage("Producto creado correctamente.");
      router.push("/dashboard/productos");
      router.refresh();
    } catch (error) {
      setImageUploadMessage(null);
      setFormError(getSupabaseErrorMessage(error, "products"));
    }
  };

  if (colorsQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (colorsQuery.isError) {
    return (
      <QueryErrorState
        title="No se pudieron cargar los colores"
        message="Necesitas colores para configurar el producto."
        onRetry={() => {
          void colorsQuery.refetch();
        }}
      />
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form
      className="space-y-6 pb-10"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          {productId ? "Editar producto" : "Nuevo producto"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Completa los datos del producto. Las categorías son opcionales.
        </p>
      </div>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}
      {successMessage ? (
        <p
          className="text-sm text-success"
          role="status"
        >
          {successMessage}
        </p>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Section
          className="h-full"
          title="Información general"
          description="Datos básicos y estado de publicación."
          actions={
            <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  aria-label="Qué significa producto destacado"
                >
                  <Info className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[220px] text-pretty">
                  Se muestra como producto destacado en la tienda cuando está
                  publicado.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
              <Controller
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <Button
                    type="button"
                    id="product-featured"
                    variant="ghost"
                    size="icon-sm"
                    aria-pressed={field.value}
                    aria-label={
                      field.value
                        ? "Quitar de productos destacados"
                        : "Marcar como producto destacado"
                    }
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "text-muted-foreground hover:text-primary",
                      field.value && "text-primary hover:text-primary-hover",
                    )}
                  >
                    <Star
                      className={cn(
                        "size-4 transition-colors",
                        field.value && "fill-primary",
                      )}
                    />
                  </Button>
                )}
              />
            </>
          }
        >
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="product-name">Nombre</Label>
              <Input
                id="product-name"
                {...nameRegister}
                onChange={(event) => {
                  void nameRegister.onChange(event);
                  if (!slugManual) {
                    form.setValue(
                      "slug",
                      slugifyProductName(event.target.value),
                      {
                        shouldValidate: true,
                      },
                    );
                  }
                }}
              />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product-slug">Slug</Label>
              <Input
                id="product-slug"
                {...slugRegister}
                onChange={(event) => {
                  setSlugManual(true);
                  void slugRegister.onChange(event);
                }}
              />
              {form.formState.errors.slug ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>Estado</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: ProductFormValues["status"] | null) =>
                          value ? STATUS_LABELS[value] : null
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="product-description">Descripción</Label>
              <Textarea
                id="product-description"
                rows={4}
                {...form.register("description")}
              />
            </div>
          </div>
        </Section>

        <Section
          className="h-full"
          title="Características físicas"
          description="Cada producto representa una configuración concreta."
        >
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tipo de visera</Label>
              <Controller
                control={form.control}
                name="visor_type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: ProductFormValues["visor_type"] | null) =>
                          value ? VISOR_LABELS[value] : null
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {VISOR_TYPES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {VISOR_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label>Construcción</Label>
              <Controller
                control={form.control}
                name="construction_type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(
                          value: ProductFormValues["construction_type"] | null,
                        ) => (value ? CONSTRUCTION_LABELS[value] : null)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CONSTRUCTION_TYPES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {CONSTRUCTION_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 sm:col-span-2">
              <Label htmlFor="product-has-strap">Tiene cincho</Label>
              <Controller
                control={form.control}
                name="has_strap"
                render={({ field }) => (
                  <Switch
                    id="product-has-strap"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        if (!form.getValues("strap_type")) {
                          form.setValue("strap_type", "snapback", {
                            shouldValidate: true,
                          });
                        }
                      } else {
                        form.setValue("strap_type", null, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                )}
              />
            </div>

            {hasStrap ? (
              <div className="grid gap-2 sm:col-span-2">
                <Label>Tipo de cincho</Label>
                <Controller
                  control={form.control}
                  name="strap_type"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "snapback"}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona tipo">
                          {(value: ProductFormValues["strap_type"] | null) =>
                            value ? STRAP_LABELS[value] : null
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STRAP_TYPES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {STRAP_LABELS[value]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.strap_type ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.strap_type.message}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 sm:col-span-2">
              <Label htmlFor="product-front-logo">Tiene logo frontal</Label>
              <Controller
                control={form.control}
                name="has_front_logo"
                render={({ field }) => (
                  <Switch
                    id="product-front-logo"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Colores por parte"
        description="Elige una parte y luego un color. El color general se elige de la lista; Auto en las demás partes usa ese color."
      >
        <ProductPartColorsField
          parts={applicableParts}
          colors={activeColors}
          value={partColors ?? {}}
          onChange={(part, colorId) => {
            form.setValue(`part_colors.${part}`, colorId, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />
      </Section>

      <Section
        title="Imágenes"
        description="Sube una o varias fotos, elige la principal y ordena la galería. Los cambios se guardan al enviar el formulario."
      >
        <ProductImagesField
          productId={productId}
          disabled={isSubmitting}
          pendingImages={pendingImages}
          onPendingImagesChange={setPendingImages}
          onDraftChange={setImageDraft}
        />
        {imageUploadMessage ? (
          <p className="text-sm text-muted-foreground" role="status">
            {imageUploadMessage}
          </p>
        ) : null}
      </Section>

      <Section
        title={
          <span className="flex flex-wrap items-center gap-2">
            Categorías
            <OptionalLabel />
          </span>
        }
        description="Busca y asigna una o varias categorías. Puedes crear una nueva al vuelo."
      >
        <Controller
          control={form.control}
          name="category_ids"
          render={({ field }) => (
            <CategoryMultiSelect
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6 lg:left-64">
        <div className="pointer-events-auto flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/productos" />}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar producto"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function ProductForm({ productId }: ProductFormProps) {
  const detailQuery = useAdminProduct(productId);

  if (productId) {
    if (detailQuery.isPending) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (detailQuery.isError || !detailQuery.data) {
      return (
        <QueryErrorState
          title="No se pudo cargar el producto"
          message="Verifica que el producto exista o inténtalo de nuevo."
          onRetry={() => {
            void detailQuery.refetch();
          }}
        />
      );
    }

    return (
      <ProductFormFields
        key={detailQuery.data.id}
        productId={productId}
        initialValues={toFormValues(detailQuery.data)}
      />
    );
  }

  return (
    <ProductFormFields
      key="new"
      initialValues={defaultProductFormValues()}
    />
  );
}
