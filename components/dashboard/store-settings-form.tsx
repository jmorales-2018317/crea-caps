"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type Control,
  type FieldArrayWithId,
} from "react-hook-form";
import { QueryErrorState } from "@/components/dashboard/query-state";
import { StoreContactIcon } from "@/components/shared/store-contact-icon";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useSaveStoreSettings,
  useStoreSettings,
} from "@/hooks/use-store-settings";
import { FALLBACK_LOGO } from "@/lib/constants/store";
import {
  getCatalogImagePublicUrl,
  validateImageFile,
} from "@/lib/catalog-images";
import {
  MAX_STORE_CONTACTS,
  STORE_CONTACT_DIRECT_KINDS,
  STORE_CONTACT_KIND_LABELS,
  STORE_CONTACT_KIND_PLACEHOLDERS,
  STORE_CONTACT_SOCIAL_KINDS,
  contactValueShape,
  createStoreDirectContact,
  splitStoreContacts,
  type StoreContactDirectKind,
  type StoreContactSocialKind,
} from "@/lib/store-contacts";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import {
  storeSettingsFormSchema,
  toStoreSettingsPayload,
  type StoreSettingsFormValues,
} from "@/schemas/store-settings";
import type { StoreSettingsPublic } from "@/types/store-settings";

type LogoDraft = {
  file: File;
  previewUrl: string;
};

