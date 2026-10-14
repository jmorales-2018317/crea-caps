"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { CategoryFormDialog } from "@/components/dashboard/category-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  categoriesQueryKey,
  useCategoriesByIds,
  useCreateCategory,
  useSearchCategories,
} from "@/hooks/use-categories";
import { toCategoryPayload } from "@/schemas/categories";
import type { Category } from "@/types/categories";

function categoriesByIdsKey(ids: string[]) {
  return [...categoriesQueryKey, "by-ids", [...ids].sort()] as const;
}

type CategoryMultiSelectProps = {
  value: string[];
  onChange: (ids: string[]) => void;
};

type SelectedCategoryBadgesProps = {
  value: string[];
  onChange: (ids: string[]) => void;
};

export function SelectedCategoryBadges({
  value,
  onChange,
}: SelectedCategoryBadgesProps) {
  const selectedQuery = useCategoriesByIds(value);

  const selectedCategories = useMemo(() => {
    const byId = new Map(
      (selectedQuery.data ?? []).map((category) => [category.id, category]),
    );
    return value
      .map((id) => byId.get(id))
      .filter((category): category is Category => Boolean(category));
  }, [selectedQuery.data, value]);

  if (value.length === 0) {
    return null;
  }

  if (selectedCategories.length === 0 && selectedQuery.isPending) {
    return (
      <span className="text-sm font-normal text-muted-foreground">
        Cargando categorías…
      </span>
    );
  }

  if (selectedCategories.length === 0) {
    return null;
  }

  return (
    <span className="flex flex-wrap gap-2">
      {selectedCategories.map((category) => (
        <Badge
          key={category.id}
          variant={category.is_active ? "secondary" : "outline"}
          className="gap-1 pr-1 font-normal"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <span>{category.name}</span>
          {!category.is_active ? (
            <span className="text-[10px] font-normal text-muted-foreground">
              (inactiva)
            </span>
          ) : null}
          <button
            type="button"
            className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
            aria-label={`Quitar ${category.name}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onChange(value.filter((categoryId) => categoryId !== category.id));
            }}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </span>
  );
}

export function CategoryMultiSelect({
  value,
  onChange,
}: CategoryMultiSelectProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const queryClient = useQueryClient();
  const createMutation = useCreateCategory();
  const searchQuery = useSearchCategories(debouncedSearch);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const availableCategories = useMemo(() => {
    const selected = new Set(value);
    return (searchQuery.data ?? []).filter(
      (category) => !selected.has(category.id),
    );
  }, [searchQuery.data, value]);

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  const addCategory = (category: Category) => {
    if (value.includes(category.id)) {
      clearSearch();
      return;
    }

    const nextIds = [...value, category.id];
    const previous =
      queryClient.getQueryData<Category[]>(categoriesByIdsKey(value)) ?? [];
    const nextCategories = [
      ...previous.filter((item) => item.id !== category.id),
      category,
    ];
    queryClient.setQueryData(categoriesByIdsKey(nextIds), nextCategories);
    onChange(nextIds);
    clearSearch();
  };

  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <Combobox
          multiple
          items={availableCategories}
          // Selection is owned by the form (badges in the section header).
          // Keep Combobox empty so it only acts as a search-and-add field.
          value={[]}
          inputValue={search}
          onValueChange={(categories) => {
            const category = categories.at(-1);
            if (category) {
              addCategory(category);
            }
          }}
          onInputValueChange={(next, details) => {
            if (
              details.reason === "item-press" ||
              details.reason === "input-clear"
            ) {
              clearSearch();
              return;
            }
            setSearch(next);
          }}
          itemToStringLabel={(category: Category) => category.name}
          isItemEqualToValue={(a: Category, b: Category) => a.id === b.id}
          filter={null}
        >
          <ComboboxInput
            className="w-full"
            placeholder="Buscar categoría…"
            showClear={search.length > 0}
          />
          <ComboboxContent className="w-(--anchor-width)">
            <ComboboxEmpty>
              {searchQuery.isFetching
                ? "Buscando…"
                : "No se encontraron categorías."}
            </ComboboxEmpty>
            <ComboboxList>
              {(category: Category) => (
                <ComboboxItem key={category.id} value={category}>
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="truncate">{category.name}</span>
                    {!category.is_active ? (
                      <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Inactiva
                      </span>
                    ) : null}
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <Button
        type="button"
        size="icon"
        aria-label="Crear categoría"
        onClick={() => setCreateOpen(true)}
      >
        <Plus />
      </Button>

      <CategoryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (values) => {
          const created = await createMutation.mutateAsync(
            toCategoryPayload(values),
          );
          addCategory(created);
        }}
      />
    </div>
  );
}