function settingsToFormValues(
  settings: StoreSettingsPublic,
): StoreSettingsFormValues {
  const { socials, contacts } = splitStoreContacts(settings.contacts);

  return {
    store_name: settings.store_name ?? "",
    description: settings.description ?? "",
    socials,
    contacts: contacts.map((contact) => ({
      id: contact.id,
      kind: contact.kind,
      value: contact.value,
      label: contact.label ?? "",
    })),
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

export function StoreSettingsForm() {
  const settingsQuery = useStoreSettings();

  if (settingsQuery.isPending) {
    return (
      <div className="space-y-6 pb-10">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4 rounded-xl border border-border p-4 sm:p-5"
            >
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-xl border border-border p-4 sm:p-5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <QueryErrorState
        title="No se pudo cargar la configuración"
        message={getSupabaseErrorMessage(
          settingsQuery.error,
          "store_settings",
        )}
        onRetry={() => {
          void settingsQuery.refetch();
        }}
      />
    );
  }

  return <StoreSettingsFormFields settings={settingsQuery.data} />;
}

function StoreSettingsFormFields({
  settings,
}: {
  settings: StoreSettingsPublic;
}) {
  const saveMutation = useSaveStoreSettings();
  const [logoDraft, setLogoDraft] = useState<LogoDraft | null>(null);
  const [clearLogo, setClearLogo] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsFormSchema),
    defaultValues: settingsToFormValues(settings),
  });
  const { isDirty: isFormDirty } = form.formState;

  const contactsField = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const socials = useWatch({
    control: form.control,
    name: "socials",
  });
  const filledSocialCount = STORE_CONTACT_SOCIAL_KINDS.filter(
    (kind) => socials?.[kind]?.value?.trim(),
  ).length;
  const canAddContact =
    filledSocialCount + contactsField.fields.length < MAX_STORE_CONTACTS;

  const effectiveSettings = saveMutation.data ?? settings;
  const currentLogoPath = effectiveSettings.logo_path ?? null;
  const isLogoDirty =
    logoDraft !== null || (clearLogo && currentLogoPath !== null);
  const isDirty = isFormDirty || isLogoDirty;
  const displayLogoSrc =
    logoDraft?.previewUrl ??
    (clearLogo || !currentLogoPath
      ? FALLBACK_LOGO
      : getCatalogImagePublicUrl(currentLogoPath) || FALLBACK_LOGO);

  function revokeDraft(draft: LogoDraft | null) {
    if (draft) {
      URL.revokeObjectURL(draft.previewUrl);
    }
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setFormError(null);

    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setFormError(validationError);
      setFileInputKey((key) => key + 1);
      return;
    }

    revokeDraft(logoDraft);
    setLogoDraft({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setClearLogo(false);
  }

  function handleClearLogo() {
    revokeDraft(logoDraft);
    setLogoDraft(null);
    setClearLogo(true);
    setFileInputKey((key) => key + 1);
    setFormError(null);
  }

  function handleDiscard() {
    revokeDraft(logoDraft);
    setLogoDraft(null);
    setClearLogo(false);
    setFileInputKey((key) => key + 1);
    setFormError(null);
    form.reset(settingsToFormValues(effectiveSettings));
  }

  async function onValid(values: StoreSettingsFormValues) {
    setFormError(null);

    try {
      const updated = await saveMutation.mutateAsync({
        fields: toStoreSettingsPayload(values),
        logoFile: logoDraft?.file ?? null,
        clearLogo: clearLogo && !logoDraft,
      });
      revokeDraft(logoDraft);
      setLogoDraft(null);
      setClearLogo(false);
      setFileInputKey((key) => key + 1);
      form.reset(settingsToFormValues(updated));
    } catch (error) {
      setFormError(getSupabaseErrorMessage(error, "store_settings"));
    }
  }

  return (
    <FormProvider {...form}>
      <form
        className="space-y-6 pb-10"
        onSubmit={form.handleSubmit(onValid)}
        noValidate
      >
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Configuración de la tienda
          </h1>
          <p className="text-sm text-muted-foreground">
            Esta información se muestra en el encabezado, el pie y los enlaces de
            contacto de la tienda pública.
          </p>
        </div>

        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Section
            className="h-full"
            title="Información general"
            description="Nombre, descripción y logotipo visibles en la tienda."
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="store-name">Nombre de la tienda</Label>
                <Input
                  id="store-name"
                  autoComplete="organization"
                  aria-invalid={Boolean(form.formState.errors.store_name)}
                  {...form.register("store_name")}
                />
                {form.formState.errors.store_name ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.store_name.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="store-description">Descripción</Label>
                <Textarea
                  id="store-description"
                  rows={3}
                  aria-invalid={Boolean(form.formState.errors.description)}
                  {...form.register("description")}
                />
                {form.formState.errors.description ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3">
                <Label>Logotipo</Label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex size-28 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 p-3">
                    {displayLogoSrc ? (
                      <Image
                        src={displayLogoSrc}
                        alt="Vista previa del logotipo"
                        width={148}
                        height={58}
                        className="h-auto max-h-16 w-auto max-w-full object-contain"
                        unoptimized={Boolean(logoDraft)}
                      />
                    ) : (
                      <ImageIcon
                        className="size-8 text-muted-foreground"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                      key={fileInputKey}
                      id="store-logo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="sr-only"
                      onChange={handleLogoChange}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          document.getElementById("store-logo")?.click();
                        }}
                      >
                        <Upload className="size-4" aria-hidden />
                        Subir imagen
                      </Button>
                      {(currentLogoPath && !clearLogo) || logoDraft ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearLogo}
                        >
                          <Trash2 className="size-4" aria-hidden />
                          Quitar logo
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, WebP o AVIF. Máximo 5 MB. Si no hay logo, se usa
                      el predeterminado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section
            className="h-full"
            title="Redes sociales"
            description="Deja vacío el canal que no quieras mostrar en la tienda."
          >
            <div className="grid gap-4">
              {STORE_CONTACT_SOCIAL_KINDS.map((kind) => (
                <SocialNetworkField key={kind} kind={kind} />
              ))}
            </div>
          </Section>
        </div>

        <Section
          title="Contacto"
          description={`Correo, teléfono, sitio web u otros enlaces. Máximo ${MAX_STORE_CONTACTS} canales en total con las redes.`}
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canAddContact}
              onClick={() => {
                contactsField.append(createStoreDirectContact("email"));
              }}
            >
              <Plus className="size-4" aria-hidden />
              Añadir
            </Button>
          }
        >
          {contactsField.fields.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              Sin canales de contacto adicionales. Puedes añadir correo,
              teléfono, sitio web o un enlace personalizado.
            </p>
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {contactsField.fields.map((field, index) => (
                <StoreContactRow
                  key={field.id}
                  field={field}
                  index={index}
                  total={contactsField.fields.length}
                  control={form.control}
                  onMoveUp={() => contactsField.move(index, index - 1)}
                  onMoveDown={() => contactsField.move(index, index + 1)}
                  onRemove={() => contactsField.remove(index)}
                />
              ))}
            </ul>
          )}

          {form.formState.errors.contacts?.root?.message ||
          form.formState.errors.contacts?.message ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.contacts?.root?.message ??
                form.formState.errors.contacts?.message}
            </p>
          ) : null}
        </Section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5" aria-live="polite">
            {isDirty ? (
              <p className="text-sm text-muted-foreground" role="status">
                Hay cambios sin guardar.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || saveMutation.isPending}
              onClick={handleDiscard}
            >
              Descartar cambios
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || saveMutation.isPending}
            >
              {saveMutation.isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function SocialNetworkField({ kind }: { kind: StoreContactSocialKind }) {
  const form = useFormContext<StoreSettingsFormValues>();
  const shape = contactValueShape(kind);
  const value = useWatch({
    control: form.control,
    name: `socials.${kind}.value`,
  });
  const hasValue = Boolean(value?.trim());
  const error = form.formState.errors.socials?.[kind]?.value?.message;

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={[
            "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border",
            hasValue
              ? "border-border bg-muted/40 text-text-secondary"
              : "border-border/50 bg-muted/20 text-text-subtle opacity-40",
          ].join(" ")}
        >
          <StoreContactIcon kind={kind} className="size-4" />
        </span>
        <input type="hidden" {...form.register(`socials.${kind}.id`)} />
        <Input
          id={`social-${kind}`}
          type={shape === "phone" ? "tel" : "url"}
          inputMode={shape === "phone" ? "tel" : undefined}
          placeholder={STORE_CONTACT_KIND_PLACEHOLDERS[kind]}
          aria-label={STORE_CONTACT_KIND_LABELS[kind]}
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1"
          {...form.register(`socials.${kind}.value`)}
        />
      </div>
      {error ? (
        <p className="pl-[3.25rem] text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

function StoreContactRow({
  field,
  index,
  total,
  control,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  field: FieldArrayWithId<StoreSettingsFormValues, "contacts", "id">;
  index: number;
  total: number;
  control: Control<StoreSettingsFormValues>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const form = useFormContext<StoreSettingsFormValues>();
  const kind = useWatch({
    control,
    name: `contacts.${index}.kind`,
  });
  const shape = contactValueShape(kind);
  const valueError =
    form.formState.errors.contacts?.[index]?.value?.message;
  const labelError =
    form.formState.errors.contacts?.[index]?.label?.message;

  return (
    <li className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-end gap-2">
        <div className="grid min-w-0 flex-1 gap-2">
          <Label htmlFor={`contact-kind-${field.id}`}>Tipo</Label>
          <Controller
            control={control}
            name={`contacts.${index}.kind`}
            render={({ field: kindField }) => (
              <Select
                value={kindField.value}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }
                  const nextKind = value as StoreContactDirectKind;
                  kindField.onChange(nextKind);
                  if (nextKind === "custom") {
                    form.setValue(
                      `contacts.${index}.label`,
                      form.getValues(`contacts.${index}.label`) || "",
                    );
                  } else {
                    form.setValue(`contacts.${index}.label`, "");
                  }
                }}
              >
                <SelectTrigger
                  id={`contact-kind-${field.id}`}
                  className="w-full"
                >
                  <SelectValue>
                    {(value: StoreContactDirectKind | null) =>
                      value ? STORE_CONTACT_KIND_LABELS[value] : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STORE_CONTACT_DIRECT_KINDS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {STORE_CONTACT_KIND_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Subir"
            disabled={index === 0}
            onClick={onMoveUp}
          >
            <ArrowUp className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Bajar"
            disabled={index === total - 1}
            onClick={onMoveDown}
          >
            <ArrowDown className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Eliminar contacto"
            onClick={onRemove}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`contact-value-${field.id}`}>
          {shape === "email"
            ? "Correo"
            : shape === "phone"
              ? "Número"
              : "URL"}
        </Label>
        <Input
          id={`contact-value-${field.id}`}
          type={
            shape === "email" ? "email" : shape === "url" ? "url" : "tel"
          }
          inputMode={shape === "phone" ? "tel" : undefined}
          placeholder={STORE_CONTACT_KIND_PLACEHOLDERS[kind]}
          aria-invalid={Boolean(valueError)}
          {...form.register(`contacts.${index}.value`)}
        />
        {valueError ? (
          <p className="text-xs text-destructive">{valueError}</p>
        ) : null}
      </div>

      {kind === "custom" ? (
        <div className="grid gap-2">
          <Label htmlFor={`contact-label-${field.id}`}>
            Nombre del enlace
          </Label>
          <Input
            id={`contact-label-${field.id}`}
            placeholder="Ej. Catálogo PDF"
            aria-invalid={Boolean(labelError)}
            {...form.register(`contacts.${index}.label`)}
          />
          {labelError ? (
            <p className="text-xs text-destructive">{labelError}</p>
          ) : null}
        </div>
      ) : null}

      <input type="hidden" {...form.register(`contacts.${index}.id`)} />
    </li>
  );
}
